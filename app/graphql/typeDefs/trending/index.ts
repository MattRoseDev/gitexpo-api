import { gql } from 'apollo-server'

const types = gql`
    scalar Date

    type Query {
        trending(
            languages: [String]
            spokenLanguages: [String]
            since: String
        ): [REPOSITORIES]
    }

    type REPOSITORIES {
        author: String
        name: String
        avatar: String
        url: String
        description: String
        language: String
        languageColor: String
        stars: Int
        forks: Int
        currentPeriodStars: Int
        contributors: [CONTRIBUTORS]
    }

    type CONTRIBUTORS {
        herf: String
        avatar: String
        username: String
    }
`

export default types
