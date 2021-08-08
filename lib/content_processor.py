import pathlib
import shutil

class ContentProcessor:
    
    def __init__(self, config, operator_name):
        self.config = config["operators"][operator_name]
        self.file_to_process = [key for key, value in self.config["config"].items()]
        self.settings = self.config["config"]
        self.evalable = [
            "__get_version"
        ]
        self.__process_value()

    def process(self, file_path):
        file_path = pathlib.Path.cwd().joinpath(file_path)
        with open(file_path, "r") as f:
            content = f.read()
            if file_path.name in self.file_to_process:
                content = Formatter(content, "{# ", " #}")
                return content.format(**self.settings[file_path.name])
            else:
                return content
    
    def build(self, source_path, target_path):
        if source_path.name in self.file_to_process:
            content = self.process(source_path)
            with open(pathlib.Path.cwd().joinpath(target_path), "w") as f:
                f.write(content)
        else:
            shutil.copyfile(
                source_path,
                target_path
            )

    def __process_value(self):
        for item_key, item_value in self.settings.items():
            for key, value in item_value.items():
                replace_value = value
                # if value in evalable
                if value in self.evalable:
                    if value == "__get_version":
                        replace_value = self.__get_version()
                    else:
                        raise Exception("Unsupported function name: {}".format(value))
                self.settings[item_key][key] = replace_value

    def __get_version(self):
        with open(pathlib.Path.cwd().joinpath("Version"), "r") as f:
            version = f.read()
        return version

class Formatter:
    def __init__(self, content, start, end):
        self.content = content
        self.start = start
        self.end = end
    
    def format(self, **kwargs):
        for key, value in kwargs.items():
            identifier = self.start + key + self.end
            self.content = self.content.replace(identifier, str(value))
        return self.content