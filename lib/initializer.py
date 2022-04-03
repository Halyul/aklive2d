import pathlib, shutil

class Initializer:

    def __init__(self, config, operator_name) -> None:
        self.config = config
        self.operator_name = operator_name
        pass

    def start(self):
        self.__copy_files()
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