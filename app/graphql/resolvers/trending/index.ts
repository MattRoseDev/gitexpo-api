const resolvers = {
    Query: {
        trending: () => {
            return {
                name: 'repo name',
            }
        },
    },
}

export default resolvers
