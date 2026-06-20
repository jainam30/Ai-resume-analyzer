import React, { useState } from "react"
import API from "../services/api"

export default function UploadResume() {
    const [file, setFile] = useState(null)
    const [jobDescription, setJobDescription] = useState("")
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleUpload = async () => {
        if (!file) {
            setError("Please upload a resume (PDF or DOCX).")
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)

        const formData = new FormData()
        formData.append("resume", file)
        formData.append("job_description", jobDescription)

        try {
            const res = await API.post("/analyze", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            setResult(res.data)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.error || "Error analyzing resume. Please make sure the AI Engine and Backend are running.")
        } finally {
            setLoading(false)
        }
    }

    const getScoreClass = (score) => {
        if (score >= 80) return "high"
        if (score >= 50) return "medium"
        return "low"
    }

    return (
        <div className="glass-card">
            {error && <div className="error-msg">{error}</div>}

            <div className="form-group">
                <label>Job Description (Optional)</label>
                <textarea 
                    className="jd-input"
                    placeholder="Paste the job description here to extract required skills dynamically..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Upload Resume</label>
                <div className="file-upload-zone">
                    <span className="upload-icon">📄</span>
                    <p>{file ? "Click to change file" : "Drag & drop or click to upload PDF/DOCX"}</p>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                setFile(e.target.files[0])
                                setError(null)
                            }
                        }}
                    />
                    {file && <div className="file-name">{file.name}</div>}
                </div>
            </div>

            <button 
                className="analyze-btn" 
                onClick={handleUpload}
                disabled={loading || !file}
            >
                {loading ? (
                    <><span className="loader"></span> Analyzing...</>
                ) : (
                    "✨ Analyze Resume"
                )}
            </button>

            {result && (
                <div className="results-container">
                    <div className="score-card">
                        <h2>ATS Match Score</h2>
                        <div className={`score-value ${getScoreClass(result.score)}`}>
                            {result.score}%
                        </div>
                        <p>Based on {(result.matched_skills?.length || 0) + (result.missing_skills?.length || 0)} total required skills</p>
                    </div>

                    <div className="skills-grid">
                        <div className="skill-box matched">
                            <h3>✅ Matched Skills ({result.matched_skills?.length || 0})</h3>
                            <div className="skill-tags">
                                {result.matched_skills && result.matched_skills.length > 0 ? (
                                    result.matched_skills.map((s, i) => (
                                        <span key={i} className="badge matched">{s}</span>
                                    ))
                                ) : (
                                    <span className="badge">None</span>
                                )}
                            </div>
                        </div>

                        <div className="skill-box missing">
                            <h3>❌ Missing Skills ({result.missing_skills?.length || 0})</h3>
                            <div className="skill-tags">
                                {result.missing_skills && result.missing_skills.length > 0 ? (
                                    result.missing_skills.map((s, i) => (
                                        <span key={i} className="badge missing">{s}</span>
                                    ))
                                ) : (
                                    <span className="badge matched">All Match!</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}