import cheerio from 'cheerio'
import fetch, { Response } from 'node-fetch'
import { omitBy, isNil, sortBy } from 'lodash'

export interface ArgsType {
    languages: string[]
    spokenLanguage: string
    since: string
}

export interface ArgType {
    language: string
    spokenLanguage: string
    since: string
}

class Trending {
    GITHUB_URL: string
    constructor() {
        this.GITHUB_URL = 'https://github.com'
    }
    // Remove Nil object
    omitNil(object: any) {
        return omitBy(object, isNil)
    }

    // extract address avatar
    removeDefaultAvatarSize(src: any) {
        if (!src) {
            return src
        }
        return src.replace(/\?s=.*$/, '')
    }

    async trending(args: ArgsType) {
        const languages: string[] =
            args.languages && args.languages.length > 0 ? args.languages : []
        const spokenLanguage: string = args.spokenLanguage
            ? args.spokenLanguage
            : ''

        let response: any[] = []

        if (languages.length > 1) {
            // several languages
            for (let i = 0; i < languages.length; i++) {
                // fetch repositories
                let repositories = await this.getRepositories({
                    language: languages[i],
                    spokenLanguage,
                    since: args.since,
                })

                response.push(...repositories)

                if (i == languages.length - 1) {
                    // sort repositories by stars
                    response = sortBy(response, ['stars']).reverse()
                    return response
                }
            }
        } else {
            // only one language
            response = await this.getRepositories({
                language: languages.length > 0 ? languages[0] : '',
                spokenLanguage,
                since: args.since,
            })

            return response
        }

        return []
    }

    async getRepositories(arg: ArgType) {
        const language: string = arg.language ? arg.language : ''
        const spokenLanguage: string = arg.spokenLanguage
            ? arg.spokenLanguage
            : ''
        // github trending address
        const url: string = `${this.GITHUB_URL}/trending/${language}?since=${arg.since}&spoken_language_code=${spokenLanguage}`
        // fetch html page
        const data: Response = await fetch(url)
        // load data to cheero for extract data
        const $ = cheerio.load(await data.text())

        return $('.Box article.Box-row')
            .get()
            .map(repo => {
                const $repo: Cheerio = $(repo)
                // extract title
                const title: string = $repo.find('.h3').text().trim()
                // extract username & reponame
                const [username, repoName]: string[] = title
                    .split('/')
                    .map(v => v.trim())
                // extract url repo
                const relativeUrl: string | undefined = $repo
                    .find('.h3')
                    .find('a')
                    .attr('href')
                // extract current period stars
                const currentPeriodStarsString: string =
                    $repo.find('.float-sm-right').text().trim() || ''
                // extract contributors
                const contributors: string[] = $repo
                    .find('span:contains("Built by")')
                    .find('[data-hovercard-type="user"]')
                    .map((_, user) => {
                        const altString = $(user).children('img').attr('alt')
                        const avatarUrl = $(user).children('img').attr('src')
                        return {
                            username: altString ? altString.slice(1) : null,
                            href: `${this.GITHUB_URL}${user.attribs.href}`,
                            avatar: this.removeDefaultAvatarSize(avatarUrl),
                        }
                    })
                    .get()
                // extract language color
                const colorNode: Cheerio = $repo.find('.repo-language-color')
                const langColor: string | null = colorNode.length
                    ? colorNode.css('background-color')
                    : null
                // extract language
                const langNode: Cheerio = $repo.find(
                    '[itemprop=programmingLanguage]',
                )

                const lang: string | null = langNode.length
                    ? langNode.text().trim()
                    : null

                // return extracted information of repositories
                return this.omitNil({
                    author: username,
                    name: repoName,
                    avatar: `${this.GITHUB_URL}/${username}.png`,
                    url: `${this.GITHUB_URL}${relativeUrl}`,
                    description: $repo.find('p.my-1').text().trim() || '',
                    language: lang,
                    languageColor: langColor,
                    stars: parseInt(
                        $repo
                            .find(".mr-3 svg[aria-label='star']")
                            .first()
                            .parent()
                            .text()
                            .trim()
                            .replace(',', '') || '0',
                        10,
                    ),
                    forks: parseInt(
                        $repo
                            .find("svg[aria-label='fork']")
                            .first()
                            .parent()
                            .text()
                            .trim()
                            .replace(',', '') || '0',
                        10,
                    ),
                    currentPeriodStars: parseInt(
                        currentPeriodStarsString
                            .split(' ')[0]
                            .replace(',', '') || '0',
                        10,
                    ),
                    contributors,
                })
            })
    }
}

export default new Trending()
