import time
from flask import Blueprint, request

from utils.resource import Resource
from utils.sse import console_output_handler
from ChatTTS.utils.vm import RSVExecutor

RSVExecutor.get_instance().set_handler_func(console_output_handler)

bp = Blueprint('resource', __name__, url_prefix='/resource')
resource_service = Resource()


@bp.route('/default', methods=('GET', 'POST'))
def default():
    if request.method == 'GET':
        resource_service.download_chattts_models()
    return 'OK'




