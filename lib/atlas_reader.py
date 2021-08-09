import pathlib
import shutil

class AtlasReader:

    def __init__(self, file_path: str, save_path: str) -> None:
        if file_path.strip().endswith(".atlas") is False:
            file_path += ".atlas"
        if save_path.strip().endswith(".atlas") is False:
            save_path += ".atlas"

        self.file_path = pathlib.Path.cwd().joinpath(file_path)
        self.save_path = pathlib.Path.cwd().joinpath(save_path)
        self.images = list()

    def get_images(self):
        with open(self.file_path, "r") as f:
            line = f.readline()
            while line:
                line = line.strip()
                if line.endswith(".png") is True:
                    self.images.append(line)
                line = f.readline()
        self.copy()
        return self.images
    
    def copy(self):
        shutil.copyfile(
            self.file_path,
            self.save_path
        )
