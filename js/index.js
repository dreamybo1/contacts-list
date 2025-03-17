//constants

const regulars = {
    name: /^[A-Z][a-z]+(?:[- ][A-Z][a-z]+)*$/,
    vacancy: /^[A-Za-z0-9\s\-&,()]+$/,
    phone: /^\+?\d{1,3}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
}

//main
const contacts = JSON.parse(localStorage.getItem('contacts')) || {}

let filteredContactsArr = []

let choosenData;

let timeoutEmpty;

const letters = [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z" ]


//first render
letters.forEach(letter => {
    if(!Object.hasOwn(contacts, letter)) contacts[letter] = []

    let div = document.createElement('div');
    let firstLetter = document.createElement('span');
    let count = document.createElement('span')
    
    count.innerText = contacts[letter].length || ""
    

    div.classList.add('letter');
    div.classList.add(`letter_${letter}`);
    count.classList.add(`count_${letter}`);
    count.classList.add(`count`);
    firstLetter.classList.add('first-letter')

    firstLetter.innerText = letter;

    div.append(firstLetter, count)
    document.querySelector('.list').appendChild(div);
})

//update counts
function updateCounts() {
    Object.entries(contacts).forEach(([key, cantactsArr]) => {
        const countEl = document.querySelector(`.count_${key}`)
        countEl.innerText = cantactsArr.length || ""
    })
}

const form = document.querySelector('.form')

const addButton = document.querySelector('.add-button')
const clearButton = document.querySelector('.clear-button')
const searchButton = document.querySelector('.search-button')


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

function validateInputs(form) {
    const { name: nameEl, vacancy: vacancyEl, phone: phoneEl } = form.elements
    const valuesArr = [nameEl, vacancyEl, phoneEl]
    let error = false;

    valuesArr.forEach(elem => {
        if (!elem.value.trim()) {
            elem.setCustomValidity("Error: empty field")
            elem.reportValidity()
            error = true
            return
        }
        
        if ( !elem.value.match( regulars[elem.name] ) ) {
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
    const { name: nameEl, vacancy: vacancyEl, phone: phoneEl } = form.elements

    const name = nameEl.value.trim()
    const vacancy = vacancyEl.value
    const phone = phoneEl.value

    if ( validateInputs(form) ) {
        return
    }

    const id = Date.now()

    const firstLetter = name[0].toUpperCase()

    contacts[firstLetter] = [...contacts[firstLetter], {id, name, vacancy, phone}]
}

const handleClear = () => {
    for (let contact in contacts) {
        contacts[contact] = []
    }
    form.reset()
    let infoEl = document.querySelector(".list-item__info")
    infoEl.classList.remove('list-item__info_opened')
    removeItems()
}

const handleChange = () => {

}

//list item onclick
const content = document.querySelector(".content")

content.onclick = (event) => {
    const letterEl = event.target.closest(".letter")


    //проверяем, что было нажатие на кнопку (делегируем)
    if (!letterEl) return
    let eventData = letterEl.querySelector(".first-letter").innerText
    let infoEl = document.querySelector(".list-item__info")

    //проверяем, что в данном списке есть люди
    if(contacts[eventData] < 1) {
        return
    }
    
    /* 
    проверяем, что если меню уже открыто 
    и мы нажали на другого контакта, то мы не 
    закрываем окошко, а перерисовываем существующее
    */
    if (choosenData && choosenData !== eventData) {
        choosenData = eventData
        infoEl.scrollTo({behavior: 'smooth', 'top': '0'})
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

    let infoEl = document.querySelector(".list-item__info")
    let searchEl = document.querySelector(".search-result")

    infoEl.innerHTML = ""

    if(contacts[choosenData]?.length < 1) {
        infoEl.classList.remove('list-item__info_opened')
        choosenData = ""
        updateCounts()
    }

    if(searchEl) {
        searchEl.innerHTML = "" 
        filteredContactsArr.forEach((user) => {
            const firstLetter = user.name[0].toUpperCase()
            createUserItem(user, firstLetter, searchEl)
        })
    }

    contacts[choosenData]?.forEach((user) => {
        createUserItem(user, choosenData, infoEl)
    })

    localStorage.setItem('contacts', JSON.stringify(contacts))

}

function removeItems () {
    const datas = document.querySelectorAll(".user-item")
    setTimeout(() => {
        for (let data of datas) {
            data.remove()
        }
    }, 500)
}


function openEditModal (user) {
    const {id, name, vacancy, phone} = user
    const firstLetterConst = name[0].toUpperCase()

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

        const {name: {value: name}, vacancy: {value: vacancy}, phone: {value: phone}} = editForm.elements
        const firstLetter = name[0].toUpperCase()

        const contactIndex = contacts[firstLetter].findIndex((el) => el.id === id)
        const contactFilteredIndex = filteredContactsArr.findIndex((el) => el.id === id)


        if (firstLetter === firstLetterConst) {
            contacts[firstLetterConst][contactIndex] = {...contacts[firstLetterConst][contactIndex], name, vacancy, phone}
            filteredContactsArr[contactFilteredIndex] = {...filteredContactsArr[contactFilteredIndex], name, vacancy, phone}
        } else {
            contacts[firstLetterConst] = contacts[firstLetterConst].filter(el => id !== el.id)
            contacts[firstLetter].push({id, name, vacancy, phone})
            filteredContactsArr = filteredContactsArr.filter(el => el.id !== id)

        }

        modalDiv.remove()
        renderItems()

        setTimeout(()=> {
            const items = document.querySelectorAll(`[data-id="${id}"]`)
            if(items.length > 0) {
                for (let item of items) {
                    item.style.cssText = `
                        background-color: yellow
                    `
                    setTimeout(() => {
                        item.style.cssText = `
                            background-color: rgb(231, 230, 237);
                        `
                    }, 200)
                }
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
        const firstLetter = user.name[0].toUpperCase()
        createUserItem(user, firstLetter, searchResultsDiv)
    })

    renderItems()

    searchInput.oninput = ({target}) => {
        if (!target.value.trim()) {            
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
            return name.toLowerCase().includes(target.value.toLowerCase())      
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

function createUserItem (user, firstLetter, placeToInsert) {
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

    editImg.src = "assets/images/edit.svg"
    deleteImg.src = "assets/images/delete.svg"

    editBtn.classList.add('edit-btn')
    deleteBtn.classList.add('delete-btn')

    editBtn.append(editImg)
    deleteBtn.append(deleteImg)
    buttonsDiv.append(editBtn, deleteBtn)
    itemDiv.append(buttonsDiv)

    itemDiv.dataset.id = id

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