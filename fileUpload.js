const multer = require("multer")
const path = require("path")
const ffmpeg = require('ffmpeg')

const videoMaxSize = 1 * 1000 * 1000 * 1000; //1 gb
const pfpMaxSize = 64 * 1000 * 1000; //64 mb

/* --- VIDEO UPLOAD --- */

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "static/videos")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
    
const videoUpload = multer({ 
    storage: videoStorage,
    limits: { fileSize: videoMaxSize },
    fileFilter: (req, file, cb) => {
        
        let fileTypes = /mp4|m4v/
        let mimeType = fileTypes.test(file.mimetype)
  
        let extName = fileTypes.test(path.extname(file.originalname).toLowerCase())
        
        if (mimeType && extName) return cb(null, true)
        else cb("ERROR: Formati supportati => " + fileTypes)
    } 
}).single("video")

/* --- PFP UPLOAD --- */

const pfpStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "static/pfp")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const pfpUpload = multer({ 
    storage: pfpStorage,
    limits: { fileSize: pfpMaxSize },
    fileFilter: (req, file, cb) => {
        let fileTypes = /png|jpeg|jpg|gif/
        let mimeType = fileTypes.test(file.mimetype)
  
        let extName = fileTypes.test(path.extname(file.originalname).toLowerCase())
        
        if (mimeType && extName) return cb(null, true)
        else cb("ERROR: Formati supportati => " + fileTypes)
    } 
}).single("pfp")

function extractFirstFrame(video) {
    return new Promise((resolve, reject) => {
        let process = new ffmpeg(`static/videos/${video.path}`)
        process.then((data) => {
        data.fnExtractFrameToJPG("static/thumbnails", {
            start_time: 0,
            number: 1,
            file_name: video.id
        }, (error, files) => {
            if (error) reject(error)

            video.thumbnail = files.pop().replace("static/thumbnails/", "")
            resolve()
        })
    })
    })
}

module.exports = { videoUpload, pfpUpload, extractFirstFrame }