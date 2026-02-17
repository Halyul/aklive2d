export type TitleLanguages = {
    'zh-CN': string
    'en-US': string
}

export type Config = {
    site_id: string
    total_size: number
    akassets: {
        project_name: string
        url: string
    }
    insight: {
        id: string
        url: string
    }
    module: {
        assets: {
            config_yaml: string
            background: string
            music: string
            charword_table: string
            project_json: string
        }
        background: {
            operator_bg_png: string
        }
        charword_table: {
            charword_table_json: string
        }
        music: {
            music_table_json: string
            display_meta_table_json: string
            audio_data_json: string
        }
        official_info: {
            official_info_json: string
        }
        operator: {
            operator: string
            config: string
            template_yaml: string
            config_yaml: string
            logos_assets: string
            logos: string
            directory_assets: string
            character_table_json: string
            skin_table_json: string
            title: TitleLanguages
            sp_filename_prefix: string
            sp_title: TitleLanguages
        }
        project_json: {
            project_json: string
            preview_jpg: string
            template_yaml: string
        }
        wrangler: {
            index_json: string
        }
        vite_helpers: {
            config_json: string
        }
    }
    app: {
        showcase: {
            public: string
            assets: string
            release: string
        }
        directory: {
            assets: string
            title: string
            voice: string
            portraits: string
            error: {
                files: {
                    key: string
                    paddings: {
                        left: string
                        right: string
                        top: string
                        bottom: string
                    }
                }[]
                voice: {
                    file: string
                    target: string
                }
            }
        }
    }
    dir_name: {
        data: string
        dist: string
        extracted: string
        auto_update: string
        voice: {
            main: string
            sub: {
                name: string
                lang: string
                lookup_region: string
            }[]
        }
    }
}
