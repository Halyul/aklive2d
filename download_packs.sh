#!/bin/bash

echo "Retrieving Config"
CURRENT_VERSION=$(curl -X GET \
  'https://ak-conf.hypergryph.com/config/prod/official/Android/version' \
  --header 'Accept: */*' \
  --header 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 12; 22021211RC Build/V417IR)' \
  --header 'X-Unity-Version: 2017.4.39f1' \
  | jq -r ".resVersion")

CURRENT_LPACK_V=$(curl -X GET \
  "https://ak.hycdn.cn/assetbundle/official/Android/assets/${CURRENT_VERSION}/hot_update_list.json" \
  --header 'Accept: */*' \
  --header 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 12; 22021211RC Build/V417IR)' \
  --header 'X-Unity-Version: 2017.4.39f1' \
  | jq -r '.packInfos | .[] | select( .name | test("^lpack_v[0-9]+")) | .name')

TARGET_FOLDER="temp"
FILES_TO_DOWNLOAD=("lpack_misc1 lpack_misc2 lpack_misc3 lpack_misc4 lpack_vcjp1 lpack_vcjp2 lpack_vcjp3 lpack_vccn1 lpack_vccn2 lpack_vcbsc lpack_vckr1 lpack_vckr2 lpack_vcen1 lpack_vcen2 lpack_vccsm lpack_init1 lpack_init2 lpack_init3 lpack_init4 lpack_dynilst lpack_crart1 lpack_crart2 lpack_music1 lpack_music2 lpack_lcom ${CURRENT_LPACK_V}")
AK_HOST="ak.hycdn.cn:443:112.60.32.19"

echo

# echo "Downloading Latest APK"
# current_file=./$TARGET_FOLDER/latest.apk
# curl --resolve $AK_HOST -L -o ./$TARGET_FOLDER/latest.apk https://ak.hypergryph.com/downloads/android_lastest
# echo "Extracting APK" 
# unzip -q $current_file "assets/AB/Android/*" -d ./$TARGET_FOLDER && rm $current_file

for file in $FILES_TO_DOWNLOAD
do
  current_file=./$TARGET_FOLDER/$file.dat
  echo "Downloading $current_file"
  curl --resolve $AK_HOST --create-dirs -o $current_file https://ak.hycdn.cn/assetbundle/official/Android/assets/$CURRENT_VERSION/$file.dat

  echo "Extracting $file" 
  unzip -q $current_file -d ./$TARGET_FOLDER && rm $current_file
  echo
done

ASSET_FOLDER="assets"
FILES_TO_KEEP=("spritepack/ui_camp_logo_0.ab" "arts/dynchars" "chararts" "skinpack" "arts/ui/homebackground/wrapper" "arts/charportraits" "audio/sound_beta_2/music" "audio/sound_beta_2/voice*")
FILES_DESTS=("ui_camp_logo_0.ab" "dynchars" "chararts" "skinpack" "homebackground" "charportraits" "music" ".")
mkdir -p ./$ASSET_FOLDER

for i in "${!FILES_TO_KEEP[@]}"; do
    current_file=./$TARGET_FOLDER/${FILES_TO_KEEP[$i]}
    target_file=./$ASSET_FOLDER/${FILES_DESTS[$i]}
    echo "Moving $current_file"
    mv $current_file $target_file
    echo
done
rm -r $TARGET_FOLDER