import pathlib, yaml

class Config:

    def __init__(self) -> None:
        self.config_path = pathlib.Path.cwd().joinpath("config.yaml")
        self.valid_keys = dict(
            config=dict(
                server=dict,
                operators=dict,
                operator=dict,
            ),
            server=dict(
                template_folder=str,
                release_folder=str,
                operator_folder=str,
            ),
            operators={
                "index.html": dict,
                "_operator_settings.js": dict,
                "project.json": dict
            },
            operator=dict(
                use_skel=bool,
                preview=str,
                project_json=str,
                source_folder=str,
                target_folder=str,
            ),
            operator_config={
                "index.html": dict(
                    id=str,
                    operator_logo=str,
                    title=str,
                    version=str,
                    fallback_name=str,
                ),
                "_operator_settings.js": dict(
                    fallbackImage_height=int,
                    fallbackImage_width=int,
                    filename=str,
                    fps=int,
                    viewport_left=int,
                    viewport_right=int,
                    viewport_top=int,
                    viewport_bottom=int,
                ),
                "project.json": dict(
                    description=str,
                    title=str,
                    ui_logo_opacity=int,
                    ui_logo_ratio=float,
                    ui_operator_logo=str,
                    ui_position_padding_left=int,
                    ui_position_padding_right=int,
                    ui_position_padding_top=int,
                    ui_position_padding_bottom=int,
                    workshopid=int,
                )
            }
        )
        self.__read_config()
    
    def __read_config(self):
        try:
            self.config = yaml.safe_load(open(self.config_path, "r"))
        except Exception as e:
            raise
        else:
            self.__validate_config()

    def __validate_config(self):
        key = "config"
        self.__config_check(key, self.config, self.valid_keys[key])
        
        key = "server"
        self.__config_check(key, self.config[key], self.valid_keys[key])

        key = "operator"
        self.__config_check(key, self.config[key], self.valid_keys[key])

        key = "operators"
        for operator_name, operator_content in self.config[key].items():
            self.__config_check(operator_name, operator_content, self.valid_keys[key])
            for filename, filetype in self.config[key][operator_name].items():
                self.__config_check(filename, filetype, self.valid_keys["operator_config"][filename])
        
        # with open(self.config_path, 'w') as f:
        #     yaml.safe_dump(self.config, f, allow_unicode=True)
    
    def __config_check(self, block_name: str, contents: dict, required_keys: dict):
        checklist = [key for key in required_keys]
        if contents is not None:
            for key, value in contents.items():
                value_type = type(value)
                if key in checklist:
                    required_type = required_keys[key]
                else:
                    continue
                if value_type != required_type:
                    raise TypeError("Item {key} in config.yaml is not set up correctly. Type {value_type} is detected, but type {required_type} is required.".format(key=key, value_type=value_type.__name__, required_type=required_type.__name__))
                else:
                    checklist.remove(key)
                    if key.endswith("_file") is True:
                        if value.endswith("/") is True:
                            contents[key] = value[:len(value) - 1]
                    elif key.endswith("_folder"):
                        if value.endswith("/") is False:
                            contents[key] = value + "/"
        if len(checklist) != 0:
            raise LookupError("config.yaml has missing item(s) for Block {block_name}: {items}".format(block_name=block_name, items=', '.join([key for key in checklist])))