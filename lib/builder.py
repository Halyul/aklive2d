import threading
import shutil
from lib.skeleton_binary import SkeletonBinary
from lib.alpha_composite import AlphaComposite
from lib.atlas_reader import AtlasReader
from lib.base64_util import *

class Builder:

    def __init__(self, operator_name, config) -> None:
        self.operator_name = operator_name
        self.config = config
        self.source_path = config["operators"][operator_name]["source_folder"].format(name=operator_name)
        self.target_path = config["operators"][operator_name]["target_folder"].format(name=operator_name)
        self.common_name = config["operators"][operator_name]["common_name"]
        self.file_paths = dict(
            json=self.target_path + self.common_name + ".json",
            atlas=self.target_path + self.common_name + ".atlas",
            skel=self.target_path + self.common_name + ".skel",
        )

    def start(self):
        # self.__build_assets()
        # self.__set_version()
        # name = "skadi"
        # print(self.config[name]["source_folder"].format(name=name))
        source = "./operator/skadi/extracted/"
        target = "./operator/skadi/"
        name = "dyn_illust_char_1012_skadi2"
        print("build")
        return

    def stop(self):
        return

    def build_assets(self):
        operator_file = pathlib.Path.cwd().joinpath(self.target_path, "operator.js")
        if operator_file.exists() is False:
            print("Building operaotr data...")

            alpha_composite_threads = list()
            png_to_base64_threads = list()
            prefix = "window.operator = "
            data = dict()

            ar = AtlasReader(self.source_path + self.common_name, self.target_path + self.common_name)

            skeleton_binary_thread = threading.Thread(
                target=SkeletonBinary, 
                args=(self.source_path + self.common_name, self.target_path + self.common_name),
                daemon=True,
            )
            ar_thread = threading.Thread(
                target=ar.get_images, 
                daemon=True,
            )
            atlas_base64_thread = threading.Thread(
                target=self.__atlas_to_base64, 
                args=(
                    self.file_paths["atlas"],
                    data,
                    ".{}".format(self.config["server"]["operator_folder"]) + self.common_name + ".atlas",
                ),
                daemon=True,
            )

            ar_thread.start()
            skeleton_binary_thread.start()
            ar_thread.join()
            atlas_base64_thread.start()

            # alpha composite
            for item in ar.images:
                alpha_composite_thread = threading.Thread(
                    target=AlphaComposite, 
                    args=(self.source_path + item, self.target_path + item),
                    daemon=True,
                )
                alpha_composite_threads.append(alpha_composite_thread)
                alpha_composite_thread.start()
            
            for thread in alpha_composite_threads:
                thread.join()
            
            for item in ar.images:
                png_to_base64_thread = threading.Thread(
                    target=self.__png_to_base64, 
                    args=(
                        self.target_path + item,
                        data,
                        ".{}".format(self.config["server"]["operator_folder"]) + item,
                    ),
                    daemon=True,
                )

                png_to_base64_threads.append(png_to_base64_thread)
                png_to_base64_thread.start()

            skeleton_binary_thread.join()

            json_base64_thread =threading.Thread(
                target=self.__json_to_base64, 
                args=(
                    self.file_paths["json"],
                    data,
                    ".{}".format(self.config["server"]["operator_folder"]) + self.common_name + ".json",
                ),
                daemon=True,
            )
            json_base64_thread.start()
            json_base64_thread.join()

            for thread in png_to_base64_threads:
                thread.join()

            atlas_base64_thread.join()
            
            jsonContent = prefix + str(data)
            with open(operator_file, "w") as f:
                f.write(jsonContent)
            
            print("Finished building operaotr data")
        return

    def __set_version(self):
        version = input("Enter build version: ")
        print(version)
        return

    def __json_to_base64(self, path, dict=None, key=None):
        with open(pathlib.Path.cwd().joinpath(path), "r") as f:
            data = f.read()
        result = encode_string(data, type="application/json")
        if dict is not None and key is not None:
            dict[key] = result
        else:
            return result

    def __atlas_to_base64(self, path, dict=None, key=None):
        with open(pathlib.Path.cwd().joinpath(path), "r") as f:
            data = f.read()
        result = encode_string(data, type="application/octet-stream")
        if dict is not None and key is not None:
            dict[key] = result
        else:
            return result
    
    def __png_to_base64(self, path, dict=None, key=None):
        result = encode_image(path)
        if dict is not None and key is not None:
            dict[key] = result
        else:
            return result
