#!/bin/bash

echo "Retrieving Config"
CURRENT_VERSION=$(curl -X GET \
  'https://ak-conf.hypergryph.com/config/prod/official/Android/version' \
  --header 'Accept: */*' \
  --header 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 12; 22021211RC Build/V417IR)' \
  --header 'X-Unity-Version: 2017.4.39f1' \
  | jq -r ".resVersion")

TARGET_FOLDER="assets"
FILES=("lpack_vcjp lpack_vccn lpack_vcbsc lpack_vckr lpack_vcen lpack_vccsm lpack_v052 lpack_init lpack_dynilst lpack_crart lpack_music lpack_lcom")
AK_HOST="ak.hycdn.cn:443:123.184.27.60"

echo

# echo "Downloading Latest APK"
# current_file=./$TARGET_FOLDER/latest.apk
# curl --resolve $AK_HOST -L -o ./$TARGET_FOLDER/latest.apk https://ak.hypergryph.com/downloads/android_lastest
# echo "Extracting APK" 
# unzip -q $current_file "assets/AB/Android/*" -d ./$TARGET_FOLDER && rm $current_file

for file in $FILES
do
    current_file=./$TARGET_FOLDER/$file.dat
    echo "Downloading $current_file"
    curl --resolve $AK_HOST --create-dirs -o $current_file https://ak.hycdn.cn/assetbundle/official/Android/assets/$CURRENT_VERSION/$file.dat

    echo "Extracting $file" 
    unzip -q $current_file -d ./$TARGET_FOLDER && rm $current_file
    echo
done