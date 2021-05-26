import argparse

from lib.config import Config
from lib.server import Server
from lib.builder import Builder

class AkLive2D:

    def __init__(self) -> None:
        self.config = Config().config
        self.args = None
        self.server = None
        self.builder = None

    def start(self):
        parser = argparse.ArgumentParser(description="Arknights Live 2D Wallpaper Builder")
        arg_group = parser.add_mutually_exclusive_group(required=True)
        arg_group.add_argument("-s", "--serve", dest="port", type=int, const=8080,nargs="?", help="Development server port (default: 8080)")
        arg_group.add_argument("-b", "--build", dest="operator_name", type=str, const="all", nargs="?", help="Build wallpapers (default: all)")

        self.args = parser.parse_args()

        if self.args.port is not None:
            self.server = Server(self.args.port, self.config["server"])
            self.server.start()
        
        if self.args.operator_name is not None:
            self.builder = Builder(self.args.operator_name, self.config["operators"])
            self.builder.start()
    
    def stop(self):
        return

if __name__ == "__main__":
    aklive2d = AkLive2D()
    try:   
        aklive2d.start()
    except KeyboardInterrupt:
        print("\nInterrupted, exiting...")
        aklive2d.stop()