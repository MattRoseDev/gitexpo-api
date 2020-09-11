import { mergeResolvers } from 'merge-graphql-schemas'
import trending from './trending'

const resolvers = [trending]

export default mergeResolvers(resolvers)
