function query(element) { return document.querySelector(`${element}`) }
function queryAll(element) { return document.querySelectorAll(`${element}`) }

let form = query("form")
let spanError = query("#error")
let boxShadow = "#a31b1b 0 0 2px 1px"
  
form.addEventListener("submit", (e) => {
    let inputs = queryAll("input")

    inputs.forEach(input => {
        if (input.value == "") {
            input.style.boxShadow = boxShadow
            spanError.innerHTML = "Compila tutti i campi."
            e.preventDefault()
        }
        else input.style.boxShadow = ""
    })
})

