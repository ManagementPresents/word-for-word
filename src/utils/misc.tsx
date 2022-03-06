import Turn from "../interfaces/Turn";
import Match from "../interfaces/Match";
import Player from "../interfaces/Player";
import Players from "../interfaces/Players";

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
const numericalObjToArray = (numericalObj: {}): any[] => {
    return Object.values(numericalObj);
};

const arrayToNumericalObj = (array: any[]): {} => {
    return Object.assign({}, array);
};

/*
    TODO: This stupid pattern of having to loop through turns just to update the current turn is
    an attempt to work with firestore's limitations when it comes to editing nested data.

    For future me: For a given currentTurn, there can be anywhere between 0 and 6 turns. In order to update just the currentTurn,
    but also ensure we don't accidentally alter any previous turns, we map through the whole turns array. If the turn is not the currentTurn, we send it back as is, no changes. If it's the currentTurn, we get to editing.

    All this is to say: This function returns an array of /all/ the turns in this match, but /only/ the currentTurn should actually be changed
*/
const updateCurrentTurn = (turns: Turn[], callback: (turn: Turn) => Turn): Turn[] => {
    return turns.map((turn: Turn): Turn => {
        if (!turn.currentTurn) return turn;

        return callback(turn);
    }) as Turn[];
};

const getCurrentTurn = (turns: Turn[]): Turn => { 
    return turns.find((turn: Turn): boolean => turn.currentTurn) as Turn;
};

const addTurn = (turns: Turn[], turn: Turn): Turn[] => {
    return turns.concat(turn) as Turn[];
};

const createMatchUrl = (match: Match): string => {
    return `${REACT_APP_URL}/match/${match.id}`;
};

// TOOD: What is the type for a firebase auth user objectZ?
const getMatchOpponent = (user: any, match: Match, matchOpponents: Players): Player => {
    const { uid } = user;
    const { players } = match;

    return uid === players.guestId ? matchOpponents[players.hostId] : matchOpponents[players.guestId];
};
export {
    renderErrors,
    numericalObjToArray,
    arrayToNumericalObj,
    updateCurrentTurn,
    getCurrentTurn,
    addTurn,
    createMatchUrl,
    getMatchOpponent,
}