import { ApolloServer } from 'apollo-server-express'
import typeDefs from './typeDefs'
import resolvers from './resolvers'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res, connection }) => {
        return {
            req,
            res,
            connection,
        }
    },
})

export default server
