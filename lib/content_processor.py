import pathlib
import shutil
import re

class ContentProcessor:
    
    def __init__(self, config, operator_name):
        self.config = config["operators"][operator_name]
        self.file_to_process = [key for key, value in self.config.items() if key.startswith("_") is False]
        self.settings = self.config
        self.__process_value()

    def process(self, file_path):
        file_path = pathlib.Path.cwd().joinpath(file_path)
        with open(file_path, "r") as f:
            content = f.read()
            if file_path.name in self.file_to_process:
                content = Matcher(content, "${format:", "}", self.settings)
                return content.format(file_path.name)
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
            for key, value in item_value.items() if type(item_value) == dict else {}:
                matcher = Matcher(value, "${", "}", self.settings)
                if matcher.match():
                    replace_value = matcher.process()
                else:
                    replace_value = value
                self.settings[item_key][key] = replace_value
        # copy dict value _operator_settings.js to {id}_settings.js
        settings_filename = "{}_settings.js".format(self.settings["index.html"]["id"].replace("%23", "#"))
        self.settings[settings_filename] = self.settings["_operator_settings.js"]
        self.file_to_process.append(settings_filename)

class Evalable:
    def __init__(self, settings):
        self.settings = settings

    def get_version(self):
        with open(pathlib.Path.cwd().joinpath("Version"), "r") as f:
            version = f.read()
        return version
    
    def split(self, var_name, separator):
        for var in var_name.split("->"):
            try:
                self.settings = self.settings[var]
            except Exception as e:
                raise e
        return self.settings.split(separator)

class Matcher:
    def __init__(self, content, start, end, settings):
        self.start = start
        self.end = end
        self.content = str(content)
        self.settings = settings
        self.re_exp = re.compile("\{}.+?{}".format(start, end))

    def match(self):
        return re.search(self.re_exp, self.content) is not None
    
    def process(self):
        for match in re.findall(self.re_exp, self.content):
            type = match.replace(self.start, "").replace(self.end, "").split(":")[0]
            name = match.replace(self.start, "").replace(self.end, "").split(":")[1]
            if type == "func":
                try:
                    self.content = self.content.replace(match, eval("Evalable(self.settings)." + name))
                except Exception as e:
                    raise e
            elif type == "var":
                replace_value = self.settings
                for var in name.split("->"):
                    try:
                        replace_value = replace_value[var]
                    except Exception as e:
                        raise e
                self.content = self.content.replace(match, str(replace_value))
            else:
                raise Exception("Unsupported type: {}".format(type))
        return self.content

    def format(self, filename):
        for key, value in self.settings[filename].items():
            identifier = self.start + key + self.end
            self.content = self.content.replace(identifier, str(value))
        return self.content
