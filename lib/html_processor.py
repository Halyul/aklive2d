import pathlib

class HtmlProcessor:
    
    def __init__(self, config):
        self.config = config
        pass

    def process(self, operator, file_path):
        with open(pathlib.Path.cwd().joinpath(file_path), "r") as f:
            content = f.read()
        return content.format(
            title=self.config["operators"][operator]["title"],
            version=self.__get_version(),
            operator_logo=self.config["operators"][operator]["logo_name"]
        )
    
    def build(self, operator, source_path, target_path):
        content = self.process(operator, source_path)
        with open(pathlib.Path.cwd().joinpath(target_path), "w") as f:
            f.write(content)
    
    def __get_version(self):
        with open(pathlib.Path.cwd().joinpath("Version"), "r") as f:
            version = f.read()
        return version
