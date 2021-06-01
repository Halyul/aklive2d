import pathlib
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

from lib.builder import Builder
from lib.html_processor import HtmlProcessor
class Server:

    def __init__(self, port, operator, config) -> None:
        self.config = config
        self.operator = operator
        self.port = port
        self.httpd = TCPServer(("", port), httpd(operator, config, directory=str(pathlib.Path.cwd())))

    def start(self):
        # build assets first
        Builder(self.config).build_assets(self.operator)
        print("Server is up at 0.0.0.0:{port}".format(port=self.port))
        self.httpd.serve_forever()
        return

    def stop(self):
        self.httpd.server_close()
        return

class httpd(SimpleHTTPRequestHandler):

    def __init__(self, operator, config, directory):
        self.config = config["server"]
        self.operator = operator
        self.template_path = directory
        self.html_processor = HtmlProcessor(config)

    def __call__(self, *args, **kwds):
        super().__init__(*args, directory=self.template_path, **kwds)

    def do_GET(self):
        # ignore query string
        if "?" in self.path:
            self.path = self.path.split("?")[0]
        
        split_path = self.path.split("/")
        access_path = "/{}/".format(split_path[1])

        if self.path == "/":
            # self.path = self.config["template_folder"] + "index.html"
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            html = self.html_processor.process(self.operator, self.config["template_folder"] + "index.html")
            self.wfile.write(bytes(html, "utf8"))
            return
        elif access_path == "/assets/":
            # assets folder
            self.path = self.config["template_folder"] + "assets/" + "/".join([i for i in split_path[2:]])
        elif self.config["operator_folder"] == access_path:
            # operator folder
            self.path = self.config["operator_folder"] + "{}/".format(self.operator) + split_path[-1]
        return SimpleHTTPRequestHandler.do_GET(self)