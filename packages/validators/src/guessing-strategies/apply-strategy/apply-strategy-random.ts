export default function applyStrategyRandom(extension: string) {
    const length = extension.length
    return Array.from({ length }).map(randomSingleInteger).join('')
}

const randomSingleInteger = () => Math.floor(Math.random() * 10)
