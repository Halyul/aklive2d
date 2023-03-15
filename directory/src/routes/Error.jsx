import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} from "react";
import {
  useNavigate,
  useRouteError
} from "react-router-dom";
import header from '@/scss/root/header.module.scss'
import classes from '@/scss/error/Error.module.scss'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils';
import Switch from '@/component/switch';
import ReturnButton from "@/component/return_button";
import { Typewriter } from 'react-simple-typewriter'
import { useHeader } from '@/state/header';
import useAudio from '@/libs/voice';
import spine from '!/libs/spine-player'
import '!/libs/spine-player.css'
import useUmami from '@parcellab/react-use-umami';

const voiceOnAtom = atomWithStorage('voiceOn', false)
const config = JSON.parse(import.meta.env.VITE_ERROR_FILES)
const obj = config.files[Math.floor((Math.random() * config.files.length))]
const filename = obj.key.replace("#", "%23")
const padding = obj.paddings

export default function Error() {
  // eslint-disable-next-line no-unused-vars
  const _trackEvt = useUmami('/error')
  const error = useRouteError();
  const navigate = useNavigate();
  const {
    setTitle,
  } = useHeader()
  const [voiceOn, setVoiceOn] = useAtom(voiceOnAtom)
  const [spineDone, _setSpineDone] = useState(false)
  const spineRef = useRef(null)
  const [spineData, setSpineData] = useState(null)
  const { play, stop } = useAudio()
  const spineDoneRef = useRef(spineDone)
  const voiceOnRef = useRef(voiceOn)

  const setSpineDone = (data) => {
    spineDoneRef.current = data
    _setSpineDone(data)
  }
  
  const content = useMemo(() => ['エラー発生。', '发生错误。', 'Error occured.', '에러 발생.', '發生錯誤。'], [])

  useEffect(() => {
    console.log(error)
    fetch(`/${import.meta.env.VITE_DIRECTORY_FOLDER}/${filename}.json`).then(res => res.json()).then(data => {
      setSpineData(data)
    })
  }, [error])

  useEffect(() => {
    setTitle(content[0])
    stop()
  }, [content, setTitle, stop])

  useEffect(() => {
    if (!voiceOn) {
      stop()
    }
  }, [voiceOn, stop])

  useEffect(() => {
    voiceOnRef.current = voiceOn
  }, [voiceOn])

  const playVoice = useCallback(() => {
    play(`/${import.meta.env.VITE_DIRECTORY_FOLDER}/error.ogg`, { overwrite: true })
  }, [play])

  useEffect(() => {
    if (spineRef.current?.children.length === 0 && spineData) {
      new spine.SpinePlayer(spineRef.current, {
        skelUrl: `./assets/${filename}.skel`,
        atlasUrl: `./assets/${filename}.atlas`,
        rawDataURIs: spineData,
        animation: 'Relax',
        premultipliedAlpha: true,
        alpha: true,
        backgroundColor: "#00000000",
        viewport: {
          debugRender: false,
          padLeft: `${padding.left}%`,
          padRight: `${padding.right}%`,
          padTop: `${padding.top}%`,
          padBottom: `${padding.bottom}%`,
          x: 0,
          y: 0,
        },
        showControls: false,
        touch: false,
        fps: 60,
        defaultMix: 0,
        success: (player) => {
          let isPlayingInteract = false
          player.animationState.addListener({
            end: (e) => {
              if (e.animation.name == "Interact") {
                isPlayingInteract = false;
              }
            }
          });
          setSpineDone(true)
          const ani = () => {
            if (isPlayingInteract) {
              return;
            }
            isPlayingInteract = true;
            player.animationState.setAnimation(0, "Interact", false, 0);
            player.animationState.addAnimation(0, "Relax", true, 0);
            if (voiceOnRef.current) playVoice()
          }
          ani()
          player.canvas.onclick = () => {
            ani()
          }
          player.canvas.onmouseenter = () => {
            ani()
          }
        }
      })
    }
  }, [playVoice, spineData]);

  return (
    <section className={classes.error}>
      <header className={`${header.header} ${classes.header}`}>
        <ReturnButton
          onClick={() => navigate(-1, { replace: true })}
        />
        <Switch
          key="voice"
          text='voice'
          on={voiceOn}
          handleOnClick={() => setVoiceOn(!voiceOn)}
        />
      </header>
      <main className={classes.main}>
        {
          content.map((item, index) => {
            return (
              <section key={index} className={classes.content}>
                <Typewriter
                  words={[item]}
                  cursor
                  cursorStyle='|'
                  typeSpeed={100}
                />
              </section>
            )
          })
        }
        <section
          className={`${classes.spine} ${spineDone ? classes.active : ''}`}
          ref={spineRef}
        />
      </main>
    </section>
  );
}