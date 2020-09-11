import { mergeTypes } from 'merge-graphql-schemas'
import trending from './trending'

const types = [trending]

export default mergeTypes(types, { all: true })
