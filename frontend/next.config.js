const AntdMomentWebpackPlugin = require('@ant-design/moment-webpack-plugin')

const nextConfig = {
    reactStrictMode: false,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.plugins.push(new AntdMomentWebpackPlugin())
        }
        return config
    },
}

module.exports = nextConfig
