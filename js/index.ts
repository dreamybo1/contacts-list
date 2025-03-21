//regulars
import { ContactsKeys, FormElemsKeys, IContacts, IFormElems, IRegulars, IUser } from "../types/types";

const regulars: IRegulars = {
    name: /^[A-Z][a-z]+(?:[- ][A-Z][a-z]+)*$/,
    vacancy: /^[A-Za-z0-9\s\-&,()]+$/,
    phone: /^\+?\d{1,3}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
}

//main
const storeContacts = localStorage.getItem('contacts')
const contacts: IContacts = JSON.parse(storeContacts || "") || {}
let filteredContactsArr: IUser[] = []
let choosenData: ContactsKeys | "";
let searchStr: string = "";
let timeoutEmpty: number | null;
const letters: ContactsKeys[] = [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z" ]

//first render
letters.forEach(letter => {
    const list = document.querySelector('.list')
    
    if(!Object.hasOwn(contacts, letter)) contacts[letter] = []

    if(list) {
        let div = document.createElement('div');
        let firstLetter = document.createElement('span');
        let count = document.createElement('span')
        
        count.innerText = contacts[letter].length ? String(contacts[letter].length) : ""
        
    
        div.classList.add('letter');
        div.classList.add(`letter_${letter}`);
        count.classList.add(`count_${letter}`);
        count.classList.add(`count`);
        firstLetter.classList.add('first-letter')
    
        firstLetter.innerText = letter;
    
        div.append(firstLetter, count)
        list.appendChild(div);
    }

})

//update counts
function updateCounts() {
    Object.entries(contacts).forEach(([key, cantactsArr]) => {
        const countEl = document.querySelector(`.count_${key}`) as HTMLSpanElement
        if (countEl) {
            countEl.innerText = cantactsArr.length ? String(cantactsArr.length) : ""
        }
    })
}

const form = document.querySelector('.form') as HTMLFormElement

const addButton = document.querySelector('.add-button') as HTMLButtonElement
const clearButton = document.querySelector('.clear-button') as HTMLButtonElement
const searchButton = document.querySelector('.search-button') as HTMLButtonElement


addButton.onclick = () => {
    handleAdd()
    renderItems()
}

clearButton.onclick = () => {
    handleClear()
    renderItems()
}

searchButton.onclick = () => {
    openSearchModal()
}

function validateInputs(form: HTMLFormElement): boolean {
    const { name: nameEl, vacancy: vacancyEl, phone: phoneEl } = <IFormElems>form.elements
    const valuesArr = [nameEl, vacancyEl, phoneEl]
    let error: boolean = false;

    valuesArr.forEach(elem => {
        let elemName = <FormElemsKeys>elem.name
        if (!elem.value.trim()) {
            elem.setCustomValidity("Error: empty field")
            elem.reportValidity()
            error = true
            return
        }
        
        if ( !elem.value.match( regulars[elemName] ) ) {
            elem.setCustomValidity(`Error: wrong ${elem.name}`)
            elem.reportValidity()
            elem.value = ""
            error = true
            return
        }

    })

    return error
}

const handleAdd = () => {
    const { name: nameEl, vacancy: vacancyEl, phone: phoneEl } = <IFormElems>form.elements

    const name = nameEl.value.trim()
    const vacancy = vacancyEl.value
    const phone = phoneEl.value

    if ( validateInputs(form) ) {
        return
    }

    const id = Date.now()

    const firstLetter: ContactsKeys = <ContactsKeys>name[0]?.toUpperCase()

    if(firstLetter) {
        contacts[firstLetter] = [...contacts[firstLetter], {id, name, vacancy, phone}]
    }
}

const handleClear = () => {
    let infoEl = document.querySelector(".list-item__info")

    for (let contact in contacts) {
        contacts[<ContactsKeys>contact] = []
    }
    form.reset()

    if(infoEl) {
        infoEl.classList.remove('list-item__info_opened')
    }

    removeItems()
}

//list item onclick
const content = document.querySelector(".content") as HTMLDivElement

content.onclick = (event) => {
    const target = event.target as HTMLElement
    const letterEl = target.closest(".letter") as HTMLDivElement


    //проверяем, что было нажатие на кнопку (делегируем)
    if (!letterEl) return
    let eventDataEl = letterEl?.querySelector(".first-letter") as HTMLSpanElement
    let eventData = <ContactsKeys>eventDataEl?.innerHTML
    

    let infoEl = document.querySelector(".list-item__info") as HTMLDivElement

    //проверяем, что в данном списке есть люди
    if(contacts[eventData].length < 1) {
        return
    }
    
    /* 
    проверяем, что если меню уже открыто 
    и мы нажали на другого контакта, то мы не 
    закрываем окошко, а перерисовываем существующее
    */
    if (choosenData && choosenData !== eventData) {
        choosenData = eventData
        infoEl.scrollTo({behavior: 'smooth', 'top': 0})
        renderItems()
        return
    }


    choosenData = eventData
    renderItems()

    // проверяем открыто лм окошко и если нет - открываем
    if (!infoEl.classList.contains('list-item__info_opened')) {
        infoEl.classList.add('list-item__info_opened')
        return
    }

    infoEl.classList.remove('list-item__info_opened')
    choosenData = ""

    removeItems()
}



function renderItems () {
    updateCounts()

    let infoEl = document.querySelector(".list-item__info") as HTMLDivElement
    let searchEl = document.querySelector(".search-result") as HTMLDivElement

    infoEl.innerHTML = ""

    if(choosenData && contacts[choosenData]?.length < 1) {
        infoEl.classList.remove('list-item__info_opened')
        choosenData = ""
        updateCounts()
    }

    if(searchEl) {
        searchEl.innerHTML = "" 
        filteredContactsArr.forEach((user) => {
            const firstLetter = <ContactsKeys>user.name[0]?.toUpperCase()
            createUserItem(user, firstLetter, searchEl)
        })
    }

    choosenData && contacts[choosenData]?.forEach((user) => {
        choosenData && createUserItem(user, choosenData, infoEl)
    })

    localStorage.setItem('contacts', JSON.stringify(contacts))

}

function removeItems () {
    const datas: NodeListOf<HTMLDivElement> = document.querySelectorAll(".user-item")
    setTimeout(() => {
        datas.forEach(data => {
            data.remove()
        })
    }, 500)
}


function openEditModal (user: IUser) {
    const {id, name, vacancy, phone} = user
    const firstLetterConst = <ContactsKeys>name[0]?.toUpperCase()

    const modalDiv = document.createElement('div')
    const editForm = document.createElement('form')


    const fieldsDiv = document.createElement('div')
    fieldsDiv.classList.add('edit-fields')

    const idElement = document.createElement('p')
    idElement.textContent = `ID: ${id}`
    idElement.classList.add('edit-id')

    const nameInput = document.createElement('input')
    const vacancyInput = document.createElement('input')
    const phoneInput = document.createElement('input')

    fieldsDiv.append(idElement, nameInput, vacancyInput, phoneInput)

    nameInput.name = 'name'
    vacancyInput.name = 'vacancy'
    phoneInput.name = 'phone'
    
    nameInput.placeholder = 'Name'
    vacancyInput.placeholder = 'Vacancy'
    phoneInput.placeholder = 'Phone'


    nameInput.value = name
    vacancyInput.value = vacancy
    phoneInput.value = phone

    const buttonsDiv = document.createElement('div')
    buttonsDiv.classList.add('edit-buttons')

    const applyButton = document.createElement('button')
    const cancelButton = document.createElement('button')

    applyButton.type = 'button'
    cancelButton.type = 'button'

    applyButton.textContent = "Apply"
    cancelButton.textContent = "Cancel"

    applyButton.onclick = () => {
        if ( validateInputs(editForm) ) {
            return
        }

        const {name: {value: name}, vacancy: {value: vacancy}, phone: {value: phone}} = <IFormElems>editForm.elements
        const firstLetter = <ContactsKeys>name[0]?.toUpperCase()

        const contactIndex = contacts[firstLetter].findIndex((el) => el.id === id)
        const contactFilteredIndex = filteredContactsArr.findIndex((el) => el.id === id)


        if (firstLetter === firstLetterConst && contacts[firstLetterConst][contactIndex] && filteredContactsArr[contactFilteredIndex]) {
            contacts[firstLetterConst][contactIndex] = {...contacts[firstLetterConst][contactIndex], name, vacancy, phone}
            filteredContactsArr[contactFilteredIndex] = {...filteredContactsArr[contactFilteredIndex], name, vacancy, phone}
        } else {
            contacts[firstLetterConst] = contacts[firstLetterConst].filter(el => id !== el.id)
            contacts[firstLetter].push({id, name, vacancy, phone})

            if(searchStr) {
                filteredContactsArr = Object.values(contacts).reduce((acc, curr) => {
                    return [...acc, ...curr]
                }, []).filter((el) => {
                    return el.name.toLowerCase().includes(searchStr.toLowerCase())
                })
            } else {
                filteredContactsArr = Object.values(contacts).reduce((acc, curr) => {
                    return [...acc, ...curr]
                }, [])
            }

        }

        modalDiv.remove()
        renderItems()

        setTimeout(()=> {
            const items: NodeListOf<HTMLDivElement> = document.querySelectorAll(`[data-id="${id}"]`)
            if(items.length > 0) {
                items.forEach(item => {
                    item.style.cssText = `
                        background-color: yellow
                    `
                    setTimeout(() => {
                        item.style.cssText = `
                            background-color: rgb(231, 230, 237);
                        `
                    }, 200)
                })
            }
        })
    }

    cancelButton.onclick = () => {
        modalDiv.remove()
    }


    buttonsDiv.append(applyButton, cancelButton)
    editForm.append(fieldsDiv, buttonsDiv)
    
    modalDiv.classList.add('modal')
    editForm.classList.add('edit-form')
    
    modalDiv.onclick = () => {
        modalDiv.remove()
    }

    editForm.onclick = (e) => {
        e.stopPropagation()
    }

    modalDiv.append(editForm)


    document.body.append(modalDiv)
}



function openSearchModal () {
    const hasContacts = Object.values(contacts).some(el => el.length > 0)

    if(!hasContacts) {
        const emptyContactsDiv = document.createElement('div')
        emptyContactsDiv.classList.add('empty-contacts__popup')
        emptyContactsDiv.textContent = "Error: empty contacts list!"
        if(!timeoutEmpty) {
            document.body.append(emptyContactsDiv)
            timeoutEmpty = setTimeout(()=> {
                emptyContactsDiv.classList.toggle('open')
    
                setTimeout(()=>{
                    emptyContactsDiv.classList.toggle('open')

                    setTimeout(()=> {
                        emptyContactsDiv.remove()
                        timeoutEmpty = null
                    }, 1000)
                }, 2000)
            }, 0)
        }

        return
    }

    const modalDiv = document.createElement('div')
    const searchEl = document.createElement('div')

    const searchInput = document.createElement('input')
    searchInput.placeholder = 'Search'
    searchInput.name = 'search'



    const searchResultsDiv = document.createElement('div')
    searchResultsDiv.classList.add('search-result')

    filteredContactsArr = Object.values(contacts).reduce((acc, curr) => {
        return [...acc, ...curr]
    }, [])
    filteredContactsArr.forEach(user => {
        const firstLetter = <ContactsKeys>user.name[0]?.toUpperCase()
        createUserItem(user, firstLetter, searchResultsDiv)
    })

    renderItems()


    searchInput.oninput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        searchStr = target?.value || "";
        if (!searchStr.trim()) {            
            filteredContactsArr = Object.values(contacts).reduce((acc, curr) => {
                return [...acc, ...curr]
            }, [])
            renderItems()     
            return
        }

        const allContactsArr = Object.values(contacts).reduce((acc, curr) => {
            return [...acc, ...curr]
        }, [])
        filteredContactsArr = allContactsArr.filter(({name}) => {
            return name.toLowerCase().includes(searchStr.toLowerCase())      
        })
    
        renderItems()     
    }
        
    modalDiv.classList.add('modal')
    searchEl.classList.add('search')
    
    modalDiv.onclick = () => {
        modalDiv.remove()
    }

    searchEl.onclick = (e) => {
        e.stopPropagation()
    }

    searchEl.append(searchInput, searchResultsDiv)
    modalDiv.append(searchEl)


    document.body.append(modalDiv)
}

