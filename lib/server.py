from http.server import SimpleHTTPRequestHandler
import pathlib
from socketserver import TCPServer

from lib.builder import Builder
class Server:

    def __init__(self, port, operator, config) -> None:
        self.config = config
        self.operator = operator
        self.port = port
        self.httpd = TCPServer(("", port), httpd(operator, config["server"], directory=str(pathlib.Path.cwd())))

    def start(self):
        # build assets first
        Builder(self.operator, self.config).build_assets()
        print("Server is up at 0.0.0.0:{port}".format(port=self.port))
        self.httpd.serve_forever()
        return

    def stop(self):
        self.httpd.server_close()
        return

class httpd(SimpleHTTPRequestHandler):

    def __init__(self, operator, config, directory):
        self.config = config
        self.operator = operator
        self.template_path = directory

    def __call__(self, *args, **kwds):
        super().__init__(*args, directory=self.template_path, **kwds)

    def do_GET(self):
        split_path = self.path.split("/")
        access_path = "/{}/".format(split_path[1])

        if self.path == "/":
            self.path = self.config["template_folder"] + "index.html"
        elif access_path == "/assets/":
            # assets folder
            self.path = self.config["template_folder"] + "assets/" + "/".join([i for i in split_path[2:]])
        elif self.config["operator_folder"] == access_path:
            # operator folder
            self.path = self.config["operator_folder"] + "{}/".format(self.operator) + split_path[-1]
        return SimpleHTTPRequestHandler.do_GET(self)