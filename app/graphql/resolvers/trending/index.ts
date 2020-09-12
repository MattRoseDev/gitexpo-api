import Trending, { ArgsType } from 'app/controllers/trending'

const resolvers = {
    Query: {
        trending: async (_: any, args: ArgsType) => {
            return await Trending.trending(args)
        },
    },
}

export default resolvers
