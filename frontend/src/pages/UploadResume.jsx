import { useState } from "react"
import API from "../services/api"

export default function UploadResume() {

    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)

    const handleUpload = async () => {

        const formData = new FormData()
        formData.append("resume", file)

        try {

            const res = await API.post("/analyze", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })

            setResult(res.data)

        } catch (error) {
            console.log(error)
        }

    }

    return (

        <div style={{ padding: "40px" }}>

            <h2>AI Resume Analyzer</h2>

            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <button onClick={handleUpload}>
                Analyze Resume
            </button>

            {result && (

                <div>

                    <h3>ATS Score: {result.score}</h3>

                    <h4>Matched Skills</h4>
                    <ul>
                        {result.matched_skills.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>

                    <h4>Missing Skills</h4>
                    <ul>
                        {result.missing_skills.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>

                </div>

            )}

        </div>

    )

}