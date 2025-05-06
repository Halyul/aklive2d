# aklive2d

A project that builds showcase webpage for Arknights Live2D-equipped operators. Showcase webpage can be used as a wallpaper for Wallpaper Engine on Windows or [Plash](https://github.com/sindresorhus/Plash) on macOS (not tested).

## Softwares
- For Windows users: Use [Wallpaper Engine](https://www.wallpaperengine.io/en) or other softwares that support using webpage as desktop wallpaper.
- For macOS users: Use [Plash](https://github.com/sindresorhus/Plash), however, I don't have macOS machine, so your mileage may vary.
- For Linux users: You power user should be able to find your solutions!

## Supported Operators
A list of supported operators can be found at [Directory](https://gura.ch/aklive2d) page.

## Usage
### Command Line Tool

``` bash
$ pnpm run update
Update data from official website and github repo
```
``` bash
$ pnpm run lint
ESLint and StyleLint
```
``` bash
$ pnpm run build
Build showcase webpage for all operators and directory page
```
``` bash
$ name=<name> pnpm run build
Build showcase webpage for an operator
```
``` bash
$ name=<name> id=<id> pnpm run init
To initialize folder and config file for an operator
```
``` bash
$ name=<name> pnpm run dev:showcase
Run dev server for showcase webpage for an operator
```
``` bash
$ name=<name> pnpm run preview:showcase
Preview built showcase webpage for an operator
```
``` bash
$ pnpm run dev:directory
Run dev server for directory webpage
```
``` bash
$ name=<name> pnpm run preview:directory
Preview built directory webpage
```
``` bash
$ pnpm run preview
Preview built all webpages
```
``` bash
$ name=<name> id=<id> pnpm run init
Init new operator config
```
``` bash
$ pnpm run download:game
Download latest game data from Arknights
```
``` bash
$ pnpm run download:data
Download extracted game assets
```
### Webpage & JavaScript

Add query string `aklive2d` to bring up the settings panel to adjust your settings.
Settings can be adjusted under `window.aklive2d` or by dispatching custom events (under `window.aklive2d.events`) to `document`.
Examples can be found at `apps/showcase/src/components/wallpaper_engine.js`.

```js
document.dispatchEvent(
    window.aklive2d.events.RegisterConfig.handler({
        target: 'background',
        key: 'default',
        value: 'bg_sui_1.png',
    })
)
```

Using JS events to change settings is recommended.

## Config
### General Config
in `packages/config/config.yaml`

Settings for the whole project
``` yaml
site_id: aklive2d
akassets:
    project_name: akassets
    url: https://akassets.pages.dev
insight:
    id: aklive2d
    url: https://insight.halyul.dev/on-demand.js
module:
    assets:
        config_yaml: config.yaml
        background: background
        music: music
        charword_table: charword_table
        project_json: project_json
    background:
        operator_bg_png: operator_bg.png
    charword_table:
        charword_table_json: charword_table.json
    music:
        music_table_json: music_table.json
        display_meta_table_json: display_meta_table.json
        audio_data_json: audio_data.json
    official_info:
        official_info_json: official_info.json
    operator:
        operator: operator
        config: config
        template_yaml: _template.yaml
        config_yaml: config.yaml
        portraits: _portraits
        logos_assets: _logos
        logos: logos
        directory_assets: _directory
        MonoBehaviour: MonoBehaviour
        Texture2D: Texture2D
        title:
            zh-CN: '明日方舟：'
            en-US: 'Arknights: '
    project_json:
        project_json: project.json
        preview_jpg: preview.jpg
        template_yaml: project_json.yaml
    wrangler:
        index_json: index.json
    vite_helpers:
        config_json: config.json
app:
    showcase:
        public: public
        assets: assets
dir_name:
    data: data
    dist: dist
    extracted: extracted
    auto_update: auto_update
    voice:
        main: voice
        sub:
            - name: jp
              lang: JP
              lookup_region: zh_CN
            - name: cn
              lang: CN_MANDARIN
              lookup_region: zh_CN
            - name: en
              lang: EN
              lookup_region: en_US
            - name: kr
              lang: KR
              lookup_region: ko_KR
            - name: custom
              lang: CUSTOM
              lookup_region: zh_CN
directory:
    assets_dir: _assets
    title: AKLive2D
    voice: jp/CN_037.ogg
    error:
        files:
            - key: build_char_128_plosis_epoque#3
              paddings:
                  left: -120
                  right: 150
                  top: 10
                  bottom: 0
            - key: build_char_128_plosis
              paddings:
                  left: -90
                  right: 100
                  top: 10
                  bottom: 0
        voice:
            file: CN_034.ogg
            target: error.ogg
```
### Operators Config
in `packages/operator/config.yaml`
```yaml
chen: !include config/chen.yaml
dusk: !include config/dusk.yaml
dusk_everything_is_a_miracle: !include config/dusk_everything_is_a_miracle.yaml
ling: !include config/ling.yaml
nearl: !include config/nearl.yaml
nian: !include config/nian.yaml
nian_unfettered_freedom: !include config/nian_unfettered_freedom.yaml
phantom_focus: !include config/phantom_focus.yaml
rosmontis: !include config/rosmontis.yaml
skadi: !include config/skadi.yaml
skadi_sublimation: !include config/skadi_sublimation.yaml
w: !include config/w.yaml
...
```
### Operator Config
in `packages/operator/config/<name>.yaml`
```yaml
filename: dyn_illust_char_1013_chen2 # live2d assets name
logo: logo_rhodes_override # operator logo
fallback_name: char_1013_chen2_2 # fallback image name
viewport_left: 0 # live2d view port settings
viewport_right: 0
viewport_top: 0
viewport_bottom: 0
invert_filter: false # operator logo invert filter
codename: # operator name
  zh-CN: 假日威龙陈
  en-US: Ch'en/Chen the Holungday
use_json: false # whether the spine skel is in json format
```
## LICENSE

The `LICENSE` file applies to all files unless listed specifically.

`LICENSE_SPINE` file applies to following files including adapted code for this repo:

- `apps/module/libs/spine-player.css`
- `apps/module/libs/spine-player.js`

`Copyright © 2017 - 2023 Arknights/Hypergryph Co., Ltd` applies to following files:

- all files under `packages/operator/data` folder and its sub-folders
- all files under `packages/music/data` folder and its sub-folders
- all files under `packages/background/data` folder and its sub-folders

## Instructions on Extracting In-Game Assets
| Assets Name | Location | Type |
|-------------|----------|------|
| Logos       | spritepack/ui_camp_logo_0.ab | Sprite |
| Logo Mapping | gamedata/art/handbookpos_table.json<sup>3</sup> | TextAsset |
| Dynaimc Character | arts/dynchars/ | Texture2D & TextAsset |
| Static Image | Operator: chararts/ ; Skin: skinpack/ | Texture2D |
| Background | arts/ui/homebackground/wrapper/ | Sprite |
| Voice Clips | audio/sound_beta_2/voice{_*}/ | AudioClip |
| Voice Lines<sup>3</sup> | gamedata/excel/charword_table.ab | TextAsset |
| Portrait Images<sup>1</sup> | arts/charportraits | Texture2D & MonoBehaviour |
| Home Music<sup>2</sup> | audio/sound_beta_2/music | AudioClip |

<sup>1</sup>: `portrait_hub` is required to locate the image

<sup>2</sup>: `gamedata/excel/display_meta_table.json->homeBackgroundData`<sup>3</sup> and `gamedata/excel/audio_data.json`<sup>3</sup> is required to locate the music.

<sup>3</sup>: Data is encryped, decryped version can be obtained from [ArknightsGameData](https://github.com/Kengxxiao/ArknightsGameData) for the Chinese version and [Kengxxiao/ArknightsGameData_YoStar](https://github.com/Kengxxiao/ArknightsGameData_YoStar) for other regions.
