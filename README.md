# aklive2d

A project that builds showcase webpage for Arknights Live2D-equipped operators. Showcase webpage can be used as a wallpaper for Wallpaper Engine on Windows or [Plash](https://github.com/sindresorhus/Plash) on macOS (not tested).

## Softwares
- For Windows users: Use [Wallpaper Engine](https://www.wallpaperengine.io/en) or other softwares that support using webpage as desktop wallpaper.
- For macOS users: Use [Plash](https://github.com/sindresorhus/Plash), however, I don't have macOS machine, so your mileage may vary.
- For Linux users: You power user should be able to find your solutions!

## Usage
### Command Line Tool

``` bash
$ node runner.js generate {operator_name}
To generate operator assets for showcase page
```
``` bash
$ node runner.js dev {operator_name}
Live showcase page server for development
```
``` bash
$ node runner.js build {operator_name}
Build showcase webpage for an operator
```
``` bash
$ node runner.js build-all
To generate all operator assets for showcase page
```
``` bash
$ node runner.js init {operator_name}
To initialize folder and config file for an operator
```
``` bash
$ node runner.js readme {operator_name}
To add operator info to README.md
```
``` bash
$ node runner.js directory
To generate directory.json
```
### Webpage & JavaScript

Add query string `settings` to bring up the settings panel to adjust your settings. Then use appropriate JavaScript code to load your settings

``` javascript
settings.setFPS(integer) // set FPS
settings.setLogoDisplay(boolean) // display logo or not
settings.setLogoRatio(float) // the ratio of the logo
settings.setLogoOpacity(float) // the opacity of the logo
settings.setLogo(url) // change the logo, url: image url, removeInvert: boolean
settings.resetLogoImage() // reset to the default logo
settings.setDefaultBackground(url) // change the default background, url: image filename from `background` folder
settings.setBackgoundImage(url) // change the background, url: image url
settings.resetBackground() // reset to the default background
settings.positionPadding("left", integer) // left padding
settings.positionPadding("right", integer) // right padding
settings.positionPadding("top", integer) // top padding
settings.positionPadding("bottom", integer) // bottom padding
settings.positionReset() // reset the position

settings.open() // open settings panel
settings.close() // close settings panel
settings.reset() // reset settings
```

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
| Dynaimc Character | arts/dynchars/ | Texture2D & TextAsset |
| Static Image | Operator: chararts/ ; Skin: skinpack/ | Texture2D |
| Background | arts/ui/homebackground/wrapper/ | Sprite |
| Voice Clips | audio/sound_beta_2/voice{_*}/ | AudioClip |
| Voice Lines* | gamedata/excel/charword_table.ab | TextAsset |

*: Data is encryped, decryped version can be obtained from [ArknightsGameData](https://github.com/Kengxxiao/ArknightsGameData)

## Supported Operators

| Operator | Live Preview | Steam Workshop |
|----------|--------------|----------------|
| Nian | [Link](https://arknights.halyul.dev/nian/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2564642594) |
| Unfettered Freedom / Nian | [Link](https://arknights.halyul.dev/nian_unfettered_freedom/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2730943815) |
| Focus / Phatom | [Link](https://arknights.halyul.dev/phatom_focus/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2786960745) |
| W | [Link](https://arknights.halyul.dev/w/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2642838078) |
| Fugue / W | [Link](https://arknights.halyul.dev/w_fugue/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2802584758) |
| Rosmontis | [Link](https://arknights.halyul.dev/rosmontis/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2642834981) |
| Dusk | [Link](https://arknights.halyul.dev/dusk/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2730942651) |
| Everything is a Miracle / Dusk | [Link](https://arknights.halyul.dev/dusk_everything_is_a_miracle/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2730943249) |
| Skadi the Corrupting Heart | [Link](https://arknights.halyul.dev/skadi/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2492307783) |
| Sublimation / Skadi the Corrupting Heart | [Link](https://arknights.halyul.dev/skadi_sublimation/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2802570125) |
| Ch'en the Holungday | [Link](https://arknights.halyul.dev/chen/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2564643862) |
| Nearl the Radiant Knight | [Link](https://arknights.halyul.dev/nearl/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2642836787) |
| Ling | [Link](https://arknights.halyul.dev/ling/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2730944363) |
| Specter the Unchained | [Link](https://arknights.halyul.dev/specter/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2802596772) |
| Gavial the Invincible | [Link](https://arknights.halyul.dev/gavial/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2847605961) |
| Colorful Wonderland / Surtr | [Link](https://arknights.halyul.dev/surtr_colorful_wonderland/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2847602015) |
| Trust Your Eyes / Lee | [Link](https://arknights.halyul.dev/lee_trust_your_eyes/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2879452075) |
| Texas the Omertosa | [Link](https://arknights.halyul.dev/texas_the_omertosa/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2883008286) |
| Relight / Nearl | [Link](https://arknights.halyul.dev/nearl_relight/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2883016965) |
| Become Anew / Rosmontis | [Link](https://arknights.halyul.dev/rosmontis_become_anew/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2883012349) |
| Dream in a Moment / Passager | [Link](https://arknights.halyul.dev/passager_dream_in_a_moment/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2883021565) |
| Summer Feast / Mizuki | [Link](https://arknights.halyul.dev/mizuki_summer_feast/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2895953271) |
| Chongyue | [Link](https://arknights.halyul.dev/chongyue/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2919486659) |
| It Does Wash the Strings / Ling | [Link](https://arknights.halyul.dev/ling_it_does_wash_the_strings/) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2919482772) |