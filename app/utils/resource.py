import logging
import ChatTTS

from utils import load
from utils.sse import Bulletin, LoggerHandler, console_output_handler
from ChatTTS.utils.vm import RSVExecutor

RSVExecutor.get_instance().set_handler_func(console_output_handler)

settings = load.settings()
logger = logging.getLogger('ChatTTS')
logger.setLevel(logging.INFO)
logger.addHandler(LoggerHandler(Bulletin.get_instance()))


class Resource:

    def __init__(self):
        self.chat = ChatTTS.Chat()

    def download_chattts_models(self):
        self.chat.download_models(voice_magician_flag=True)
