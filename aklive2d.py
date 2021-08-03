#!/usr/bin/env python3
import argparse
import sys

from lib.config import Config
from lib.server import Server
from lib.builder import Builder

class AkLive2D:

    def __init__(self) -> None:
        self.config = Config().config
        self.args = None
        self.running = None

    def start(self):
        parser = argparse.ArgumentParser(
            prog="aklive2d", 
            description="Arknights Live 2D Wallpaper Builder", 
            formatter_class=argparse.ArgumentDefaultsHelpFormatter
        )

        subprasers = parser.add_subparsers(
            title="Available commands", 
            dest="command", 
            required=True, 
            help="<Required> Select the command to run"
        )

        server = subprasers.add_parser(
            "server", 
            help="Development Server", 
            aliases=['s'], 
            formatter_class=argparse.ArgumentDefaultsHelpFormatter
        )
        server.add_argument(
            "-p", 
            "--port", 
            dest="port", 
            type=int, 
            default=8080, 
            help="Development server port"
        )
        server.add_argument(
            "-o", 
            "--operator", 
            dest="operator_name", 
            type=str, 
            required=True, 
            help="<Required> Operatro to develop",
        )
        server.add_argument(
            "-r", 
            "--rebuild", 
            dest="rebuild",
            action='store_true',
            help="Rebuild assets"
        )

        build = subprasers.add_parser(
            "build", 
            help="Build releases", 
            aliases=['b'], 
            formatter_class=argparse.ArgumentDefaultsHelpFormatter
        )
        build.add_argument(
            "-o", 
            "--operators", 
            dest="operator_names", 
            type=str, 
            default=["all"], 
            nargs='+', 
            help="Operators to build"
        )
        build.add_argument(
            "-r", 
            "--rebuild", 
            dest="rebuild",
            action='store_true',
            help="Rebuild assets"
        )

        self.args = parser.parse_args()
        if self.args.command == "server" or self.args.command == "s":
            self.running = Server(self.args.port, self.args.operator_name, self.config, self.args.rebuild)
        elif self.args.command == "build" or self.args.command == "b":
            self.running = Builder(self.config, self.args.operator_names, self.args.rebuild)

        self.running.start()

if __name__ == "__main__":
    aklive2d = AkLive2D()
    try:   
        aklive2d.start()
    except KeyboardInterrupt:
        print("\nInterrupted, exiting...")
        sys.exit()