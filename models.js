const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: [16, "DATABASE VALIDATION: username chars > 16"]
    },
    password: { 
        type: String,
        required: true,
    },
    PFP_path: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: setDate
    }
})

const users = mongoose.model("users", userSchema)

const commentVideoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    text: { 
        type: String,
        required: true,
        maxlength: [150, "DATABASE VALIDATION: text chars > 150"]
    },
    hearts: { type: Array },
    isHearted: { 
        type: Boolean,
        default: false 
    },
    date: {
        type: String,   
        default: setDate
    }
})

const videoSchema = new mongoose.Schema({
    id: { type: String },
    path: { type: String },
    thumbnail: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    title: { 
        type: String,
        required: true,
        maxlength: [150, "DATABASE VALIDATION: title chars > 150"]
    },
    desc: { 
        type: String,
        required: true,
        maxlength: [500, "DATABASE VALIDATION: desc chars > 500"]
    },
    hearts: { type: Array },
    date: {
        type: String,
        default: setDate
    },
    comments: [commentVideoSchema],
})

const videos = mongoose.model("videos", videoSchema)

function setDate() {
    const init = new Date()
    let hours = init.getHours()
    let minutes = init.getMinutes()
    
    if (hours < 10) hours = `0${hours}`
    if (minutes < 10) minutes = `0${minutes}`
    return `${hours}:${minutes} - ${init.getDate()}/${init.getMonth()+1}/${init.getFullYear()}`
}

module.exports = { users, videos }

//later: add required, unique property ecc....