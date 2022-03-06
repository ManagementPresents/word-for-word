import Turn from "../interfaces/Turn";
import Match from "../interfaces/Match";

const {
    REACT_APP_URL,
} = process.env;

const renderErrors = (errors: any, className: string) => {
    let validationMessages = [];

    if (errors.length) {
        validationMessages = errors.map((error: any) => {
            /* 
                TODO: This 'message' property is only necessary because of the 'password-valditor' library.
                This can be refactored now that we're also using validator.js
            */
            // @ts-ignore
            return <div className={className}>{error.message}</div>
        });
    } /* else {
        // TODO: Revisit how the "no errors" case, here, is handled
        validationMessages.push(<div className={'text-[#15B097] text-sm'}>Looking good!</div>);
    }*/

    return validationMessages;
};

/*
    TODO: This, and arrayToNumericalObj, are necessary to help get around Firestore's current inability to support arrays of arrays. Instead, we serialize nested arrays into objects where array index maps to a property in the object, and the value at that index becomes the corresponding value in the object.
*/

/**
 * 
 * @param {[key: string]: any} numericalObj an object where the properties are sequential numbers (representing array indices)
 * @returns 
 */
const numericalObjToArray = (numericalObj: {[key: string]: any}): any[] => {
    return Object.values(numericalObj);
};

/**
 * 
 * @param { any[] } array
 * @returns an object whose keys are numbers, same as the indice in the passed in array
 */
const arrayToNumericalObj = (array: any[]): {[key: string]: any} => {
    return Object.assign({}, array);
};

/*
    TODO: This stupid pattern of having to loop through turns just to update the current turn is
    an attempt to work with firestore's limitations when it comes to editing nested data.

    For future me: For a given currentTurn, there can be anywhere between 0 and 6 turns. In order to update just the currentTurn,
    but also ensure we don't accidentally alter any previous turns, we map through the whole turns array. If the turn is not the currentTurn, we send it back as is, no changes. If it's the currentTurn, we get to editing.

    All this is to say: This function returns an array of /all/ the turns in this match, but /only/ the currentTurn should actually be changed
*/

/**
 * 
 * @param turns 
 * @param {(turn: Turn) => Turn} callback an update to perform on the current turn 
 * @returns {Turn[]} all the passed in turns, with the current turn updated
 */
const updateCurrentTurn = (turns: Turn[], callback: (turn: Turn) => Turn): Turn[] => {
    return turns.map((turn: Turn): Turn => {
        if (!turn.currentTurn) return turn;

        return callback(turn);
    }) as Turn[];
};

/**
 * 
 * @param {Turn[]} turns
 * @returns {Turn} the current turn;
 */
const getCurrentTurn = (turns: Turn[] = []): Turn => { 
    return turns.find((turn: Turn): boolean => turn.currentTurn) as Turn;
};

/**
 * 
 * @param turns
 * @param {Turn}
 * @returns {Turn[]} All of the passed in turns, with the new turn concatenated to the end
 */
const addTurn = (turns: Turn[], turn: Turn): Turn[] => {
    return turns.concat(turn) as Turn[];
};

/**
 * 
 * @param {Match} match 
 * @returns {string} returns a url built from the match id and the current REACT_APP_URL
 */
const createMatchUrl = (match: Match): string => {
    return `${REACT_APP_URL}/match/${match.id}`;
};

// TODO: What is the type for a firebase auth user object?
/**
 * 
 * @param {any} user
 * @param {Match} match
 * @returns 
 */
const getMatchOpponentId = (user: any, match: Match): string => {
    const { uid } = user;
    const { players } = match;

    return uid === players?.guestId ? players?.hostId : players?.guestId;
};

/**
 * 
 * @param {Match} match
 * @param {id} id 'The id whose turn you want to determine'
 * @returns 
 */
const isPlayerTurn = (match: Match = {} as Match, id: string): boolean => {
    const currentTurn: Turn = getCurrentTurn(match.turns) as Turn;
    
    return currentTurn?.activePlayer === id;
}


export {
    renderErrors,
    numericalObjToArray,
    arrayToNumericalObj,
    updateCurrentTurn,
    getCurrentTurn,
    addTurn,
    createMatchUrl,
    getMatchOpponentId,
    isPlayerTurn,
}