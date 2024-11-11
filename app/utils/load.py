import os
import yaml

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SETTINGS_FILE = os.path.join(BASE_DIR, "../settings.yaml")


def settings():
    with open(SETTINGS_FILE, encoding="utf-8") as f:
        return yaml.load(f, Loader=yaml.FullLoader)