from flask import Blueprint, request

from utils.resource import Resource

bp = Blueprint('resource', __name__, url_prefix='/resource')
resource_service = Resource()


@bp.route('/default', methods=('GET', 'POST'))
def default():
    if request.method == 'GET':
        resource_service.download_chattts_models()
    return 'OK'




