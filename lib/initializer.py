import pathlib, shutil
from lib.config import Config

class Initializer:

    def __init__(self, config, operator_name=None) -> None:
        self.config = config
        self.operator_name = operator_name
        self.yaml_template = dict(config["operators"]["skadi"])
        self.predefined = False
        if operator_name is not None:
            self.predefined = True
        pass

    def start(self):
        if self.operator_name is None:
            self.__input()
        self.__copy_files()
        return

    def __input(self):
        print("=== Setting up basic info ===")
        print("Eg.", "skadi")
        while(True):
            self.operator_name = input("Operator Name: ")
            if self.operator_name != "":
                break
            else:
                print("Operator name is empty!")
        print("=== Setting up _operator_settings.js ===")
        print("Eg.", self.yaml_template["_operator_settings.js"]["filename"])
        self.yaml_template["_operator_settings.js"]["filename"] = input("Filename: ") or self.yaml_template["_operator_settings.js"]["filename"]

        print("=== Setting up index.html ===")
        print("Eg.", self.yaml_template["index.html"]["fallback_name"])
        self.yaml_template["index.html"]["fallback_name"] = input("Fallback Name: ") or self.yaml_template["index.html"]["fallback_name"]
        print("Eg.", self.yaml_template["index.html"]["id"])
        self.yaml_template["index.html"]["id"] = input("ID Name: ") or self.yaml_template["index.html"]["id"]
        print("Eg.", self.yaml_template["index.html"]["operator_logo"])
        self.yaml_template["index.html"]["operator_logo"] = input("Operator Logo Name: ") or self.yaml_template["index.html"]["operator_logo"]
        print("Eg.", self.yaml_template["index.html"]["title"])
        self.yaml_template["index.html"]["title"] = input("Title: ") or self.yaml_template["index.html"]["title"]

        print("=== Setting up project.json ===")
        print("Eg.", self.yaml_template["project.json"]["title"])
        self.yaml_template["project.json"]["title"] = input("Title: ") or self.yaml_template["project.json"]["title"]
        print("Eg.", self.yaml_template["project.json"]["description"])
        self.yaml_template["project.json"]["description"] = input("Description: ") or self.yaml_template["project.json"]["description"]

        self.config["operators"][self.operator_name] = self.yaml_template
        Config().save(self.config)
        return
    
    def __copy_files(self):
        # ./operator/<operator_name>
        operator_assets_path = pathlib.Path.cwd().joinpath(self.config["server"]["operator_folder"], self.operator_name)
        if operator_assets_path.exists() is True:
            if self.predefined is False:
                shutil.rmtree(operator_assets_path)
            else:
                print("Operator assets folder already exists.")
                return
        operator_assets_path.mkdir()

        dir_map = dict(
            config=pathlib.Path.cwd().joinpath(operator_assets_path, "config"),
            extracted=pathlib.Path.cwd().joinpath(operator_assets_path, "extracted"),
            processed=pathlib.Path.cwd().joinpath(operator_assets_path, "processed")
        )

        for key, path in dir_map.items():
            path.mkdir()

        # copy file
        operator_settings_path = pathlib.Path.cwd().joinpath(self.config["server"]["operator_folder"], "_share")
        logo_path = pathlib.Path.cwd().joinpath(operator_settings_path, "logo")
        copy_map = [
            dict(
                source_name="operator_settings.js",
                target_name="{}_settings.js".format(self.config["operators"][self.operator_name]["index.html"]["id"].replace("%23", "#")),
                source_path=operator_settings_path,
                target_path=dir_map["config"],
            ),
            dict(
                source_name="project.json",
                target_name="project.json",
                source_path=operator_settings_path,
                target_path=dir_map["config"],
            ),
            dict(
                source_name="operator_bg.png",
                target_name="operator_bg.png",
                source_path=operator_settings_path,
                target_path=operator_assets_path,
            ),
            dict(
                source_name="{}.png".format(self.config["operators"][self.operator_name]["index.html"]["operator_logo"]),
                target_name="{}.png".format(self.config["operators"][self.operator_name]["index.html"]["operator_logo"]),
                source_path=logo_path,
                target_path=operator_assets_path,
            ),
        ]
        for item in copy_map:
            shutil.copy(
                pathlib.Path.cwd().joinpath(item["source_path"], item["source_name"]), 
                pathlib.Path.cwd().joinpath(item["target_path"], item["target_name"])
            )
        return