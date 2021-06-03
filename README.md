# aklive2d

A project that builds showcase webpage for Arknights Live2D-equipped operators. Showcase webpage can be used as a wallpaper for Wallpaper Engine on Windows or [Plash](https://github.com/sindresorhus/Plash) on macOS (not tested).

## Supported Operators

| Operator | Live Preview | Steam Workshop |
|----------|--------------|----------------|
| Skadi the Corrupting Heart | [Link](https://arknights.halyul.dev/skadi/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2492307783) |

- For Windows users: Use [Wallpaper Engine](https://www.wallpaperengine.io/en) or other softwares that support using webpage as desktop wallpaper.
- For macOS users: Use [Plash](https://github.com/sindresorhus/Plash), however, I don't have macOS machine, so your mileage may vary.
- For Linux users: You power user should be able to find your solutions!

## Usage

``` bash
$ python3 aklive2d.py -h  
usage: aklive2d [-h] {server,s,build,b} ...

Arknights Live 2D Wallpaper Builder

optional arguments:
  -h, --help          show this help message and exit

Available commands:
  {server,s,build,b}  <Required> Select the command to run
    server (s)        Development Server
    build (b)         Build releases
```
``` bash
$ python3 aklive2d.py s -h
usage: aklive2d server [-h] [-p PORT] -o {skadi}

optional arguments:
  -h, --help            show this help message and exit
  -p PORT, --port PORT  Development server port (default: 8080)
  -o {skadi}, --operator {skadi}
                        <Required> Operatro to develop (default: None)
```
``` bash
$ python aklive2d.py b -h
usage: aklive2d build [-h] [-o {all,skadi} [{all,skadi} ...]]

optional arguments:
  -h, --help            show this help message and exit
  -o {all,skadi} [{all,skadi} ...], --operators {all,skadi} [{all,skadi} ...]
                        Operators to build (default: ['all'])
```
## Config
``` yaml
# List all the supported operators under <operators> block
operators:
  # Single operator block
  skadi: # <operator name>/<folder name under "operator" folder>, will be used to replace <{name}>
    common_name: dyn_illust_char_1012_skadi2 # common file name
    preview: preview.jpg # Steam workshop preview image file
    project_json: project.json # Steam workshop project file
    release_folder: ./release/{name}/ # The folder that stores game files for the showcase webpage
    source_folder: ./operator/{name}/extracted/ # The folder that stores extracted game files
    target_folder: ./operator/{name}/ # The folder that stores processed game files
    use_skel: true # For the Spine model, <true> for using skel file, otherwise use json
# Development server settings
server:
  operator_folder: /operator/ # The path that the showcase webpage accesses game files
  release_folder: ./release/ # The folder that stores the showcase webpage
  template_folder: /template/ # The folder that stores the showcase template
```
## LICENSE

The `LICENSE` file applies to all files unless listed specifically.

`LICENSE_SPINE` file applies to following files including adapted code for this repo:

- `template/assets/spine-player.css`
- `template/assets/spine-player.js`
- `release/*/assets/spine-player.css`
- `release/*/assets/spine-player.js`

`Copyright © 2017 - 2021 Arknights/Hypergryph Co., Ltd` applies to following files:

- all files under `operator` folder and its sub-folders
- all files under `release/*/operator/*` folder
- `release/*/operator/operator.js`
