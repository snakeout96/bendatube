//Libraries
const express = require("express"), 
     mongoose = require("mongoose"), 
     passport = require("passport"), 
        flash = require("express-flash"),
      session = require("express-session"), 
methodOverride = require("method-override"), 
       bcrypt = require("bcrypt"),
  compression = require('compression'),
 MongoDBStore = require('connect-mongodb-session')(session)
       
//Exported modules
const initPassport = require("./passport")
const { users, videos } = require("./models")
const { videoUpload, pfpUpload, extractFirstFrame } = require("./fileUpload")

/* --- FULL INIT --- */

//MUST: ADD PROCESS MANAGER LATER TO PREVENT CRUSHES

const app = express()
require('dotenv').config()
initPassport(passport)

app.set("views", "front")
app.set("view engine", "ejs")
//app.set('trust proxy', 1) trust first proxy


app.use(express.urlencoded( { extended: false } )) //can read form's response
app.use(express.json())
app.use(compression({threshold: 0}))
app.use(flash())

//Cookie manager
let store = new MongoDBStore({
    uri: process.env.DB_CONNECT,
    collection: 'users_sessions'
})

app.use((req, res, next) => {
    //res.set("Cache-Control", "max-age: 1, must-revalidate")
    res.set("Cache-Control", "no-cache")
    next()
})

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
    //cookie: { secure: true } /* CHANGE LATER COOKIE SETTINGS! */
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err))

//Check auth (middleware functions)

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next()
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return res.redirect("/")
    next()
}

app.all(/static/, checkAuthenticated)

app.use("/static", express.static("static"))
app.use("/public", express.static("public"))

/* --- ROUTERING --- */

app.get("/", checkAuthenticated, async (req, res) => {
    videos.find({}).sort({_id: -1}).populate({
        path: 'user',
        select: 'username PFP_path',
        options: {
            transform: (doc) => {
                return doc ? doc : {username: 'Utente eliminato', PFP_path: 'miss_user_sad.png'}
            }
        }
    })
    .then(videos => {
        res.render("index.ejs", { videos, user: req.user, query: '' })
    })
    .catch(err => res.send("Issue with database: " + err))
})  

app.get("/login", checkNotAuthenticated, (req, res) => { res.render("login.ejs") })
//optimize later register error
app.get("/register", checkNotAuthenticated, (req, res) => { res.render("register.ejs", { "error": "" }) })

//Register System (todo later: no session middleware in "/login" and "/register")

app.post("/register", (req, res) => {
    pfpUpload(req, res, async (err) => { 
        if (err) return res.send(err)
        try {
            const user = {}
            //prevent conflicts validation
            if (req.body.password.length > 24) return res.send("ERROR: Password chars > 24")
            if (req.body.password.length == 0) return res.send("ERROR: password null")
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            user.username = req.body.username
            user.password = hashedPassword
            user.PFP_path = req.file.filename
            const newUser = new users(user)
        
            //change later
            if (req.body.secretcode != process.env.SECRET_KEY)
                res.render("register.ejs", { "error": "SECRET_KEY non valida." })
            else {
                users.findOne( { username: user.username } ).then(username => {
                if (username) 
                    res.render("register.ejs", { "error": "Username già esistente." })
                else {
                    newUser.save()
                    .then(() => res.render("termsAndCondition.ejs"))
                    .catch((err) => res.send(err.message))
                    //res.redirect("login")
                }
            })
        }    
        } catch (err) {
            res.redirect("/register") 
        }
    })  
})

//Login system

app.post("/login", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    (req, res) => { 
        if (req.body.remember_me == "on") req.session.cookie.originalMaxAge = 3650 * 24 * 3600 * 100
        res.redirect("/") 
    })

//Logout system

app.delete("/logout", checkAuthenticated, (req, res) => {
    req.logOut(err => { if (err) { return next(err) } })
    res.redirect("/login")
})

//Abort account system

