# aklive2d

A project that builds showcase webpage for Arknights Live2D-equipped operators. Showcase webpage can be used as a wallpaper for Wallpaper Engine on Windows or [Plash](https://github.com/sindresorhus/Plash) on macOS (not tested).

## Supported Operators

| Operator | Live Preview | Steam Workshop |
|----------|--------------|----------------|
| Nian | [Link](https://arknights.halyul.dev/nian/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2492307783) |
| Skadi the Corrupting Heart | [Link](https://arknights.halyul.dev/skadi/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2492307783) |
| Ch'en the Holungday | [Link](https://arknights.halyul.dev/chen/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2492307783) |

- For Windows users: Use [Wallpaper Engine](https://www.wallpaperengine.io/en) or other softwares that support using webpage as desktop wallpaper.
- For macOS users: Use [Plash](https://github.com/sindresorhus/Plash), however, I don't have macOS machine, so your mileage may vary.
- For Linux users: You power user should be able to find your solutions!

## Usage
### Command Line Tool

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
usage: aklive2d server [-h] [-p PORT] -o OPERATOR_NAME

optional arguments:
  -h, --help            show this help message and exit
  -p PORT, --port PORT  Development server port (default: 8080)
  -o OPERATOR_NAME, --operator OPERATOR_NAME
                        <Required> Operatro to develop (default: None)
```
``` bash
$ python aklive2d.py b -h
usage: aklive2d build [-h] [-o OPERATOR_NAMES [OPERATOR_NAMES ...]] [-r]

optional arguments:
  -h, --help            show this help message and exit
  -o OPERATOR_NAMES [OPERATOR_NAMES ...], --operators OPERATOR_NAMES [OPERATOR_NAMES ...]
                        Operators to build (default: ['all'])
  -r, --rebuild         Rebuild assets (default: False)
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
# List all the supported operators under <operators> block
operators:
  # Single operator block
  skadi: # <operator name>/<folder name under "operator" folder>, will be used to replace <{name}>
    common_name: dyn_illust_char_1012_skadi2 # common file name
    fallback_name: char_1012_skadi2_2 # fallback image file name
    logo_name: logo_egir # operator logo file name under operator/_logo folder
    preview: preview.jpg # Steam workshop preview image file
    project_json: project.json # Steam workshop project file
    release_folder: ./release/{name}/ # The folder that stores game files for the showcase webpage
    source_folder: ./operator/{name}/extracted/ # The folder that stores extracted game files
    target_folder: ./operator/{name}/ # The folder that stores processed game files
    title: Skadi the Corrupting Heart # Webpage title
    use_skel: true # For the Spine model, <true> for using skel file, otherwise use json
# Development server settings
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
