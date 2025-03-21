interface IRegulars {
    name: RegExp;
    vacancy: RegExp;
    phone: RegExp
}

interface IUser {
    id: number;
    name: string;
    vacancy: string;
    phone: string;
}

interface IFormElems extends HTMLFormControlsCollection {
    name: HTMLInputElement;
    vacancy: HTMLInputElement;
    phone: HTMLInputElement
}

type FormElemsKeys = 'name' | 'vacancy' | 'phone';

type ContactsKeys = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

type IContacts = {
    [key in ContactsKeys]: IUser[]
}

export {
    IRegulars,
    IUser,
    FormElemsKeys,
    IFormElems,
    ContactsKeys,
    IContacts
}