from multiprocessing import Process, Manager
import shutil
import json
import operator
from lib.alpha_composite import AlphaComposite
from lib.atlas_reader import AtlasReader
from lib.base64_util import *
from lib.content_processor import ContentProcessor

class Builder:

    def __init__(self, config, operator_names=list(), rebuild=False) -> None:
        self.operator_names = operator_names
        self.config = config
        self.rebuild = rebuild
        self.content_processor = None

    def start(self):
        if "all" in self.operator_names:
            self.operator_names = [operator_name for operator_name in self.config["operators"]]
        for operator_name in self.operator_names:
            self.build(operator_name)
            self.__release_file(operator_name)
        return

    def stop(self):
        return

    def build(self, operator_name):
        thread_map = [
            dict(
                target=self.__build_assets,
                args=(operator_name,),
            ),
            dict(
                target=self.__build_settings, 
                args=(operator_name,),
            )
        ]
        threads = list()
        self.content_processor = ContentProcessor(self.config, operator_name)

        for item in thread_map:
            thread = Process(**item)
            threads.append(thread)
            thread.start()
            
        for thread in threads:
            thread.join()

    # use content processor to generate operator settings
    def __build_settings(self, operator_name):
        source_path = pathlib.Path.cwd().joinpath("operator", operator_name, "config")
        target_path = pathlib.Path.cwd().joinpath("operator", operator_name)
        for file in source_path.iterdir():
            if file.is_file() is True:
                file_path = pathlib.Path.cwd().joinpath(target_path, file.name)
                self.content_processor.build(
                    file,
                    file_path
                )
        return

    def __build_assets(self, operator_name):
        file_paths = dict(
            source=self.config["operator"]["source_folder"].format(name=operator_name),
            target=self.config["operator"]["target_folder"].format(name=operator_name),
            common_name=self.config["operators"][operator_name]["_operator_settings.js"]["filename"],
            fallback_name=self.config["operators"][operator_name]["index.html"]["fallback_name"].replace("%23", "#") if self.config["operators"][operator_name]["index.html"]["fallback_name"] is not None else None,
            id_name=self.config["operators"][operator_name]["index.html"]["id"].replace("%23", "#")
        )

        operator_file = pathlib.Path.cwd().joinpath(file_paths["target"], "..", "{}_assets.js".format(file_paths["id_name"]))
        if operator_file.exists() is False or self.rebuild is True:
            print("Building operator data for {}...".format(operator_name))

            prefix = "window.operatorAssets = "
            manager = Manager()
            data = manager.dict()

            thread_map = [
                dict(
                    target=self.__ar_thread,
                    args=(
                        file_paths,
                        data
                    ),
                ),
                dict(
                    target=self.__skeleton_binary_thread,
                    args=(
                        file_paths,
                        data
                    ),
                ),
                dict(
                    target=self.__fallback_thread,
                    args=(
                        file_paths,
                        data
                    ),
                ),
            ]
            threads = list()
            for item in thread_map:
                thread = Process(**item)
                threads.append(thread)
                thread.start()
                
            for thread in threads:
                thread.join()
            
            sorted_data = dict()
            for i in sorted(data.keys()):
                sorted_data[i] = data[i]

            json_content = prefix + str(sorted_data)
            with open(operator_file, "w") as f:
                f.write(json_content)
            
            print("Finished building operator data for {}.".format(operator_name))
        else:
            print("Operator data for {} has been built.".format(operator_name))
        return

    def __ar_thread(self, file_paths, data):
        source_path = file_paths["source"]
        target_path = file_paths["target"]
        common_name = file_paths["common_name"]

        png_to_base64_threads = list()
        alpha_composite_threads = list()
        ar = AtlasReader(source_path + common_name, target_path + common_name)
        images = ar.get_images()
        atlas_to_base64_thread = Process(
            target=self.__atlas_to_base64, 
            args=(
                target_path + common_name + ".atlas",
                data,
                self.config["server"]["operator_folder"] + common_name + ".atlas",
            ),
        )
        atlas_to_base64_thread.start()

        for item in images:
            alpha_composite_thread = Process(
                target=AlphaComposite, 
                args=(source_path + item, target_path + item),
            )
            alpha_composite_threads.append(alpha_composite_thread)
            alpha_composite_thread.start()
        for thread in alpha_composite_threads:
            thread.join()
            
        for item in images:
            png_to_base64_thread = Process(
                target=self.__png_to_base64, 
                args=(
                    target_path + item,
                    data,
                    self.config["server"]["operator_folder"] + item,
                ),
            )

            png_to_base64_threads.append(png_to_base64_thread)
            png_to_base64_thread.start()
        for thread in png_to_base64_threads:
            thread.join()
        atlas_to_base64_thread.join()

    def __skeleton_binary_thread(self, file_paths, data):
        source_path = file_paths["source"]
        target_path = file_paths["target"]
        common_name = file_paths["common_name"]
        if common_name.strip().endswith(".skel") is False:
            common_name += ".skel"
        file_path = pathlib.Path.cwd().joinpath(source_path + common_name)
        save_path = pathlib.Path.cwd().joinpath(target_path + common_name)
        shutil.copyfile(
            file_path,
            save_path
        )
        self.__skel_to_base64(
            save_path,
            data,
            self.config["server"]["operator_folder"] + common_name,
        )

    def __fallback_thread(self, file_paths, data):
        source_path = file_paths["source"]
        target_path = file_paths["target"]
        fallback_name = file_paths["fallback_name"]
        if fallback_name is not None:
            AlphaComposite(source_path + fallback_name, target_path + "../{}".format(fallback_name))

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
        operator_assets_path = pathlib.Path.cwd().joinpath(self.config["operator"]["target_folder"].format(name=operator_name), "..")
        template_path = pathlib.Path.cwd().joinpath(self.config["server"]["template_folder"])

        if operator_release_path.exists() is True:
            shutil.rmtree(operator_release_path)
        operator_release_path.mkdir()
        release_operator_assets_path.mkdir()
        
        for file in operator_assets_path.iterdir():
            if file.is_file() is True:
                filename = file.name
                if filename == self.config["operator"]["project_json"] or filename == self.config["operator"]["preview"]:
                    file_path = pathlib.Path.cwd().joinpath(operator_release_path, filename)
                else:
                    file_path = pathlib.Path.cwd().joinpath(release_operator_assets_path, filename)
                
                shutil.copyfile(
                    file,
                    file_path
                )
        
        # template folder uses content processor to generate files
        for file in template_path.iterdir():
            if file.is_file() is True:
                file_path = pathlib.Path.cwd().joinpath(operator_release_path, file.name)

                self.content_processor.build(file, file_path)
            elif file.is_dir() is True:
                file_path = pathlib.Path.cwd().joinpath(operator_release_path, file.name)

                shutil.copytree(
                    file,
                    file_path
                )
        
        # generate a directory.json for index page
        save_path = pathlib.Path.cwd().joinpath(
            self.config["index"]["src_folder"], "directory.json")
        directory_json = []
        for key, value in self.config["operators"].items():
            directory_json.append(dict(
                name=key,
                link=value["link"],
                type=value["type"],
                date=value["date"]
            ))
        directory_json.sort(key=operator.itemgetter("date", "name"), reverse=True)
        with open(save_path, 'w', encoding='utf8') as fp:
            json.dump(directory_json, fp)
        return
