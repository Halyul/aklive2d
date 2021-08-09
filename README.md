# aklive2d

A project that builds showcase webpage for Arknights Live2D-equipped operators. Showcase webpage can be used as a wallpaper for Wallpaper Engine on Windows or [Plash](https://github.com/sindresorhus/Plash) on macOS (not tested).

## Supported Operators

| Operator | Live Preview | Steam Workshop |
|----------|--------------|----------------|
| Nian | [Link](https://arknights.halyul.dev/nian/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2564642594) |
| Skadi the Corrupting Heart | [Link](https://arknights.halyul.dev/skadi/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2492307783) |
| Ch'en the Holungday | [Link](https://arknights.halyul.dev/chen/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2564643862) |

- For Windows users: Use [Wallpaper Engine](https://www.wallpaperengine.io/en) or other softwares that support using webpage as desktop wallpaper.
- For macOS users: Use [Plash](https://github.com/sindresorhus/Plash), however, I don't have macOS machine, so your mileage may vary.
- For Linux users: You power user should be able to find your solutions!

## Usage
### Command Line Tool

``` bash
$ python3 aklive2d.py -h  
usage: aklive2d [-h] {server,s,build,b,init,i} ...

Arknights Live 2D Wallpaper Builder

optional arguments:
  -h, --help            show this help message and exit

Available commands:
  {server,s,build,b,init,i}
                        <Required> Select the command to run
    server (s)          Development Server
    build (b)           Build releases
    init (i)            Initialize a new operator
```
``` bash
$ python3 aklive2d.py s -h
usage: aklive2d server [-h] [-p PORT] -o OPERATOR_NAME [-r]

optional arguments:
  -h, --help            show this help message and exit
  -p PORT, --port PORT  Development server port (default: 8080)
  -o OPERATOR_NAME, --operator OPERATOR_NAME
                        <Required> Operator to develop (default: None)
  -r, --rebuild         Rebuild assets (default: False)
```
``` bash
$ python3 aklive2d.py b -h
usage: aklive2d build [-h] [-o OPERATOR_NAMES [OPERATOR_NAMES ...]] [-r]

optional arguments:
  -h, --help            show this help message and exit
  -o OPERATOR_NAMES [OPERATOR_NAMES ...], --operators OPERATOR_NAMES [OPERATOR_NAMES ...]
                        Operators to build (default: ['all'])
  -r, --rebuild         Rebuild assets (default: False)
```
``` bash
$ python3 aklive2d.py i -h
usage: aklive2d init [-h] [-c OPERATOR_NAME]

optional arguments:
  -h, --help            show this help message and exit
  -c OPERATOR_NAME, --copy OPERATOR_NAME
                        YAML pre-defined Operator assets to copy (default: None)
```
### Webpage & JavaScript

Add query string `settings` to bring up the settings panel to adjust your settings. Then use appropriate JavaScript code to load your settings

``` javascript
settings.setFPS(integer) // set FPS
settings.displayLogo(boolean) // display logo or not
settings.resizeLogo(float) // the ratio of the logo
settings.opacityLogo(float) // the opacity of the logo
settings.setLogo(url, removeInvert) // change the logo, url: image url, removeInvert: boolean
settings.setBackground(url) // change the background, url: image url
settings.positionPadding("padLeft", integer) // left padding
settings.positionPadding("padRight", integer) // right padding
settings.positionPadding("padTop", integer) // top padding
settings.positionPadding("padBottom", integer) // bottom padding

settings.open() // open settings panel
settings.close() // close settings panel
settings.reset() // reset settings
```

## Config
``` yaml
# share properties for all operators
operator:
  preview: preview.jpg # Steam workshop preview image file
  project_json: project.json # Steam workshop project file
  source_folder: ./operator/{name}/extracted/ # The folder that stores extracted game files
  target_folder: ./operator/{name}/processed/ # The folder that stores processed game files
  use_skel: true # For the Spine model, <true> for using skel file, otherwise use json
# Development server settings
# List all the supported operators under <operators> block
operators:
  chen: # <operator name>/<folder name under "operator" folder>, will be used to replace <{name}> above
    _operator_settings.js: # refer to char_1013_chen2_2_settings.js under operator folder
      fallbackImage_height: 2048 # fallback image height
      fallbackImage_width: 2048 # fallback image width
      filename: dyn_illust_char_1013_chen2 # common file name
      fps: 60 # default fps target in the webpage
      opacity: 100 # optional property, can be used in the file
      viewport_bottom: 1 # bottom padding of the model
      viewport_left: 0 # left padding of the model
      viewport_right: 0 # right padding of the model
      viewport_top: 1 # top padding of the model
    index.html: # refer to index.html under template folder
      fallback_name: char_1013_chen2_2 # fallback image name
      id: char_1013_chen2 # id of the operator
      operator_logo: logo_rhodes_override # operator logo
      title: Ch'en the Holungday # webpage title
      version: __get_version # eval __get_version() function
    project.json: # refer to project.json under operator folder
      description: 'Arknights: Ch''en/Chen the Holungday Live 2D\n明日方舟：假日威龙陈 Live
        2D\nThe model is extracted from game with Spine support.\n模型来自游戏内提取，支持Spine\nPlease
        set your FPS target in Wallpaper Engine > Settings > Performance > FPS\n请在
        Wallpaper Engine > 设置 > 性能 > FPS 下设置FPS\n\nLive preview on: https://arknights.halyul.dev/chen\nGithub:
        https://github.com/Halyul/aklive2d' # Steam Workshop description
      title: 'Arknights: Ch''en/Chen the Holungday - 明日方舟：假日威龙陈' # Steam Workshop title
      ui_logo_opacity: 100 # logo opacity setting in WE
      ui_logo_ratio: 61.8 # logo ratio setting in WE
      ui_operator_logo: 'true' # enable/disable logo in WE
      ui_position_padding_bottom: 1 # bottom padding of the model in WE
      ui_position_padding_left: 0 # left padding of the model in WE
      ui_position_padding_right: 0 # right padding of the model in WE
      ui_position_padding_top: 1 # top padding of the model in WE
      workshopid: 2564643862 # Steam Workshop id
server:
  operator_folder: ./operator/ # The path that the showcase webpage accesses game files
  release_folder: ./release/ # The folder that stores the showcase webpage
  template_folder: ./template/ # The folder that stores the showcase template
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
- `release/*/operator/operator_assets.js`
