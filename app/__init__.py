import os

from flask import Flask
from flask_cors import CORS


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # when the day comes, check the official documentation of the flask-cors module to learn how to tweak the settings.
    CORS(app)
    app.config.from_mapping(
        SECRET_KEY='dev'
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from bp.workshop import workshop
    from bp.bulletin import bulletin
    from bp.resource import resource

    app.register_blueprint(workshop.bp)
    app.add_url_rule('/', endpoint='index')

    app.register_blueprint(bulletin.bp)
    app.register_blueprint(resource.bp)

    return app
