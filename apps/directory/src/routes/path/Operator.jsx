import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import classes from '@/scss/operator/Operator.module.scss'
import { useConfig } from '@/state/config'
import { useLanguage } from '@/state/language'
import { useHeader } from '@/state/header'
import { useAppbar } from '@/state/appbar'
import VoiceElement from '@/component/voice'
import useInsight from '@/state/insight'
import { Player as SpinePlayer } from '@aklive2d/module'
import Border from '@/component/border'
import { useI18n } from '@/state/language'
import Switch from '@/component/switch'
import { atom, useAtom } from 'jotai'
import buildConfig from '!/config.json'

const musicMapping = buildConfig.music_mapping
const getVoiceFoler = (lang) => {
    const folderObject = buildConfig.voice_folders
    const voiceFolder =
        folderObject.sub.find((e) => e.lang === lang) ||
        folderObject.sub.find((e) => e.name === 'custom')
    return `${folderObject.main}/${voiceFolder.name}`
}
const defaultSpineAnimationName = 'Idle'
const backgroundAtom = atom(buildConfig.default_background)

const getPartialName = (type, input) => {
    let part
    switch (type) {
        case 'name':
            part = 5
            break
        case 'skin':
            part = 1
            break
        default:
            return input
    }
    return input.replace(/^(.+)( )(·|\/)( )(.+)$/, `$${part}`)
}

const getTabName = (item, language) => {
    if (item.type === 'operator') {
        return 'operator'
    } else {
        return getPartialName('skin', item.codename[language])
    }
}

