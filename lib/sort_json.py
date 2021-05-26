import os
import pathlib
import json
with open(os.path.join(pathlib.Path(__file__).parent.absolute(), "operator", "skadi", "dyn_illust_char_1012_skadi2.json"), "r") as f:
        data = json.load(f)

with open(os.path.join(pathlib.Path(__file__).parent.absolute(), "dyn_illust_char_1012_skadi2[sorted].json"), "w") as f:
        json.dump(data, f, indent=4, sort_keys=True)