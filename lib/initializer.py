import pathlib, shutil
from lib.config import Config

class Initializer:

    def __init__(self, config) -> None:
        self.config = config
        self.operator_name = None
        self.yaml_template = {
            "_operator_settings.js": dict(
                fallbackImage_height=2048,
                fallbackImage_width=2048,
                filename="dyn_illust_char_2014_nian",
                fps=60,
                viewport_bottom=0,
                viewport_left=0,
                viewport_right=0,
                viewport_top=0,
            ),
            "index.html": dict(
                fallback_name="char_2014_nian_2",
                id="char_2014_nian",
                operator_logo="logo_sui",
                title="Operator name",
                version="__get_version",
            ),
            "project.json": dict(
                title="Arknights: Nian - 明日方舟：年",
                description="Arknights: Nian Live 2D\\n明日方舟：年 Live 2D\\nThe model is extracted from game with Spine support.\\n模型来自游戏内提取，支持Spine\\nPlease set your FPS target in Wallpaper Engine > Settings > Performance > FPS\\n请在 Wallpaper Engine > 设置 > 性能 > FPS 下设置FPS\\n\\nLive preview on: https://arknights.halyul.dev/nian\\nGithub: https://github.com/Halyul/aklive2d",
                ui_logo_opacity=30,
                ui_logo_ratio=61.8,
                ui_operator_logo="true",
                ui_position_padding_bottom=0,
                ui_position_padding_left=0,
                ui_position_padding_right=0,
                ui_position_padding_top=0,
                workshopid=-1,
            )
        }
        pass

    def start(self):
        self.__input()
        self.__copy_files()
        Config().save(self.config)
        return

    def __input(self):
        print("=== Setting up basic info ===")
        print("Eg.chen")
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
        return
    
    def __copy_files(self):
        # ./operator/<operator_name>
        operator_assets_path = pathlib.Path.cwd().joinpath(self.config["server"]["operator_folder"], self.operator_name)
        if operator_assets_path.exists() is True:
            shutil.rmtree(operator_assets_path)
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
                target_name="{}_settings.js".format(self.yaml_template["index.html"]["id"]),
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
                source_name="{}.png".format(self.yaml_template["index.html"]["operator_logo"]),
                target_name="{}.png".format(self.yaml_template["index.html"]["operator_logo"]),
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