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
$ npm run generate {operator_name}
To generate operator assets for showcase page
```
``` bash
$ npm run dev {operator_name}
Live showcase page server for development
```
``` bash
$ npm run build {operator_name}
Build showcase webpage for an operator
```
``` bash
$ npm run build-all
To generate all operator assets for showcase page
```
``` bash
$ npm run init {operator_name}
To initialize folder and config file for an operator
```
``` bash
$ npm run readme {operator_name}
To add operator info to README.md
```
``` bash
$ npm run directory
To generate directory.json
```
``` bash
$ npm run charword
To generate the latest charword_table.json
```
### Webpage & JavaScript

Add query string `aklive2d` to bring up the settings panel to adjust your settings. 
Settings can be adjusted under `window.aklive2d` or by dispatching custom events (under `window.aklive2d.events`) to `document`. 
Examples can be found at `showcase/src/libs/wallpaper_engine.js`.

Using JS events to change settings is recommended.

## Config
### General Config
``` yaml
folder: 
  operator: ./operator/ # folder for operator assets
  release: ./release/ # folder for released showcase page
operators:
  chen: !include config/chen.yaml # include the config for the operator under folder `config/chen.yaml`
  dusk: !include config/dusk.yaml
  dusk_everything_is_a_miracle: !include config/dusk_everything_is_a_miracle.yaml
  ling: !include config/ling.yaml
  nearl: !include config/nearl.yaml
  nian: !include config/nian.yaml
  nian_unfettered_freedom: !include config/nian_unfettered_freedom.yaml
  phatom_focus: !include config/phatom_focus.yaml
  rosmontis: !include config/rosmontis.yaml
  skadi: !include config/skadi.yaml
  skadi_sublimation: !include config/skadi_sublimation.yaml
  w: !include config/w.yaml
  w_fugue: !include config/w_fugue.yaml
  specter: !include config/specter.yaml
  gavial: !include config/gavial.yaml
  surtr_colorful_wonderland: !include config/surtr_colorful_wonderland.yaml
  lee_trust_your_eyes: !include config/lee_trust_your_eyes.yaml
  texas_the_omertosa: !include config/texas_the_omertosa.yaml
  nearl_relight: !include config/nearl_relight.yaml
  rosmontis_become_anew: !include config/rosmontis_become_anew.yaml
  passager_dream_in_a_moment: !include config/passager_dream_in_a_moment.yaml
  mizuki_summer_feast: !include config/mizuki_summer_feast.yaml
```
### Operator Config
```yaml
link: chen # the link to access showcase page for this operator
type: operator # operator live2d or skin live2d
date: 2021/08 # release date
title: 'Arknights: Ch''en/Chen the Holungday - 明日方舟：假日威龙陈' # page title
filename: dyn_illust_char_1013_chen2 # live2d assets name
logo: logo_rhodes_override # operator logo
fallback_name: char_1013_chen2_2 # fallback image name
viewport_left: 0 # live2d view port settings
viewport_right: 0
viewport_top: 1
viewport_bottom: 1
invert_filter: false # operator logo invert filter
```
## LICENSE

The `LICENSE` file applies to all files unless listed specifically.

`LICENSE_SPINE` file applies to following files including adapted code for this repo:

- `src/libs/spine-player.css`
- `src/libs/spine-player.js`

`Copyright © 2017 - 2023 Arknights/Hypergryph Co., Ltd` applies to following files:

- all files under `operator` folder and its sub-folders

## Instructions on Extracting In-Game Assets
I'm still struggling to find a command-line tool to extract in-game assets. But [AssetRipper](https://github.com/AssetRipper/AssetRipper) seems to have a command-line interface, I'm too lazy to have a deeper inverstigation.

| Assets Name | Location | Type |
|-------------|----------|------|
| Logos       | spritepack/ui_camp_logo_h2_0.ab | Sprite |
| Logos for collaboration | spritepack/ui_camp_logo_h2_linkage_0.ab | Sprite |
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

## URLs

| Name | URL | Note |
|------|-----|------|
| Config | [link](https://ak-conf.hypergryph.com/config/prod/official/Android/version) | Version info |
| Current Hot Update JSON | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/hot_update_list.json) | Directory JSON | 
| Voice JP | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_vcjp.dat) | Voice JP |
| Voice CN | [link 1](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_vccn.dat), [link 2](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_vcbsc.dat) | Voice CN |
| Voice KR | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_vckr.dat) | Voice KR |
| Voice EN | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_vcen.dat) | Voice EN |
| Voice Custom | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_vccsm.dat) | Voice Custom |
| Misc | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_v052.dat) | Latest Home Background, Skin Static Image |
| Init | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_init.dat) | Logos, Background, Portrait Images |
| Dynaimc Characters | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_dynilst.dat) | Dynaimc Character |
| Static Image | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_crart.dat) | Operator Static Image |
| Home Music | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_music.dat) | Home Music |
| L Com? | [link](https://ak.hycdn.cn/assetbundle/official/Android/assets/24-07-09-15-29-50-f0a675/lpack_lcom.dat) | portrait_hub.ab |