import { gql } from 'apollo-server'

const types = gql`
    scalar Date

    type Query {
        trending(
            languages: [String]
            spokenLanguages: [String]
            since: String
        ): TRENDING_RESULT
    }

    type TRENDING_RESULT {
        name: String
    }
`

export default types
