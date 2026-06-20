import React, { useState } from 'react';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { UploadCloud, CheckCircle, AlertTriangle, Briefcase, Award, FileText, Activity } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume.");
      return;
    }
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);

    try {
      // Connect to the Node backend which forwards to FastAPI
      const response = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume. Make sure both backend servers are running and API keys are set.");
    }
    setLoading(false);
  };

  const getRadarData = (scores) => [
    { subject: 'Keywords', A: scores?.keyword_match || 0, fullMark: 100 },
    { subject: 'Semantic', A: scores?.semantic_match || 0, fullMark: 100 },
    { subject: 'Experience', A: scores?.experience_quality || 0, fullMark: 100 },
    { subject: 'Impact', A: scores?.achievements || 0, fullMark: 100 },
    { subject: 'Structure', A: scores?.structure || 0, fullMark: 100 },
    { subject: 'Readability', A: scores?.recruiter_readability || 0, fullMark: 100 },
  ];

  const getCompanyData = (companies) => {
    if (!companies || !Array.isArray(companies)) return [];
    return companies.map(c => ({
      name: c.company,
      score: c.readiness_score
    }));
  };

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Enterprise ATS Intelligence
          </h1>
          <p className="text-gray-400 text-lg">AI-Powered Resume Analysis & Recruiter Simulation</p>
        </div>

        {/* Upload Section */}
        {!results && (
          <div className="glass-panel p-8 max-w-2xl mx-auto space-y-6">
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors">
              <input type="file" onChange={handleFileChange} className="absolute opacity-0 w-full h-full cursor-pointer" accept=".pdf,.docx,.txt" />
              <UploadCloud size={48} className="text-indigo-400 mb-4" />
              <p className="text-lg font-medium">{file ? file.name : "Drag & Drop Resume or Click to Browse"}</p>
              <p className="text-sm text-gray-400 mt-1">PDF, DOCX, TXT</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Description (Optional but Recommended)</label>
              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-32"
                placeholder="Paste the job description here for highly accurate context matching..."
              />
            </div>

            {error && <div className="text-red-400 flex items-center gap-2"><AlertTriangle size={18}/> {error}</div>}

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-lg hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Activity className="animate-spin" /> Deep AI Analysis in Progress...
                </span>
              ) : "Simulate Enterprise ATS"}
            </button>
          </div>
        )}

        {/* Results Dashboard */}
        {results && results.ats_intelligence && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Top Row: Score & Agent */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* ATS Score */}
              <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-gray-400 font-medium mb-2 uppercase tracking-wider">Enterprise ATS Score</h3>
                <div className="text-7xl font-black text-indigo-400 mb-2">
                  {results.ats_intelligence.final_ats_score}
                </div>
                <div className="text-sm text-gray-400">Out of 100</div>
              </div>

              {/* Recruiter Agent Recommendation */}
              <div className="glass-panel p-6 md:col-span-2 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="text-purple-400" size={28} />
                  <h2 className="text-2xl font-bold">AI Recruiter Verdict: <span className="text-purple-400">{results.recruiter_agent?.recommendation || "N/A"}</span></h2>
                </div>
                <div className="space-y-2 text-gray-300">
                  {results.recruiter_agent?.reasoning?.map((reason, i) => (
                    <div key={i} className="flex gap-2">
                      <CheckCircle className="text-green-400 shrink-0 mt-1" size={18} />
                      <p>{reason}</p>
                    </div>
                  ))}
                </div>
                {results.recruiter_agent?.probability_metrics && (
                  <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div><p className="text-sm text-gray-400">ATS Pass</p><p className="font-bold">{results.recruiter_agent.probability_metrics.ats_pass_rate}%</p></div>
                    <div><p className="text-sm text-gray-400">Callback</p><p className="font-bold">{results.recruiter_agent.probability_metrics.recruiter_callback_rate}%</p></div>
                    <div><p className="text-sm text-gray-400">Interview</p><p className="font-bold">{results.recruiter_agent.probability_metrics.interview_probability}%</p></div>
                    <div><p className="text-sm text-gray-400">Offer</p><p className="font-bold">{results.recruiter_agent.probability_metrics.offer_probability}%</p></div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Row: Radar Chart & Company Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="glass-panel p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="text-indigo-400"/> Multi-Layer Intelligence Profile</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(results.ats_intelligence?.layer_scores)}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="text-purple-400"/> Top Company Simulator</h3>
                <div className="h-64 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getCompanyData(results.company_simulator?.company_readiness)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="score" fill="#a855f7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {results.company_simulator?.company_readiness?.map((co, i) => (
                     co.missing_requirements && co.missing_requirements.length > 0 && (
                        <div key={i} className="text-sm">
                          <span className="font-bold text-gray-300">{co.company} Gap: </span>
                          <span className="text-red-400">{co.missing_requirements[0]}</span>
                        </div>
                     )
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Row: Detailed Gaps & Missing */}
            <div className="glass-panel p-6">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-indigo-400"/> ATS Gaps & Recommendations</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-400 mb-2">Missing Critical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.ats_intelligence.extracted_data?.missing_skills?.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-500/30">
                          {skill}
                        </span>
                      ))}
                      {(!results.ats_intelligence.extracted_data?.missing_skills || results.ats_intelligence.extracted_data.missing_skills.length === 0) && (
                        <span className="text-green-400">No missing skills detected!</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-400 mb-2">Recruiter Readability Gaps</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {results.ats_intelligence.readability_details?.hidden_strengths?.map((str, i) => (
                        <li key={i} className="flex gap-2 items-start"><AlertTriangle size={14} className="text-yellow-500 mt-1 shrink-0"/>{str} is buried and needs better visibility.</li>
                      ))}
                    </ul>
                  </div>
               </div>
            </div>

            <button onClick={() => setResults(null)} className="mx-auto block px-6 py-2 border border-gray-600 rounded-lg hover:bg-slate-800 transition">
              Analyze Another Resume
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;
