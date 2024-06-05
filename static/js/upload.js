function query(element) { return document.querySelector(`${element}`) }
function queryAll(element) { return document.querySelectorAll(`${element}`) }

function error(error) { return spanError.innerHTML = `${error}` }

const form = query("form#upload")
const inputFields = queryAll("#field")
const spanError = query("#error")
const boxShadow = '#a31b1b 0 0 2px 1px'
const loading = query(".loading") 

const validators = { /* - MAX VALUES - */
    title: 150, 
    desc: 500, 
    mb: 500,
    allowedFormat: /mp4|m4v/
}

form.addEventListener("submit", (e) => {
    if (inputFields[1].value.length > validators.title) {
        error(`Caratteri massimi per il titolo: ${validators.title}`)
        inputFields[1].style.boxShadow = boxShadow
        return e.preventDefault()
    } 
    else inputFields[1].style.boxShadow = null

    if (inputFields[2].value.length > validators.desc) {
        error(`Caratteri massimi per la descrizione: ${validators.desc}`)
        inputFields[2].style.boxShadow = boxShadow
        return e.preventDefault()
    } 
    else inputFields[2].style.boxShadow = null

    inputFields.forEach(input => {
        if (input.value == '') {
            input.style.boxShadow = boxShadow
            error("Compila tutti i campi.")
            e.preventDefault()
        }   
        else input.style.boxShadow = null
    })

})

inputFields[0].addEventListener("change", (e) => {
    const [ videoFile ] = inputFields[0].files
    let format = videoFile.type
    let MBsize = videoFile.size / 1024 / 1000
    format = format.substring(format.indexOf('/') + 1);
    let check = validators.allowedFormat.test(format)
    if (check && MBsize < validators.mb) error("")
    else {
        inputFields[0].value = null
        if (!check) return error("File non ammesso.")
        if (MBsize > validators.mb) return error(`File troppo grande (max = ${validators.mb}mb).`)
    }
})