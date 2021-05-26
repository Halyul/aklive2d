import threading

from lib.skeleton_binary import SkeletonBinary
from lib.alpha_composite import AlphaComposite
from lib.atlas_reader import AtlasReader

class Builder:

    def __init__(self, operator_name, config) -> None:
        self.operator_name = operator_name
        self.config = config

    def start(self):
        self.__set_version()
        return

    def stop(self):
        return

    def __build_assets(self):
        source = "./operator/skadi/extracted/"
        target = "./operator/skadi/"
        name = "dyn_illust_char_1012_skadi2"
        ar = AtlasReader(source + name, target + name)
        skeleton_binary = threading.Thread(
            target=SkeletonBinary, 
            args=(source + name, target + name)
        )
        ar_thread = threading.Thread(
            target=ar.get_images, 
            args=()
        )
        ar_thread.start()
        skeleton_binary.start()
        ar_thread.join()
        for item in ar.images:
            threading.Thread(
                target=AlphaComposite, 
                args=(source + item, target + item)
            ).start()
        return

    def __set_version(self):
        version = input("Enter build version: ")
        print(version)
        return