import pathlib, yaml
from yamlinclude import YamlIncludeConstructor

class Config:

    def __init__(self) -> None:
        self.config_path = pathlib.Path.cwd().joinpath("config.yaml")

    def read(self):
        return self.__read_config()
    
    def __read_config(self):
        try:
            YamlIncludeConstructor.add_to_loader_class(loader_class=yaml.FullLoader, base_dir=pathlib.Path.cwd())
            return yaml.load(open(self.config_path, "r"), Loader=yaml.FullLoader)
        except Exception as e:
            raise