export default function Operator() {
    const navigate = useNavigate()
    const { operators } = useConfig()
    const { language } = useLanguage()
    const { key } = useParams()
    const { setTitle, setTabs, setHeaderIcon, setFastNavigation } = useHeader()
    const { setExtraArea } = useAppbar()
    const [config, setConfig] = useState(null)
    // eslint-disable-next-line no-unused-vars
    const _trackEvt = useInsight(`/${key}`)
    const spineRef = useRef(null)
    const [spineAnimationName, setSpineAnimationName] = useState(
        defaultSpineAnimationName
    )
    const { i18n } = useI18n()
    const [spinePlayer, setSpinePlayer] = useState(null)
    const [voiceLang, _setVoiceLang] = useState(null)
    const [currentBackground, setCurrentBackground] = useAtom(backgroundAtom)
    const [voiceConfig, setVoiceConfig] = useState(null)
    const [subtitleLang, setSubtitleLang] = useState(null)
    const [hideSubtitle, setHideSubtitle] = useState(true)
    const [subtitleObj, _setSubtitleObj] = useState(null)
    const [currentVoiceId, setCurrentVoiceId] = useState(null)
    const voiceLangRef = useRef(voiceLang)
    const subtitleObjRef = useRef(subtitleObj)
    const configRef = useRef(config)
    const [voiceSrc, setVoiceSrc] = useState(null)
    const [isVoicePlaying, _setIsVoicePlaying] = useState(false)
    const isVoicePlayingRef = useRef(isVoicePlaying)

    const setVoiceLang = (value) => {
        voiceLangRef.current = value
        _setVoiceLang(value)
    }

    const setSubtitleObj = (value) => {
        subtitleObjRef.current = value
        _setSubtitleObj(value)
    }

    const setIsVoicePlaying = (value) => {
        isVoicePlayingRef.current = value
        _setIsVoicePlaying(value)
    }

    useEffect(() => {
        setExtraArea([])
        setFastNavigation([])
    }, [setExtraArea, setFastNavigation])

    useEffect(() => {
        const config = operators.find((item) => item.link === key)
        if (config) {
            setConfig(config)
            configRef.current = config
            setSpineAnimationName(defaultSpineAnimationName)
            setHeaderIcon(config.type)
            if (spineRef.current?.children.length > 0) {
                spineRef.current?.removeChild(spineRef.current?.children[0])
            }
            fetch(
                `/${key}/${buildConfig.default_assets_dir}charword_table.json`
            )
                .then((res) => res.json())
                .then((data) => {
                    setVoiceConfig(data)
                })
        }
    }, [key, operators, setHeaderIcon])

    const coverToTab = useCallback(
        (item, language) => {
            const key = getTabName(item, language)
            return {
                key: key,
                style: {
                    color: item.color,
                },
                onClick: (e, tab) => {
                    if (tab === key) return
                    navigate(`/${item.link}`)
                },
            }
        },
        [navigate]
    )

    const otherEntries = useMemo(() => {
        if (!config || !language) return null
        return operators
            .filter(
                (item) => item.id === config.id && item.link !== config.link
            )
            .map((item) => {
                return coverToTab(item, language)
            })
    }, [config, language, operators, coverToTab])

    useEffect(() => {
        if (config) {
            setTabs([coverToTab(config, language), ...otherEntries])
        }
    }, [config, key, coverToTab, setTabs, otherEntries, language])

    useEffect(() => {
        if (config) {
            setTitle(getPartialName('name', config.codename[language]))
        }
    }, [config, language, key, setTitle])

    useEffect(() => {
        if (spineRef.current?.children.length === 0 && configRef.current) {
            const playerConfig = {
                atlasUrl: `./${key}/${buildConfig.default_assets_dir}${configRef.current.filename.replace(/#/g, '%23')}.atlas`,
                animation: spineAnimationName,
                premultipliedAlpha: true,
                alpha: true,
                backgroundColor: '#00000000',
                viewport: {
                    debugRender: false,
                    padLeft: `${configRef.current.viewport_left}%`,
                    padRight: `${configRef.current.viewport_right}%`,
                    padTop: `${configRef.current.viewport_top}%`,
                    padBottom: `${configRef.current.viewport_bottom}%`,
                    x: 0,
                    y: 0,
                },
                showControls: false,
                touch: false,
                fps: 60,
                defaultMix: 0.3,
                success: (player) => {
                    if (
                        player.skeleton.data.animations
                            .map((e) => e.name)
                            .includes('Start')
                    ) {
                        player.animationState.setAnimation(0, 'Start', false, 0)
                        player.animationState.addAnimation(0, 'Idle', true, 0)
                    }
                    let lastVoiceId = null
                    let currentVoiceId = null
                    player.canvas.onclick = () => {
                        if (!voiceLangRef.current) return
                        const voiceId = () => {
                            const keys = Object.keys(subtitleObjRef.current)
                            const id =
                                keys[Math.floor(Math.random() * keys.length)]
                            return id === lastVoiceId ? voiceId() : id
                        }
                        const id = voiceId()
                        currentVoiceId = id
                        setCurrentVoiceId(id)
                        setVoiceSrc(
                            `/${configRef.current.link}/${buildConfig.default_assets_dir}${getVoiceFoler(voiceLangRef.current)}/${id}.ogg`
                        )
                        lastVoiceId = currentVoiceId
                    }
                },
            }

            if (configRef.current.use_json) {
                playerConfig.jsonUrl = `./${key}/${buildConfig.default_assets_dir}${configRef.current.filename.replace(/#/g, '%23')}.json`
            } else {
                playerConfig.skelUrl = `./${key}/${buildConfig.default_assets_dir}${configRef.current.filename.replace(/#/g, '%23')}.skel`
            }
            setSpinePlayer(new SpinePlayer(spineRef.current, playerConfig))
        }
    }, [spineAnimationName, setSpinePlayer, spinePlayer, key])

    useEffect(() => {
        return () => {
            if (spinePlayer) {
                spinePlayer.dispose()
            }
        }
    }, [spinePlayer])

    useEffect(() => {
        if (voiceConfig && voiceLang) {
            let subtitleObj = voiceConfig.subtitleLangs[subtitleLang || 'zh-CN']
            let subtitleKey = 'default'
            if (subtitleObj[voiceLang]) {
                subtitleKey = voiceLang
            }
            setSubtitleObj(subtitleObj[subtitleKey])
        }
    }, [subtitleLang, voiceConfig, voiceLang])

    const handleAduioStateChange = useCallback((e, state) => {
        switch (state) {
            case 'play':
                setIsVoicePlaying(true)
                break
            default:
                setIsVoicePlaying(false)
                break
        }
    }, [])

    useEffect(() => {
        if (subtitleLang) {
            if (isVoicePlaying) {
                setHideSubtitle(false)
            } else {
                const autoHide = () => {
                    if (isVoicePlayingRef.current) return
                    setHideSubtitle(true)
                }
                setTimeout(autoHide, 5 * 1000)
                return () => {
                    clearTimeout(autoHide)
                }
            }
        } else {
            setHideSubtitle(true)
        }
    }, [subtitleLang, isVoicePlaying])

    useEffect(() => {
        if (voiceLang && isVoicePlaying) {
            const audioUrl = `/${buildConfig.default_assets_dir}${getVoiceFoler(voiceLang)}/${currentVoiceId}.ogg`
            if (
                voiceSrc !==
                window.location.href.replace(/\/$/g, '') + audioUrl
            ) {
                setVoiceSrc(`/${config.link}${audioUrl}`)
            }
        }
    }, [voiceLang, isVoicePlaying, currentVoiceId, config, voiceSrc])

    const playAnimationVoice = useCallback(
        (animation) => {
            if (voiceLangRef.current) {
                let id = null
                if (animation === 'Idle') id = 'CN_011'
                if (animation === 'Interact') id = 'CN_034'
                if (animation === 'Special') id = 'CN_042'
                if (id) {
                    setCurrentVoiceId(id)
                    setVoiceSrc(
                        `/${key}/${buildConfig.default_assets_dir}${getVoiceFoler(voiceLangRef.current)}/${id}.ogg`
                    )
                }
            }
        },
        [key]
    )

    useEffect(() => {
        if (!voiceLang) {
            setVoiceSrc(null)
        }
    }, [voiceLang])

    const setSpineAnimation = useCallback(
        (animation) => {
            playAnimationVoice(animation)
            const entry = spinePlayer.animationState.setAnimation(
                0,
                animation,
                true
            )
            entry.mixDuration = 0.3
            setSpineAnimationName(animation)
        },
        [playAnimationVoice, spinePlayer]
    )

    const spineSettings = [
        {
            name: 'animation',
            options: [
                {
                    name: 'idle',
                    onClick: () => setSpineAnimation('Idle'),
                    activeRule: () => {
                        return spineAnimationName === 'Idle'
                    },
                },
                {
                    name: 'interact',
                    onClick: () => setSpineAnimation('Interact'),
                    activeRule: () => {
                        return spineAnimationName === 'Interact'
                    },
                },
                {
                    name: 'special',
                    onClick: () => setSpineAnimation('Special'),
                    activeRule: () => {
                        return spineAnimationName === 'Special'
                    },
                },
            ],
        },
        {
            name: 'voice',
            options:
                (voiceConfig &&
                    Object.keys(voiceConfig?.voiceLangs['zh-CN']).map(
                        (item) => {
                            return {
                                name: i18n(item),
                                onClick: () => {
                                    if (voiceLang !== item) {
                                        setVoiceLang(item)
                                    } else {
                                        setVoiceLang(null)
                                    }
                                    if (!isVoicePlayingRef.current) {
                                        playAnimationVoice(spineAnimationName)
                                    }
                                },
                                activeRule: () => {
                                    return voiceLang === item
                                },
                            }
                        }
                    )) ||
                [],
        },
        {
            name: 'subtitle',
            options:
                (voiceConfig &&
                    Object.keys(voiceConfig?.subtitleLangs).map((item) => {
                        return {
                            name: i18n(item),
                            onClick: () => {
                                if (subtitleLang !== item) {
                                    setSubtitleLang(item)
                                } else {
                                    setSubtitleLang(null)
                                }
                            },
                            activeRule: () => {
                                return subtitleLang === item
                            },
                        }
                    })) ||
                [],
        },
        {
            name: 'music',
            el: <MusicElement />,
        },
        {
            name: 'backgrounds',
            options:
                buildConfig.background_files.map((item) => {
                    return {
                        name: item,
                        onClick: () => {
                            setCurrentBackground(item)
                        },
                        activeRule: () => {
                            return currentBackground === item
                        },
                    }
                }) || [],
        },
    ]

    if (!buildConfig.available_operators.includes(key)) {
        throw new Error('Operator not found')
    }

    return (
        <section className={classes.operator}>
            <section className={classes.main}>
                <section
                    className={classes.settings}
                    style={{
                        color: config?.color,
                    }}
                >
                    {spineSettings.map((item) => {
                        if (item.el) {
                            return <section key={item.name}>{item.el}</section>
                        }
                        if (item.options.length === 0) return null
                        return (
                            <section key={item.name}>
                                <section className={classes.title}>
                                    <section className={classes.text}>
                                        {i18n(item.name)}
                                    </section>
                                </section>
                                <section
                                    className={classes['styled-selection']}
                                >
                                    {item.options.map((option) => {
                                        return (
                                            <section
                                                className={`${classes.content} ${option.activeRule && option.activeRule() ? classes.active : ''}`}
                                                onClick={(e) =>
                                                    option.onClick(e)
                                                }
                                                key={option.name}
                                            >
                                                <section
                                                    className={classes.option}
                                                >
                                                    <section
                                                        className={
                                                            classes.outline
                                                        }
                                                    />
                                                    <section
                                                        className={`${classes.text} ${classes['no-overflow']}`}
                                                    >
                                                        {i18n(option.name)}
                                                    </section>
                                                    <section
                                                        className={
                                                            classes['tick-icon']
                                                        }
                                                    />
                                                </section>
                                            </section>
                                        )
                                    })}
                                </section>
                            </section>
                        )
                    })}
                    <section>
                        <section className={classes.title}>
                            <section className={classes.text}>
                                {i18n('external_links')}
                            </section>
                        </section>
                        <section className={classes['styled-selection']}>
                            <Link
                                reloadDocument
                                to={`./index.html?aklive2d`}
                                target="_blank"
                                style={{
                                    color: config?.color,
                                }}
                            >
                                <section className={classes.content}>
                                    <section className={classes.option}>
                                        <section className={classes.outline} />
                                        <section
                                            className={`${classes.text} ${classes['no-overflow']}`}
                                        >
                                            {i18n('web_version')}
                                        </section>
                                        <section
                                            className={classes['arrow-icon']}
                                        >
                                            <section
                                                className={classes.bar}
                                            ></section>
                                            <section
                                                className={classes.bar}
                                            ></section>
                                            <section
                                                className={classes.bar}
                                            ></section>
                                            <section
                                                className={classes.bar}
                                            ></section>
                                        </section>
                                    </section>
                                </section>
                            </Link>
                            {config?.workshopId && (
                                <Link
                                    reloadDocument
                                    to={`https://steamcommunity.com/sharedfiles/filedetails/?id=${config.workshopId}`}
                                    target="_blank"
                                    style={{
                                        color: config?.color,
                                    }}
                                >
                                    <section className={classes.content}>
                                        <section className={classes.option}>
                                            <section
                                                className={classes.outline}
                                            />
                                            <section
                                                className={`${classes.text} ${classes['no-overflow']}`}
                                            >
                                                {i18n('steam_workshop')}
                                            </section>
                                            <section
                                                className={
                                                    classes['arrow-icon']
                                                }
                                            >
                                                <section
                                                    className={classes.bar}
                                                ></section>
                                                <section
                                                    className={classes.bar}
                                                ></section>
                                                <section
                                                    className={classes.bar}
                                                ></section>
                                                <section
                                                    className={classes.bar}
                                                ></section>
                                            </section>
                                        </section>
                                    </section>
                                </Link>
                            )}
                        </section>
                    </section>
                </section>
                <section
                    className={classes.container}
                    style={
                        currentBackground && {
                            backgroundImage: `url(/${buildConfig.directory_folder}/${buildConfig.background_folder}/${currentBackground})`,
                        }
                    }
                >
                    {config && (
                        <img
                            src={`/${buildConfig.directory_folder}/${buildConfig.logo_dir}${config.logo}.png`}
                            alt={config?.codename[language]}
                            className={classes.logo}
                            style={
                                config.invert_filter
                                    ? {
                                          filter: 'invert(1)',
                                      }
                                    : {}
                            }
                        />
                    )}
                    <section ref={spineRef} className={classes.wrapper} />
                    {currentVoiceId && subtitleObj && (
                        <section
                            className={`${classes.voice} ${hideSubtitle ? '' : classes.active}`}
                        >
                            <section className={classes.type}>
                                {subtitleObj[currentVoiceId]?.title}
                            </section>
                            <section className={classes.subtitle}>
                                <span>{subtitleObj[currentVoiceId]?.text}</span>
                                <span className={classes.triangle} />
                            </section>
                        </section>
                    )}
                </section>
            </section>
            <Border />
            <VoiceElement
                src={voiceSrc}
                handleAduioStateChange={handleAduioStateChange}
            />
        </section>
    )
}

