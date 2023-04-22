# aklive2d

A project that builds showcase webpage for Arknights Live2D-equipped operators. Showcase webpage can be used as a wallpaper for Wallpaper Engine on Windows or [Plash](https://github.com/sindresorhus/Plash) on macOS (not tested).

## Upcoming Updates

Version: `4th Anniversary`

- [ ] Operator: Silence the Paradiagmatic (unsure)
- [ ] Operator: Muelsyse
- [ ] Skin: Born as One / Specter the Unchained
- [ ] Skin: Ten Thousand Mountains / Ch'en/Chen the Holungday
- [ ] Skin: Remnant / Kal'tsit (probably with new voice)
- [ ] Background and Music Update
- [ ] Voice: Chinese Topolect for Lee

## Softwares
- For Windows users: Use [Wallpaper Engine](https://www.wallpaperengine.io/en) or other softwares that support using webpage as desktop wallpaper.
- For macOS users: Use [Plash](https://github.com/sindresorhus/Plash), however, I don't have macOS machine, so your mileage may vary.
- For Linux users: You power user should be able to find your solutions!

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
| Voice Lines<sup>3</sup> | gamedata/excel/charword_table.ab | TextAsset |
| Portrait Images<sup>1</sup> | arts/charportraits | Texture2D |
| Home Music<sup>2</sup> | audio/sound_beta_2/music | AudioClip |

<sup>1</sup>: `portrait_hub` is required to locate the image

<sup>2</sup>: `gamedata/excel/display_meta_table.json->homeBackgroundData`<sup>3</sup> is required to locate the music. A more detailed mapping can be found at [音乐鉴赏/游戏内音乐一览 - PRTS.wiki](https://prts.wiki/w/%E9%9F%B3%E4%B9%90%E9%89%B4%E8%B5%8F/%E6%B8%B8%E6%88%8F%E5%86%85%E9%9F%B3%E4%B9%90%E4%B8%80%E8%A7%88) and [首页场景一览 - PRTS.wiki](https://prts.wiki/w/%E9%A6%96%E9%A1%B5%E5%9C%BA%E6%99%AF%E4%B8%80%E8%A7%88)

<sup>3</sup>: Data is encryped, decryped version can be obtained from [ArknightsGameData](https://github.com/Kengxxiao/ArknightsGameData)

## Supported Operators

| Operator | Live Preview | Steam Workshop |
|----------|--------------|----------------|
| Nian | [Link](https://arknights.halyul.dev/nian/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2564642594) |
| Unfettered Freedom / Nian | [Link](https://arknights.halyul.dev/nian_unfettered_freedom/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2730943815) |
| Focus / Phatom | [Link](https://arknights.halyul.dev/phatom_focus/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2786960745) |
| W | [Link](https://arknights.halyul.dev/w/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2642838078) |
| Wonder / W | [Link](https://arknights.halyul.dev/w_wonder/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2802584758) |
| Rosmontis | [Link](https://arknights.halyul.dev/rosmontis/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2642834981) |
| Dusk | [Link](https://arknights.halyul.dev/dusk/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2730942651) |
| Everything is a Miracle / Dusk | [Link](https://arknights.halyul.dev/dusk_everything_is_a_miracle/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2730943249) |
| Skadi the Corrupting Heart | [Link](https://arknights.halyul.dev/skadi/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2492307783) |
| Sublimation / Skadi the Corrupting Heart | [Link](https://arknights.halyul.dev/skadi_sublimation/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2802570125) |
| Ch'en the Holungday | [Link](https://arknights.halyul.dev/chen/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2564643862) |
| Nearl the Radiant Knight | [Link](https://arknights.halyul.dev/nearl/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2642836787) |
| Ling | [Link](https://arknights.halyul.dev/ling/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2730944363) |
| Specter the Unchained | [Link](https://arknights.halyul.dev/specter/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2802596772) |
| Gavial the Invincible | [Link](https://arknights.halyul.dev/gavial/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2847605961) |
| Colorful Wonderland / Surtr | [Link](https://arknights.halyul.dev/surtr_colorful_wonderland/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2847602015) |
| Trust Your Eyes / Lee | [Link](https://arknights.halyul.dev/lee_trust_your_eyes/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2879452075) |
| Texas the Omertosa | [Link](https://arknights.halyul.dev/texas_the_omertosa/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2883008286) |
| Relight / Nearl | [Link](https://arknights.halyul.dev/nearl_relight/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2883016965) |
| Become Anew / Rosmontis | [Link](https://arknights.halyul.dev/rosmontis_become_anew/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2883012349) |
| Dream in a Moment / Passager | [Link](https://arknights.halyul.dev/passager_dream_in_a_moment/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2883021565) |
| Summer Feast / Mizuki | [Link](https://arknights.halyul.dev/mizuki_summer_feast/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2895953271) |
| Chongyue | [Link](https://arknights.halyul.dev/chongyue/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2919486659) |
| It Does Wash the Strings / Ling | [Link](https://arknights.halyul.dev/ling_it_does_wash_the_strings/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2919482772) |
| Snowy Plains in Words / Позёмка | [Link](https://arknights.halyul.dev/pozemka_snowy_plains_in_words/?settings) | [Link](https://steamcommunity.com/sharedfiles/filedetails/?id=2933544301) |
