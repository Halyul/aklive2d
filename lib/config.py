import pathlib, yaml

class Config:

    def __init__(self) -> None:
        self.config_path = pathlib.Path.cwd().joinpath("config.yaml")
        self.valid_keys = dict(
            config=dict(
                server=dict,
                operators=dict,
            ),
            server=dict(
                template_folder=str,
                release_folder=str,
                operator_folder=str,
            ),
            operators=dict(
                source_folder=str,
                target_folder=str,
                common_name=str,
                release_folder=str,
                project_json=str,
                preview=str,
                use_skel=bool,
            )
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

        key = "operators"
        for operator_name, operator_content in self.config[key].items():
            self.__config_check(operator_name, operator_content, self.valid_keys[key])
        
        with open(self.config_path, 'w') as f:
            yaml.safe_dump(self.config, f, allow_unicode=True)
    
    def __config_check(self, block_name: str, contents: dict, required_keys: dict):
        checklist = [key for key in required_keys]
        if contents is not None:
            for key, value in contents.items():
                value_type = type(value)
                if key in checklist:
                    required_type = required_keys[key]
                else:
                    break
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