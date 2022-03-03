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
}

/*
    TODO: This, and arrToNumericalObj, are necessary to help get around Firestore's current inability to support arrays of arrays. Instead, we serialize nested arrays into objects where array index maps to a property in the object, and the value at that index becomes the corresponding value in the object.
*/
const numericalObjToArray = (numericalObj: {}): any[] => {
    return Object.values(numericalObj);
}

const arrayToNumericalObj = (array: any[]): {} => {
    return Object.assign({}, array);
}

export {
    renderErrors,
    numericalObjToArray,
    arrayToNumericalObj,
}