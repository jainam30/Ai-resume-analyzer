const express = require("express")
const cors = require("cors")
const multer = require("multer")
const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")

const app = express()

app.use(cors())
app.use(express.json())

const upload = multer({ dest: "uploads/" })

app.post("/api/analyze", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No resume file provided" })
        }
        
        const jobDescription = req.body.job_description || ""

        // Prepare form data to send to FastAPI
        const formData = new FormData()
        formData.append("file", fs.createReadStream(req.file.path), req.file.originalname)
        formData.append("job_description", jobDescription)

        const response = await axios.post("http://localhost:8000/analyze", formData, {
            headers: {
                ...formData.getHeaders()
            }
        })

        // Clean up the temporarily stored file
        fs.unlinkSync(req.file.path)

        res.json(response.data)

    } catch (error) {
        console.error("Analysis Error:", error?.response?.data || error.message)
        // Ensure cleanup even on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        res.status(500).json({ error: "Failed to analyze resume" })
    }
})

app.get("/", (req, res) => {
    res.send("AI Resume Analyzer API Running")
})

const PORT = 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})