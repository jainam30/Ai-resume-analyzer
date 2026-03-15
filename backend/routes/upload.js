const express = require("express")
const multer = require("multer")

const router = express.Router()

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const upload = multer({ storage })

router.post("/resume", upload.single("resume"), (req, res) => {
    res.json({
        message: "Resume uploaded",
        file: req.file
    })
})

module.exports = router