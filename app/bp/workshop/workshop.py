from flask import Blueprint, render_template

bp = Blueprint('workshop', __name__)


@bp.route('/', methods=('GET', 'POST'))
def index():
    return render_template('workshop/index.html')
