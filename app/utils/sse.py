import re
import uuid
import gevent
import logging

from typing import Iterator
from collections import deque
from flask import Response, request
from gevent.queue import Queue

# Some frameworks, such as gunicorn, handle monkey-patching for you. Check their documentation to be sure.
from gevent.monkey import patch_all
patch_all()


class ServerSentEvent(object):
    def __init__(self, event: str = '', level: int = logging.NOTSET):
        self._event_id = str(uuid.uuid4())
        self._event = event
        self._level = level
        self._str_dict = {
            'data': self._event,
            'event': self._level,
            'id': self._event_id
        }

    def get_id(self) -> str:
        return self._event_id

    def encode(self) -> str:
        if not self._event:
            return ''
        event_str = [
            "{}: {}".format(key, name) for key, name in self._str_dict.items()
        ]
        return "{}\n\n".format("\n".join(event_str))


# Thanks to Samuel Carlsson's idea from https://github.com/singingwolfboy/flask-sse/issues/7
class Bulletin(object):
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Bulletin, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, '_initialized'):
            self.subscriptions = []
            self.history = deque(maxlen=32)
            self.history.append(ServerSentEvent('Notification bulletin initialized.', logging.INFO))
            self._initialized = True

    @classmethod
    def get_instance(cls):
        return cls()

    def _add_historical_events_to_sub_queue(self, q, last_id):
        add = False
        for sse in self.history:
            if add:
                q.put(sse)
            if sse.get_id() == last_id:
                add = True

    def event_generator(self, last_id) -> Iterator[ServerSentEvent]:
        """Yields encoded ServerSentEvents."""
        q = Queue()
        self._add_historical_events_to_sub_queue(q, last_id)
        self.subscriptions.append(q)
        try:
            while True:
                try:
                    yield q.get_nowait()
                except gevent.queue.Empty:
                    gevent.sleep(1)
                    continue
        except GeneratorExit:
            self.subscriptions.remove(q)

    def subscribe(self):
        def gen(last_id) -> Iterator[str]:
            for sse in self.event_generator(last_id):
                yield sse.encode()
        return Response(
            gen(request.headers.get('Last-Event-ID')),
            mimetype="text/event-stream"
        )

    def notify(self, message):
        """Notify all subscribers with message."""
        for sub in self.subscriptions[:]:
            sub.put(message)

    def publish(self, level: int = logging.NOTSET, event: str = ''):
        sse = ServerSentEvent(level=level, event=event)
        self.history.append(sse)
        gevent.spawn(self.notify, sse)

    # def get_last_id(self) -> str:
    #     return self.history[-1].get_id()


bulletin = Bulletin()


def console_output_handler(event: str = '', level: int = logging.NOTSET):
    def remove_ansi_escape_sequences(text):
        return re.sub(r'\x1b\[([0-9,A-Z]{1,2}(;[0-9]{1,2})?(;[0-9]{3})?)?[m|K]?', '', text)
    clean_text = remove_ansi_escape_sequences(event)
    Bulletin.get_instance().publish(level=level, event=clean_text)
