export interface ConfigType {
    port: string
}

const config: ConfigType = {
    port: process.env.PORT || '8080',
}

export default config
