function query(element) { return document.querySelector(`${element}`) }
function queryAll(element) { return document.querySelectorAll(`${element}`) }

function error(error) { return spanError.innerHTML = `${error}` }

const inputsArr = queryAll("input")
const inputs = [inputsArr[1], inputsArr[2], inputsArr[3], inputsArr[3], inputsArr[4]] //terrible way (array padding to fit) => equal to register.js anyway
const form = queryAll("form")
const spanError = query("#error")
const pfpInput = query("#pfp-input")
const pfpPreview = query("#pfp-preview")
const boxShadow = "#a31b1b 0 0 2px 1px"
const spanLimits = queryAll("#limit")
const formBtn = query(".submit-modif")
const blurDiv = query(".blur")

const username = inputs[0].value

const deleteAccountBtn = query(".delete-acc"),
    deleteAccountDiv = query(".delete-account"),
    deleteAccountCancelLink = query(".cancel-deletion")

    deleteAccountDiv.style.transition = 'opacity .2s' //prevent firing at domcl

deleteAccountBtn.addEventListener("click", () => {
    deleteAccountDiv.style.opacity = 1
    deleteAccountDiv.style.visibility = 'visible'
    blurDiv.style.display = "block"
})

deleteAccountCancelLink.addEventListener("click", () => {
    deleteAccountDiv.style.opacity = 0
    deleteAccountDiv.style.visibility = 'hidden'
    blurDiv.style.display = "none"
})

const validators = { /* - MAX VALUES - */
    mb: 64,
    username: 16,
    password: 24,
    allowedFormat: /png|jpeg|jpg|gif/
}

form[1].addEventListener("submit", (e) => {
    
    if (inputs[1].value !== inputs[2].value) { //passwords don't match

        inputs[1].style.boxShadow = boxShadow
        inputs[2].style.boxShadow = boxShadow

        error("Password non corrispondenti.")

        e.preventDefault()
    }

    if (inputs[0].value.length > validators.username) e.preventDefault()
    if (inputs[1].value.length > validators.password) e.preventDefault()
    if (inputs[2].value.length > validators.password) e.preventDefault()

    inputs[0].value = inputs[0].value.trim()
})

inputs[0].maxLength = validators.username
inputs[1].maxLength = validators.password
inputs[2].maxLength = validators.password

spanLimits[0].innerHTML = `${inputs[0].value.length}/${validators.username}`
spanLimits[1].innerHTML = `0/${validators.password}`

inputs[0].addEventListener("input", () => {
    spanLimits[0].innerHTML = `${inputs[0].value.length}/${validators.username}`
    if (inputs[0].value.length >= validators.username) spanLimits[0].style.color = 'red'
    else spanLimits[0].style.color = null
    if (inputs[0].value !== username || inputs[1].value !== '' || inputs[4].value !== '') formBtn.disabled = false
    else formBtn.disabled = true
})

inputs[1].addEventListener("input", () => {
    spanLimits[1].innerHTML = `${inputs[1].value.length}/${validators.password}`
    if (inputs[1].value.length >= validators.password) spanLimits[1].style.color = 'red'
    else spanLimits[1].style.color = null
    if (inputs[0].value !== username || inputs[1].value !== '' || inputs[4].value !== '') formBtn.disabled = false
    else formBtn.disabled = true
})

pfpInput.addEventListener("change", (e) => {
    if (inputs[0].value !== username || inputs[1].value !== '' || inputs[4].value !== '') formBtn.disabled = false
    else formBtn.disabled = true
    const [ imgFile ] = pfpInput.files
    let format = imgFile.type
    let MBsize = imgFile.size / 1024 / 1000
    format = format.substring(format.indexOf('/') + 1);
    let check = validators.allowedFormat.test(format)
    if (check && MBsize < validators.mb) {
        pfpPreview.src = URL.createObjectURL(imgFile)
        error("")
    }
    else {
        if (!check) {
            error("File non ammesso.")
            inputs[4].value = ''
            if (inputs[0].value !== username || inputs[1].value !== '' || inputs[4].value !== '') formBtn.disabled = false
            else formBtn.disabled = true
            return
        }
        if (MBsize > validators.mb) return error(`File troppo grande (max = ${validators.mb}mb).`)
    }
})