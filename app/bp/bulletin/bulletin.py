from flask import Blueprint

from utils.sse import Bulletin

bp = Blueprint('bulletin', __name__, url_prefix='/bulletin')


@bp.route('/subscribe')
def subscribe():
    return Bulletin.get_instance().subscribe()
