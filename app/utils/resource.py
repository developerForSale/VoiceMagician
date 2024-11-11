import logging
import ChatTTS

from utils import load

settings = load.settings()


class Resource:

    def __init__(self):
        self.chat = ChatTTS.Chat()

    def download_chattts_models(self):
        logging.getLogger('ChatTTS').setLevel(logging.INFO)
        self.chat.download_models(voice_magician_flag=True)
