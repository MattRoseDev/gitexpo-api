import express from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import cors from 'cors'
import server from './graphql'
import config from './config'

const app = express()

module.exports = class Application {
    constructor() {
        this.expressConfig()
        this.serverConfig()
    }
    // SERVER
    serverConfig() {
        server.applyMiddleware({ app, path: '/graphql' })
        const httpServer = createServer(app)
        httpServer.listen({ port: config.port }, () => {
            console.log(
                `🚀 Server ready at http://localhost:${config.port}${server.graphqlPath}`,
            )
        })
    }
    // EXPRESS
    expressConfig() {
        app.use(cors())
        app.use(
            bodyParser.urlencoded({
                extended: false,
            }),
        )
        app.use(bodyParser.json())
        app.use('/public', express.static('public'))
    }
}
