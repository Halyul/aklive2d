import base64
import pathlib

def encode_image(path, prefix=True):
    with open(pathlib.Path.cwd().joinpath(path), "rb") as f:
        bytes = f.read()
        encoded_bytes = base64.b64encode(bytes)
        humanreadable_data = encoded_bytes.decode("utf-8")
        if prefix is True:
            result = "data:image/png;base64," + humanreadable_data
        else:
            result = humanreadable_data
        return result

def decode_image(data: str, path):
    if data.strip().startswith("data:") is True:
        data = data.split(",")[1]
    encoded_bytes = data.encode("utf-8")
    with open(pathlib.Path.cwd().joinpath(path), "wb") as f:
        bytes = base64.decodebytes(encoded_bytes)
        f.write(bytes)

def encode_string(data=None, type="text/plain", path=None, prefix=True, encoding="utf-8"):
    if data is None and path is None:
        return
    if data is not None:
        bytes = data.encode(encoding)
    elif path is not None:
        with open(pathlib.Path.cwd().joinpath(path), "r") as f:
            bytes = f.read()
    encoded_bytes = base64.b64encode(bytes)
    humanreadable_data = encoded_bytes.decode(encoding)
    if prefix is True:
        result = "data:{};base64,".format(type) + humanreadable_data
    else:
        result = humanreadable_data
    return result

def decode_string(data:str, encoding="utf-8"):
    if data.strip().startswith("data:") is True:
        data = data.split(",")[1]
    encoded_bytes = data.encode(encoding)
    bytes = base64.decodebytes(encoded_bytes)
    return bytes.decode(encoding)
