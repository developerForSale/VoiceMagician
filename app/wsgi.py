from gevent.pywsgi import WSGIServer
from __init__ import create_app

app = create_app()


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
    # http_server = WSGIServer(('127.0.0.1', 5000), app)
    # http_server.serve_forever()
