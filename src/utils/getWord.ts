import words from '../data/words';


const getRandomAnswer = () => {
    // @ts-ignore
    const randomIndex = Math.floor(Math.random() * words.length)
    // @ts-ignore
    return words[randomIndex].toUpperCase()
    }

export {

    getRandomAnswer
}