app.post("/abort", checkAuthenticated, async (req, res) => {

    if (req.body.holdData == undefined) {
        try {
            const userToRIP = req.user._id
            //await videos.updateMany({user: userToRIP}, { $set: { user: "Utente eliminato" } })
            await videos.updateMany({}, { $pull: {hearts: userToRIP} })
            //await videos.updateMany({ "comments.user": userToRIP }, { $set: { "comments.$[elem].user": "Utente eliminato" } }, { arrayFilters: [{ "elem.user": userToRIP }] });
            await users.findOneAndDelete( { _id: userToRIP } )
        } catch (err) {
            return res.send("Issue with database: " + err)
        }
    } else { //cancella tuttof
        try {
            //await videos.deleteMany({user: req.user._id})
            await videos.updateMany({}, { $pull: {hearts: req.user._id} })
            //await videos.updateMany({ "comments.user": req.user_id }, { $pull: { comments: { user: req.user._id } } })
            await users.findOneAndDelete( { _id: req.user._id } )
        } catch (err) {
            return res.send("Issue with database: " + err)  
        }
    }
    res.redirect("/login")
})

//Upload system 

app.get("/upload", checkAuthenticated, (req, res) => {
    res.render("upload.ejs", { user: req.user, query:"" })
})

app.post("/upload", checkAuthenticated, (req, res) => {

    videoUpload(req, res, async (err) => { //everytime upload
        if (err) return res.send(err)

        if (req.file == undefined) return res.send("Something wrong. Maybe ffmpeg not installed on the web server, or a weird attempt to fuck the system.")
        const video = {
            user: req.user._id,
            id: req.file.filename.substring(0, req.file.filename.indexOf(".")),
            path: req.file.filename,
            title: req.body.title,
            desc: req.body.desc,
        }

        await extractFirstFrame(video).catch(error => res.send(error))
        
        const newVideo = new videos(video)
        newVideo.save()
        .then(() => res.redirect(`/videos/${video.id}`))
        .catch((err) => res.send(err.message))
    })
})

//Fetching video system

app.get("/videos/:id", checkAuthenticated, async (req, res) => { 

    try {
        const doc = await videos.findOne({ id: req.params.id }).populate([
            {
                path: 'user',
                select: 'username PFP_path',
                options: {
                    transform: (doc) => {
                        return doc ? doc : {username: 'Utente eliminato', PFP_path: 'miss_user_sad.png'}
                    }
                }
            },
            {
                path: 'comments.user',
                select: 'username PFP_path',
                options: {
                    transform: (doc) => {   
                        return doc ? doc : {username: 'Utente eliminato', PFP_path: 'miss_user_sad.png'}
                    }
                }
            }
        ])
        if (doc) doc.comments.reverse()
        else return res.render("404.ejs", {user: req.user, query: ""})
        
        const tumbSection = await videos.find({}).sort({ _id: -1 }).limit(10) //get the 10 latest documents

        res.render("videopage.ejs", { doc, tumbSection, user: req.user, query:"" })
    } catch (err) {
        res.send("Issue with database: " + err)
    }   
})

app.post("/videos/:id", (req, res) => { //post comment
    const comment = {
        user: req.user._id,
        text: req.body.comment,
    }

    videos.findOneAndUpdate({ id: req.params.id }, { $push: { comments: comment } }, { new: true, runValidators: true }).populate({
        path: 'comments.user',
        select: 'username PFP_path',
        options: {
            transform: (doc) => {
                return doc ? doc : {username: 'Utente eliminato', PFP_path: 'miss_user_sad.png'}
            }
        }
    })
        .then(doc => {
            console.log(doc)
            let yourComment = doc.comments.pop() //thanks marchesan, you've been helpful here
            res.json(yourComment)
        })  
        .catch(err => res.json({err: err})) //fix later (risolto pero non carica la pagina di errore per le richieste fetch)
})

app.post("/videos/:id/heart", checkAuthenticated, (req, res) => { //like video
    //optimize with static inc/dec span
    function action() {
        return (req.body.isHeart) ? { $push: { hearts: req.user._id }}
        : { $pull: { hearts: req.user._id }}
    }

    videos.findOneAndUpdate({ id: req.params.id }, action(), { new: true })
        .then((doc) => res.json({ "hearts": doc.hearts } ))
        .catch((err) => res.send("Issue with database: " + err))
})

app.delete("/videos/:id", checkAuthenticated, (req, res) => { 
    //search to better method (cookie, id) instaed of req.user

    videos.findOne( { id: req.params.id } ).populate({
        path: 'user',
        select: 'username PFP_path',
        options: {
            transform: (doc) => {
                return doc ? doc : {username: 'Utente eliminato', PFP_path: 'miss_user_sad.png'}
            }
        }
    }).then((doc) => {
        (req.user.username == doc.user.username) ? doc.delete()
        : res.send("FORBIDDEN")

        res.redirect("/")
    }) 
    .catch((err) => res.send("Issue with database: " + err))
    
})

