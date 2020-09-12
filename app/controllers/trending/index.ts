import cheerio from 'cheerio'
import fetch, { Response } from 'node-fetch'
import { omitBy, isNil } from 'lodash'

export interface ArgsType {
    languages: string[]
    spokenLanguages: string[]
    since: string
}

class Trending {
    GITHUB_URL: string
    constructor() {
        this.GITHUB_URL = 'https://github.com'
    }

    omitNil(object: any) {
        return omitBy(object, isNil)
    }

    removeDefaultAvatarSize(src: any) {
        if (!src) {
            return src
        }
        return src.replace(/\?s=.*$/, '')
    }

    async trending(args: ArgsType) {
        const language: string =
            args.languages && args.languages.length > 0 ? args.languages[0] : ''
        const spokenLanguage: string =
            args.spokenLanguages && args.spokenLanguages.length > 0
                ? args.spokenLanguages[0]
                : ''
        const url: string = `${this.GITHUB_URL}/trending/${language}?since=${args.since}&spoken_language_code=${spokenLanguage}`
        const data: Response = await fetch(url)
        const $ = cheerio.load(await data.text())

        return $('.Box article.Box-row')
            .get()
            .map(repo => {
                const $repo: Cheerio = $(repo)
                const title: string = $repo.find('.h3').text().trim()
                const [username, repoName]: string[] = title
                    .split('/')
                    .map(v => v.trim())
                const relativeUrl: string | undefined = $repo
                    .find('.h3')
                    .find('a')
                    .attr('href')
                const currentPeriodStarsString: string =
                    $repo.find('.float-sm-right').text().trim() || ''

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

                const colorNode: Cheerio = $repo.find('.repo-language-color')
                const langColor: string | null = colorNode.length
                    ? colorNode.css('background-color')
                    : null

                const langNode: Cheerio = $repo.find(
                    '[itemprop=programmingLanguage]',
                )

                const lang: string | null = langNode.length
                    ? langNode.text().trim()
                    : null

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