function MusicElement() {
    const [enableMusic, setEnableMusic] = useState(false)
    const { i18n } = useI18n()
    const musicIntroRef = useRef(null)
    const musicLoopRef = useRef(null)
    const [background] = useAtom(backgroundAtom)

    useEffect(() => {
        if (musicIntroRef.current && musicIntroRef.current) {
            musicIntroRef.current.volume = 0.5
            musicLoopRef.current.volume = 0.5
        }
    }, [musicIntroRef, musicLoopRef])

    useEffect(() => {
        if (!enableMusic || background) {
            musicIntroRef.current.pause()
            musicLoopRef.current.pause()
        }
    }, [enableMusic, background])

    useEffect(() => {
        if (background && enableMusic) {
            const introOgg = musicMapping[background].intro
            const intro = `/${buildConfig.directory_folder}/${buildConfig.music_folder}/${introOgg}`
            const loop = `/${buildConfig.directory_folder}/${buildConfig.music_folder}/${musicMapping[background].loop}`
            musicLoopRef.current.src = loop
            if (introOgg) {
                musicIntroRef.current.src = intro || loop
            } else {
                musicLoopRef.current.play()
            }
        }
    }, [background, enableMusic])

    const handleIntroTimeUpdate = useCallback(() => {
        if (
            musicIntroRef.current.currentTime >=
            musicIntroRef.current.duration - 0.3
        ) {
            musicIntroRef.current.pause()
            musicLoopRef.current.play()
        }
    }, [])

    const handleLoopTimeUpdate = useCallback(() => {
        if (
            musicLoopRef.current.currentTime >=
            musicLoopRef.current.duration - 0.3
        ) {
            musicLoopRef.current.currentTime = 0
            musicLoopRef.current.play()
        }
    }, [])

    return (
        <section>
            <section
                className={classes.title}
                onClick={() => setEnableMusic(!enableMusic)}
            >
                <section className={classes.text}>{i18n('music')}</section>
                <section className={classes.switch}>
                    <Switch on={enableMusic} />
                </section>
            </section>
            <audio
                ref={musicIntroRef}
                preload="auto"
                autoPlay
                onTimeUpdate={() => handleIntroTimeUpdate()}
            >
                <source type="audio/ogg" />
            </audio>
            <audio
                ref={musicLoopRef}
                preload="auto"
                onTimeUpdate={() => handleLoopTimeUpdate()}
            >
                <source type="audio/ogg" />
            </audio>
        </section>
    )
}
