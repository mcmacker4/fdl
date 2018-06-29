import { createReadStream } from 'fs'
import { createInterface } from 'readline'

export enum TokenType {
    KEYWORD,
    IDENTIFIER
}

export interface Token {
    type: TokenType
    value: string
}

export const KEYWORDS = [
    "component",
    "connections",
    "in",
    "out",
    "end"
]

function isKeyword(word: string) {
    return KEYWORDS.indexOf(word) >= 0
}

export class Tokenizer {

    private tokenizeLine(line: string, tokens: Token[]) : Token[] {
        let trimmed = line.trim()
        if(trimmed.length === 0 || trimmed.startsWith('#'))
            return []

        let words = trimmed.split(/\s+/)
        words.map(word => ({
            type: isKeyword(word) ? TokenType.KEYWORD : TokenType.IDENTIFIER,
            value: word
        })).forEach(token => tokens.push(token))
    }

    tokenize(file: string) : Promise<Token[]> {
        return new Promise((resolve, reject) => {
            const stream = createReadStream(file)
            const readline = createInterface(stream)

            let tokens: Token[] = []

            readline.on('line', (line) => {
                this.tokenizeLine(line, tokens)
            })

            readline.on('close', () => {
                resolve(tokens)
            })
        })
    }

}