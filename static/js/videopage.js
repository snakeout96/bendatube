function query(element) { return document.querySelector(`${element}`) }
function queryAll(element) { return document.querySelectorAll(`${element}`) }

const heartBtn = query("input#heart"),
    labelHeart = query("label[for='heart'] span"),
    commentBtn = query("button#comment"),
    inputComment = query("textarea#comment"),
    divComment = query("section.comments"),
    spanError = query("span#error"),
    deleteComment = queryAll("#delete-comment"),
    spanLimit = query("span#limit"),
    inputSearch = query("textarea#comment"),
    pDesc = query("p.desc"),
    textareaExpand = query(".espandi")

const validators = { /* - MAX VALUES - */
    comment: 150,
}

let expanded = false;

inputSearch.maxLength = validators.comment
spanLimit.innerHTML = `0/${validators.comment}`

async function fetchDeleteComment(btn) {
    let p = btn.previousElementSibling.querySelector("p"), text = p.textContent
    if (text != 'Sei sicuro?') {
        p.innerHTML = `Sei sicuro?<img src="/static/img/cancel.svg" style="width: 25px; margin-left: 1em; display: inline-block; height: 100%; vertical-align: middle; cursor: pointer;" onclick='this.parentElement.style.color = null; this.parentElement.textContent = "${text.replace(/\n/g, "\\n")}";'>`
        p.style.cssText = 'color: red !important'
        return
    }
    await fetch(window.location.href + "/deletecomment", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            "commentId": btn.getAttribute("_id")
        })
    }).then(res => res.json())
    .then(data => {
        //no error, in this case err is assigned with null value when fulfill
        if (data.err == null) btn.parentElement.remove()
        else document.write(data.err)
    })
    .catch((err) => console.log("Failed to fetch: " + err))
}

heartBtn.addEventListener("change", (e) => {
    
    fetch(window.location.href + "/heart", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            "isHeart": e.currentTarget.checked
        })
    })
    .then((res) => res.json())
    .then((data) => labelHeart.textContent = data.hearts.length) //change later with static inc/dec
    .catch((err) => console.log("Failed to fetch: " + err)) //optimize later
})

commentBtn.addEventListener("click", async (e) => {

    const comment = inputComment.value
    if (comment == '' || comment.length > validators.comment) 
        return inputComment.style.border = "1px solid red"

    else inputComment.style.border = ''

    await fetch(window.location.href, {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            "comment": comment
        })
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.err == undefined) { //no error, in this case err is not assigned when fulfill
            console.log(data)
            divComment.insertAdjacentHTML("afterbegin", 
            `<div class="comment-list" id="comments">
                <img class="pfp" src="/static/pfp/${data.user.PFP_path}">
                <div class="desc-name">
                    <h4></h4>
                    <p></p>
                </div>
                <button id="delete-comment" class="flex-div" _id="${data._id}">
                    <img src="/static/img/deleteacc.svg">
                </button>
            </div>` 
            )  
            //prevent script injection
            query("div.desc-name h4").textContent = `${data.user.username}`
            query("div.desc-name h4").innerHTML += `<span class="views-days">${data.date}</span>`
            query("div.desc-name p").textContent = `${data.text}`
            
            const btn = query("div.comment-list button")
            btn.addEventListener("click", () => fetchDeleteComment(btn))
        }
            
        else document.write(data.err.message)
    })
    .catch((err) => console.log("Failed to fetch: " + err))

    inputComment.value = ""
})

deleteComment.forEach(btn => {
    btn.addEventListener("click", () => fetchDeleteComment(btn))
})

inputComment.addEventListener("input", () => {
    spanLimit.innerHTML = `${inputComment.value.length}/${validators.comment}`
    if (inputComment.value.length >= validators.comment) spanLimit.style.color = 'red'
    else spanLimit.style.color = null
})

function grow(element) {
    element.style.height = "18px";
    element.style.height = (element.scrollHeight) + "px";
}

let chkbx = query("input#heart")
let heart = query(".heart-icon")

chkbx.addEventListener("change", (e) => {
    if (e.currentTarget.checked) heart.className = "fa fa-heart heart-icon"
    else heart.className = "fa fa-heart-o heart-icon"
})

if (pDesc.offsetHeight <= 100) textareaExpand.style.display = "none"

function espandi(){
    if(!expanded){
        textareaExpand.innerHTML = "Comprimi...";
        pDesc.style.maxHeight = ""
        expanded = true;
    }else{
        textareaExpand.innerHTML = "Espandi...";
        pDesc.style.maxHeight = "100px";
        expanded = false;
    }
}
/*
const commentArea = document.getElementById("comment");

commentArea.addEventListener("input", function() {
    this.style.height = "2em";
    if (this.scrollHeight > this.clientHeight) {
        this.style.height = this.scrollHeight + "px";
    }
}); */
