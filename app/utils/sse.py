import re
import uuid
import json
import gevent
import logging

from typing import Iterator
from collections import deque
from flask import Response, request
from gevent.queue import Queue

# Some frameworks, such as gunicorn, handle monkey-patching for you. Check their documentation to be sure.
from gevent.monkey import patch_all

patch_all()


# Handle logging for the SSE.
class LoggerHandler(logging.Handler):
    def __init__(self, bulletin_instance):
        self.bulletin = bulletin_instance
        super().__init__()

    def emit(self, record):
        self.bulletin.publish(event=record.getMessage(), level=record.levelno)


class ServerSentEvent(object):
    def __init__(self, event: str = '', level: int = logging.NOTSET, last: str = ''):
        self._event_id = str(uuid.uuid4())
        self._event_level = level
        self._event = {
            'event': event,
            'level': str(self._event_level),
            'id': self._event_id
        }
        self._last_event_id_text = last

    def get_id(self) -> str:
        return self._event_id

    def encode(self) -> str:
        lines = [
            'data: {}'.format(json.dumps(self._event)),
            'id: {}'.format(self._event_id)
        ]
        return "\n".join(lines) + "\n\n"


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
            self.history = deque(maxlen=20)
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
            gen(request.headers.get('lastEventId')),
            mimetype="text/event-stream"
        )

    def notify(self, message):
        """Notify all subscribers with message."""
        for sub in self.subscriptions[:]:
            sub.put(message)

    def publish(self, event, level: int = logging.NOTSET):
        sse = ServerSentEvent(level=level, event=event, last=self.get_last_id())
        self.history.append(sse)
        gevent.spawn(self.notify, sse)

    def get_last_id(self) -> str:
        return self.history[-1].get_id()


bulletin = Bulletin()


########################################################################################################################
# Handle RSV executor console output from ChatTTS models download process.
def _remove_ansi_escape_sequences(text):
    """There are colors encoded in the output. Remove them."""
    return re.sub(r'\x1b\[([0-9,A-Z]{1,2}(;[0-9]{1,2})?(;[0-9]{3})?)?[m|K]?', '', text)


def _classify_and_wrap_data(text, group_id):
    level_str, event_str = text.split(' ', 1)
    level = logging.NOTSET
    if level_str == '[INFO]':
        level = logging.INFO
    elif level_str == '[WARNING]':
        level = logging.WARNING
    elif level_str == '[ERROR]':
        level = logging.ERROR
    elif level_str == '[FATAL]' or level_str == '[PANIC]':
        level = logging.CRITICAL
    phase = '0'
    info_type = 'plain'
    info_str = event_str
    if event_str.startswith('#'):
        phase_str, info_str = event_str.split(' ', 1)
        phase = phase_str.lstrip('#')
        if info_str.startswith('['):
            info_type = 'progress'
    return level, {'group': group_id, 'RSVePhase': phase, 'type': info_type, 'info': info_str}


def console_output_handler(event: str, group_id: str):
    """For RSV executor from ChatTTS."""
    clean_text = _remove_ansi_escape_sequences(event)
    level, event = _classify_and_wrap_data(clean_text, group_id)
    Bulletin.get_instance().publish(level=level, event=event)
########################################################################################################################
