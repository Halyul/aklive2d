import pathlib
from PIL import Image

class AlphaComposite:

    def __init__(self, image_path: str, save_path) -> None:
        if image_path.strip().endswith(".png") is True:
            image_path = image_path.replace(".png", "")
        if save_path.strip().endswith(".png") is False:
            save_path += ".png"
        self.image_path = pathlib.Path.cwd().joinpath(image_path + ".png")
        self.mask_path = pathlib.Path.cwd().joinpath(image_path + "[alpha].png")
        self.save_path = save_path
        self.image = None
        self.mask = None
        self.loaded_image = None
        self.loaded_mask = None
        self.__open_image()
        self.__alpha_composite()
        pass

    def __open_image(self):
        self.image = Image.open(self.image_path)
        self.mask = Image.open(self.mask_path)
        if self.image.size != self.mask.size:
            # resize mask
            self.mask = self.__resize(self.mask, self.image.size[0], self.image.size[1])
        self.loaded_image = self.image.load()
        self.loaded_mask = self.mask.load()

    def __alpha_composite(self):
        for y in range(self.mask.size[1]):
            for x in range(self.mask.size[0]):
                self.loaded_image[x, y] = (self.loaded_image[x, y][0], self.loaded_image[x, y][1], self.loaded_image[x, y][2], self.loaded_mask[x, y][2])
        self.image.save(pathlib.Path.cwd().joinpath(self.save_path))

    # resize image
    def __resize(self, image, width: int, height: int):
        return image.resize((width, height))
