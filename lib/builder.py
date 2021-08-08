import threading
import shutil
from lib.skeleton_binary import SkeletonBinary
from lib.alpha_composite import AlphaComposite
from lib.atlas_reader import AtlasReader
from lib.base64_util import *
from lib.content_processor import ContentProcessor

class Builder:

    def __init__(self, config, operator_names=list(), rebuild=False) -> None:
        self.operator_names = operator_names
        self.config = config
        self.rebuild = rebuild

    def start(self):
        if "all" in self.operator_names:
            self.operator_names = [operator_name for operator_name in self.config["operators"]]
        for operator_name in self.operator_names:
            self.build_assets(operator_name)
            self.__release_file(operator_name)
        return

    def stop(self):
        return

    def build_assets(self, operator_name):

        use_skel = self.config["operators"][operator_name]["use_skel"]
        source_path = self.config["operators"][operator_name]["source_folder"].format(name=operator_name)
        target_path = self.config["operators"][operator_name]["target_folder"].format(name=operator_name)
        common_name = self.config["operators"][operator_name]["common_name"]
        fallback_name = self.config["operators"][operator_name]["fallback_name"]
        file_paths = dict(
            json=target_path + common_name + ".json",
            atlas=target_path + common_name + ".atlas",
            skel=target_path + common_name + ".skel",
        )

        operator_file = pathlib.Path.cwd().joinpath(target_path, "..", "operator_assets.js")
        if operator_file.exists() is False or self.rebuild is True:
            print("Building operaotr data for {}...".format(operator_name))

            alpha_composite_threads = list()
            png_to_base64_threads = list()
            prefix = "window.operatorAssets = "
            data = dict()

            ar = AtlasReader(source_path + common_name, target_path + common_name)

            skeleton_binary_thread = threading.Thread(
                target=SkeletonBinary, 
                args=(source_path + common_name, target_path + common_name, use_skel),
                daemon=True,
            )
            ar_thread = threading.Thread(
                target=ar.get_images, 
                daemon=True,
            )
            atlas_base64_thread = threading.Thread(
                target=self.__atlas_to_base64, 
                args=(
                    file_paths["atlas"],
                    data,
                    self.config["server"]["operator_folder"] + common_name + ".atlas",
                ),
                daemon=True,
            )
            fallback_thread = threading.Thread(
                target=AlphaComposite, 
                args=(source_path + fallback_name, target_path + "../fallback"),
                daemon=True,
            )

            ar_thread.start()
            skeleton_binary_thread.start()
            fallback_thread.start()
            ar_thread.join()
            atlas_base64_thread.start()

            # alpha composite for live 2d assets
            for item in ar.images:
                alpha_composite_thread = threading.Thread(
                    target=AlphaComposite, 
                    args=(source_path + item, target_path + item),
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
                        target_path + item,
                        data,
                        self.config["server"]["operator_folder"] + item,
                    ),
                    daemon=True,
                )

                png_to_base64_threads.append(png_to_base64_thread)
                png_to_base64_thread.start()

            skeleton_binary_thread.join()
            if use_skel is True:
                skel_base64_thread =threading.Thread(
                    target=self.__skel_to_base64, 
                    args=(
                        file_paths["skel"],
                        data,
                        self.config["server"]["operator_folder"] + common_name + ".skel",
                    ),
                    daemon=True,
                )
                skel_base64_thread.start()
                skel_base64_thread.join()
            else:
                json_base64_thread =threading.Thread(
                    target=self.__json_to_base64, 
                    args=(
                        file_paths["json"],
                        data,
                        self.config["server"]["operator_folder"] + common_name + ".json",
                    ),
                    daemon=True,
                )
                json_base64_thread.start()
                json_base64_thread.join()

            # join remaining threads
            for thread in png_to_base64_threads:
                thread.join()

            atlas_base64_thread.join()
            fallback_thread.join()
            
            jsonContent = prefix + str(data)
            with open(operator_file, "w") as f:
                f.write(jsonContent)
            
            print("Finished building operaotr data for {}.".format(operator_name))
        else:
            print("Operaotr data for {} has been built.".format(operator_name))
        return

    def __json_to_base64(self, path, dict=None, key=None):
        with open(pathlib.Path.cwd().joinpath(path), "r") as f:
            data = f.read()
        result = encode_string(data, type="application/json")
        if dict is not None and key is not None:
            dict[key] = result
        else:
            return result
    
    def __skel_to_base64(self, path, dict=None, key=None):
        result = encode_binary(
            path=path
        )
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
        result = encode_binary(
            path=path, 
            type="image/png"
        )
        if dict is not None and key is not None:
            dict[key] = result
        else:
            return result

    def __release_file(self, operator_name):
        target_path = self.config["server"]["release_folder"]
        operator_release_path = pathlib.Path.cwd().joinpath(target_path, operator_name)
        release_operator_assets_path = pathlib.Path.cwd().joinpath(operator_release_path, self.config["server"]["operator_folder"])
        operator_assets_path = pathlib.Path.cwd().joinpath(self.config["operators"][operator_name]["target_folder"].format(name=operator_name), "..")
        template_path = pathlib.Path.cwd().joinpath(self.config["server"]["template_folder"])
        content_processor = ContentProcessor(self.config, operator_name)

        if operator_release_path.exists() is True:
            shutil.rmtree(operator_release_path)
        operator_release_path.mkdir()
        release_operator_assets_path.mkdir()
        
        for file in operator_assets_path.iterdir():
            if file.is_file() is True:
                filename = file.name
                if filename == self.config["operators"][operator_name]["project_json"] or filename == self.config["operators"][operator_name]["preview"]:
                    file_path = pathlib.Path.cwd().joinpath(operator_release_path, filename)
                else:
                    file_path = pathlib.Path.cwd().joinpath(release_operator_assets_path, filename)
                
                content_processor.build(file, file_path)
        
        for file in template_path.iterdir():
            if file.is_file() is True:
                file_path = pathlib.Path.cwd().joinpath(operator_release_path, file.name)

                content_processor.build(file, file_path)
            elif file.is_dir() is True:
                file_path = pathlib.Path.cwd().joinpath(operator_release_path, file.name)

                shutil.copytree(
                    file,
                    file_path
                )
        
        return