app.post("/videos/:id/deletecomment", checkAuthenticated, (req, res) => {
    
   videos.findOne({ id: req.params.id }).populate([
            {
                path: 'user',
                select: 'username PFP_path',
                options: {
                    transform: (doc) => {
                        return doc ? doc : {username: 'Utente eliminato', PFP_path: 'miss_user_sad.png'}
                    }
                }
            },
            {
                path: 'comments.user',
                select: 'username PFP_path',
                options: {
                    transform: (doc) => {
                        return doc ? doc : {username: 'Utente eliminato', PFP_path: 'miss_user_sad.png'}
                    }
                }
            },
        ])
    .then((doc) => {
        const comments = doc.comments.id(req.body.commentId)
        if (comments.user.username != req.user.username && req.user.username != doc.user.username) return res.json({ err: "Can't modify someone else's comment." })
        comments.remove()
        doc.save()
        .then(() => res.json({ err: null} ))
        .catch(err => res.json({ err: err } ))
    })
    .catch(err => res.json({err: err})) 
    
})

app.get("/profile", checkAuthenticated, (req, res) => res.render("profile.ejs", {user: req.user, query:"", error: ''}))

app.post("/profile", checkAuthenticated, async (req, res) => {
    pfpUpload(req, res, async (err) => { 
        if (err) return res.send(err)
        try {
            //prevent conflicts validation
            if (req.body.password.length > 24) return res.send("ERROR: Password chars > 24")
            if (req.body.username === req.user.username && req.body.password === '' && req.body.pfp === '') return res.redirect("/") //nothing changed, avoiding useless queries [js bypass]
        
            if (req.body.username !== "" && req.body.username !== req.user.username) {
                const username = await users.findOne( { username: req.body.username } )
                if (username) 
                    return res.render("profile.ejs", { "error": "Username già esistente.", user: req.user, query: '' })
                else 
                    await users.findByIdAndUpdate(req.user._id, { username: req.body.username }, { new: true, runValidators: true })
            }
         
            if (req.body.password !== "") {
                const hashedPassword = await bcrypt.hash(req.body.password, 10)
                await users.findByIdAndUpdate(req.user._id, { password: hashedPassword }, { new: true })
            }

            if (req.file !== undefined) {
                await users.findByIdAndUpdate(req.user._id, { PFP_path: req.file.filename }, { new: true })
            }
            
            req.logOut(err => { if (err) return res.send(err) })
            res.redirect("/login")
            
        } catch (err) {
            res.send("Issue: " + err) 
        }
    })
})

app.post("/", checkAuthenticated, (req, res) => {
    let queryString = req.body.query.trim().replace(/ +/g, " ").replace(/ /g, "+")
    res.redirect(`/search/?query=${queryString}`)
})

app.get("/search", checkAuthenticated, (req, res) => {
    const userQueried = req.query.query.toLowerCase().replace('user: ', '')
    if (req.query.query.startsWith('user:')) {
        videos.find()
        .populate({
            path: 'user',
            select: 'username PFP_path',
            match: { username: userQueried },
        })
        .sort({_id: -1})
        .then(doc => {
            const videos = doc.filter(video => video.user !== null)
            res.render("index.ejs", {videos, user: req.user, query: req.query.query})
        })
        .catch(err => res.send("Issue with database: " + err))
    }
    else {
        const query = new RegExp(req.query.query, 'i')
        videos.find({title: query}).populate({
            path: 'user',
            select: 'username PFP_path',
            options: {
                transform: (doc) => {
                    return doc ? doc : {username: 'Utente eliminato', PFP_path: 'miss_user_sad.png'}
                }
            }
        })
        .sort({_id: -1})
        .then(videos => {
            console.log(videos)
            res.render("index.ejs", {videos, user: req.user, query: req.query.query})
        })
        .catch(err => res.send("Issue with database: " + err))
    }
})

app.get('*', checkAuthenticated, (req, res) => { res.render("404.ejs", {user: req.user, query:""}) }) //Not found XD

app.listen(process.env.PORT)