function createUserItem (user: IUser, firstLetter: ContactsKeys, placeToInsert: HTMLElement) {
    const {id, name, vacancy, phone} = user

    const itemDiv = document.createElement('div')
    const idStr = document.createElement('p')
    const nameStr = document.createElement('p')
    const vacancyStr = document.createElement('p')
    const phoneStr = document.createElement('p')


    const buttonsDiv = document.createElement('div')
    buttonsDiv.classList.add('buttons-div')

    const editBtn = document.createElement('button')
    const deleteBtn = document.createElement('button')

    const editImg = document.createElement('img')
    const deleteImg = document.createElement('img')

    editImg.src = "images/edit.svg"
    deleteImg.src = "images/delete.svg"

    editBtn.classList.add('edit-btn')
    deleteBtn.classList.add('delete-btn')

    editBtn.append(editImg)
    deleteBtn.append(deleteImg)
    buttonsDiv.append(editBtn, deleteBtn)
    itemDiv.append(buttonsDiv)

    itemDiv.dataset['id'] = String(id)

    editBtn.onclick = () => {
        openEditModal({id, name, vacancy, phone})
    } 

    deleteBtn.onclick = () => {
        contacts[firstLetter] = contacts[firstLetter].filter((item) => item.id !== id)
        filteredContactsArr = filteredContactsArr.filter((user) => user.id !== id)
        renderItems()
    }


    idStr.innerText = `ID: ${id}`
    nameStr.innerText = `Name: ${name}`
    vacancyStr.innerText = `Vacancy: ${vacancy}`
    phoneStr.innerText = `Phone: ${phone}`
    
    itemDiv.append(idStr, nameStr, vacancyStr, phoneStr)
    placeToInsert.append(itemDiv)
    itemDiv.classList.add('user-item')
}