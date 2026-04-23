import { useState } from "react";

const COUNTRIES = ["United States","United Kingdom","India","Canada","Australia","Germany","France","UAE","Singapore","South Africa","Nigeria","Brazil","Japan","South Korea","Netherlands","Sweden","New Zealand","Malaysia","Philippines","Kenya","Pakistan","Bangladesh","Sri Lanka","Ireland","Italy","Spain","Portugal","Poland","Mexico","Argentina"];

const COUNTRY_FIELDS = {
  "UAE": [{key:"nationality",label:"Nationality",placeholder:"e.g. Indian"},{key:"visaStatus",label:"Visa Status",placeholder:"Employment Visa / Visit Visa / Own Visa"},{key:"languages",label:"Languages Known",placeholder:"English, Arabic, Hindi"}],
  "United Kingdom": [{key:"rightToWork",label:"Right to Work",placeholder:"British Citizen / Skilled Worker Visa / Graduate Visa"},{key:"languages",label:"Languages",placeholder:"English, French..."}],
  "Australia": [{key:"rightToWork",label:"Work Rights",placeholder:"Australian Citizen / PR / Working Holiday"},{key:"languages",label:"Languages",placeholder:"English..."}],
  "Canada": [{key:"rightToWork",label:"Work Authorization",placeholder:"Canadian Citizen / PR / Work Permit"},{key:"languages",label:"Languages",placeholder:"English, French..."}],
  "United States": [{key:"rightToWork",label:"Work Authorization",placeholder:"US Citizen / Green Card / H1B / OPT"},{key:"languages",label:"Languages",placeholder:"English, Spanish..."}],
  "Germany": [{key:"rightToWork",label:"Work Permit",placeholder:"EU Citizen / Work Permit"},{key:"languages",label:"Languages",placeholder:"German, English..."}],
  "Singapore": [{key:"rightToWork",label:"Work Pass",placeholder:"Singapore PR / EP / S Pass / Work Permit"},{key:"languages",label:"Languages",placeholder:"English, Mandarin..."}],
};

export default function App() {
  const [tab, setTab] = useState("builder");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsResumeText, setAtsResumeText] = useState("");
  const [atsJobDesc, setAtsJobDesc] = useState("");
  const [form, setForm] = useState({fullName:"",email:"",phone:"",country:"",city:"",linkedIn:"",jobTitle:"",summary:"",jobDescription:"",nationality:"",visaStatus:"",languages:"",rightToWork:""});
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [experiences, setExperiences] = useState([{company:"",role:"",duration:"",description:""}]);
  const [education, setEducation] = useState([{institution:"",degree:"",year:""}]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const addSkill = () => { if(skillInput.trim()&&!skills.includes(skillInput.trim())){setSkills(s=>[...s,skillInput.trim()]);setSkillInput("");} };
  const updateExp = (i,k,v) => setExperiences(ex=>ex.map((e,idx)=>idx===i?{...e,[k]:v}:e));
  const updateEdu = (i,k,v) => setEducation(ed=>ed.map((e,idx)=>idx===i?{...e,[k]:v}:e));

  const extraFields = COUNTRY_FIELDS[form.country] || [];

  const generate = async () => {
    if(!form.fullName||!form.country||!form.jobTitle){setError("Please fill Name, Country, and Job Title.");return;}
    setError("");setLoading(true);setResult(null);
    try {
      const countryExtra = extraFields.map(f=>`${f.label}: ${form[f.key]||"Not specified"}`).join(", ");
      const prompt = `Write a polished, professional resume for ${form.country} job market. Follow exact resume conventions for ${form.country}.

CANDIDATE INFO:
Name: ${form.fullName}
Email: ${form.email} | Phone: ${form.phone} | City: ${form.city}
LinkedIn: ${form.linkedIn||"Not provided"}
Target Role: ${form.jobTitle}
Skills: ${skills.join(", ")||"Not specified"}
${countryExtra}

EXPERIENCE:
${experiences.map(e=>`${e.role} at ${e.company} (${e.duration}): ${e.description}`).join("\n")}

EDUCATION:
${education.map(e=>`${e.degree} at ${e.institution} (${e.year})`).join("\n")}

SUMMARY: ${form.summary||"Generate a professional summary"}
JOB DESCRIPTION: ${form.jobDescription||"General role"}

INSTRUCTIONS:
1. Write a complete polished resume following ${form.country} conventions
2. Use proper formatting with sections: Contact, Summary, Experience, Education, Skills${extraFields.length>0?", and include "+extraFields.map(f=>f.label).join(", ")+" as required for "+form.country+" resumes":""}
3. Make bullet points strong with action verbs and quantifiable results
4. After the resume write exactly: ---ATS_DATA---
5. Then write ONLY this JSON (no other text):
{"score":82,"keyword":78,"formatting":88,"readability":85,"skills":80,"rating":"Good","tips":["specific tip 1","specific tip 2","specific tip 3","specific tip 4"],"missing":["missing item 1","missing item 2","missing item 3"]}`;

      const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const fullText = data?.text || "";

      let resumeText = fullText;
      let ats = {score:72,keyword:68,formatting:85,readability:78,skills:70,rating:"Good",tips:[],missing:[]};

      if(fullText.includes("---ATS_DATA---")){
        const parts = fullText.split("---ATS_DATA---");
        resumeText = parts[0].trim();
        try{
          const jsonStr = parts[1].trim();
          const parsed = JSON.parse(jsonStr);
          ats = {...ats,...parsed};
        }catch{}
      }

      if(!resumeText||resumeText.length<50) resumeText = fullText;
      setResult({resume:resumeText, ats});
    }catch(e){setError("Error: "+e.message);}
    setLoading(false);
  };

  const analyzeATS = async () => {
    setAtsLoading(true);setAtsResult(null);
    try {
      const prompt = `Analyze this resume against the job description for ATS compatibility. Be specific and actionable.
After analysis write ONLY this JSON:
{"overall":85,"keyword":80,"formatting":90,"readability":88,"skills":82,"rating":"Good","tips":["specific actionable tip 1","specific actionable tip 2","specific actionable tip 3"],"missing_keywords":["keyword1","keyword2","keyword3"]}

RESUME:
${atsResumeText}

JOB DESCRIPTION:
${atsJobDesc}`;

      const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const text = data?.text || "{}";
      try{
        const clean = text.replace(/```json|```/g,"").trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if(jsonMatch) setAtsResult(JSON.parse(jsonMatch[0]));
      }catch{
        setAtsResult({overall:70,keyword:65,formatting:80,readability:75,skills:68,rating:"Good",tips:["Add more keywords from job description","Use standard section headings","Quantify your achievements with numbers"],missing_keywords:[]});
      }
    }catch{}
    setAtsLoading(false);
  };

  const sc = (s) => s>=80?"#43e97b":s>=60?"#ffd700":"#ff6584";

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0a0a0f",minHeight:"100vh",color:"#f0f0f8",padding:"20px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>

        {/* Header */}
        <div style={{textAlign:"center",padding:"40px 0 32px"}}>
          <div style={{display:"inline-block",background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",color:"#a89fff",fontSize:12,padding:"4px 14px",borderRadius:100,marginBottom:16}}>🌍 AI-POWERED · GLOBAL · ATS-READY</div>
          <h1 style={{fontSize:"clamp(28px,6vw,52px)",fontWeight:800,background:"linear-gradient(135deg,#fff 30%,#a89fff 70%,#ff6584 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 12px"}}>ResumeForge AI</h1>
          <p style={{color:"#7878a0",fontSize:16,margin:0}}>Build country-specific, ATS-optimized resumes for any job, anywhere.</p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,background:"#13131a",border:"1px solid #2a2a3d",borderRadius:12,padding:5,maxWidth:380,margin:"0 auto 32px"}}>
          {["builder","ats"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 16px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:500,background:tab===t?"#6c63ff":"transparent",color:tab===t?"#fff":"#7878a0"}}>
              {t==="builder"?"✦ Build Resume":"◎ ATS Checker"}
            </button>
          ))}
        </div>

        {tab==="builder"&&<>
          {error&&<div style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff6584",borderRadius:10,padding:"12px 16px",marginBottom:16}}>⚠ {error}</div>}

          {/* Personal Info */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>Personal Information</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[["Full Name *","fullName","Mohammed Asif"],["Email","email","email@example.com"],["Phone","phone","+971 50 123 4567"],["City","city","Dubai"],["LinkedIn","linkedIn","linkedin.com/in/yourname"]].map(([l,k,p])=>(
                <div key={k}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>{l}</label><input placeholder={p} value={form[k]} onChange={e=>set(k,e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
              ))}
              <div><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Target Country *</label>
                <select value={form.country} onChange={e=>set("country",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none"}}>
                  <option value="">Select Country...</option>
                  {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Country-Specific Fields */}
          {extraFields.length>0&&<div style={{background:"#13131a",border:"1px solid rgba(108,99,255,0.3)",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:6}}>🌍 {form.country}-Specific Fields</div>
            <div style={{fontSize:12,color:"#7878a0",marginBottom:16}}>These fields are important for {form.country} job applications and boost your ATS score.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {extraFields.map(f=>(
                <div key={f.key}><label style={{fontSize:11,color:"#a89fff",display:"block",marginBottom:5,textTransform:"uppercase"}}>{f.label}</label><input placeholder={f.placeholder} value={form[f.key]||""} onChange={e=>set(f.key,e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid rgba(108,99,255,0.3)",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
              ))}
            </div>
          </div>}

          {/* Target Role */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>Target Role</div>
            <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Target Job Title *</label><input placeholder="e.g. Accounting Supervisor" value={form.jobTitle} onChange={e=>set("jobTitle",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
            <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Professional Summary (optional)</label><textarea placeholder="Brief overview of your experience..." value={form.summary} onChange={e=>set("summary",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",minHeight:80,resize:"vertical",boxSizing:"border-box"}}/></div>
            <div><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Paste Job Description (for ATS optimization)</label><textarea placeholder="Paste the job description here to match keywords..." value={form.jobDescription} onChange={e=>set("jobDescription",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",minHeight:100,resize:"vertical",boxSizing:"border-box"}}/></div>
          </div>

          {/* Skills */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>Skills</div>
            <div style={{display:"flex",gap:10}}>
              <input placeholder="Add a skill and press Enter..." value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSkill()} style={{flex:1,background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none"}}/>
              <button onClick={addSkill} style={{background:"rgba(108,99,255,0.2)",border:"1px solid rgba(108,99,255,0.3)",color:"#6c63ff",borderRadius:8,padding:"0 20px",cursor:"pointer",fontSize:22}}>+</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
              {skills.map(s=><div key={s} style={{background:"rgba(108,99,255,0.12)",border:"1px solid rgba(108,99,255,0.25)",color:"#a89fff",padding:"5px 12px",borderRadius:100,fontSize:13,display:"flex",alignItems:"center",gap:6}}>{s}<button onClick={()=>setSkills(sk=>sk.filter(x=>x!==s))} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:15,padding:0}}>×</button></div>)}
            </div>
          </div>

          {/* Experience */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>Work Experience</div>
            {experiences.map((exp,i)=>(
              <div key={i} style={{background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:10,padding:16,marginBottom:10,position:"relative"}}>
                {experiences.length>1&&<button onClick={()=>setExperiences(ex=>ex.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:10,right:10,background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff6584",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:14}}>×</button>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
                  {[["Company","company","e.g. Emirates NBD"],["Role","role","Accounting Supervisor"],["Duration","duration","Jan 2020–Present"]].map(([l,k,p])=>(
                    <div key={k}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:4,textTransform:"uppercase"}}>{l}</label><input placeholder={p} value={exp[k]} onChange={e=>updateExp(i,k,e.target.value)} style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a3d",borderRadius:7,color:"#f0f0f8",fontFamily:"inherit",fontSize:13,padding:"8px 10px",outline:"none",boxSizing:"border-box"}}/></div>
                  ))}
                </div>
                <textarea placeholder="Key responsibilities and achievements..." value={exp.description} onChange={e=>updateExp(i,"description",e.target.value)} style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a3d",borderRadius:7,color:"#f0f0f8",fontFamily:"inherit",fontSize:13,padding:"8px 10px",outline:"none",minHeight:80,resize:"vertical",boxSizing:"border-box"}}/>
              </div>
            ))}
            <button onClick={()=>setExperiences(ex=>[...ex,{company:"",role:"",duration:"",description:""}])} style={{width:"100%",background:"transparent",border:"1px dashed #2a2a3d",color:"#7878a0",borderRadius:10,padding:11,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>+ Add Another Experience</button>
          </div>

          {/* Education */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>Education</div>
            {education.map((edu,i)=>(
              <div key={i} style={{background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:10,padding:16,marginBottom:10,position:"relative"}}>
                {education.length>1&&<button onClick={()=>setEducation(ed=>ed.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:10,right:10,background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff6584",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:14}}>×</button>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  {[["Institution","institution","e.g. University of Dubai"],["Degree","degree","B.Com Accounting"],["Year","year","2010–2014"]].map(([l,k,p])=>(
                    <div key={k}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:4,textTransform:"uppercase"}}>{l}</label><input placeholder={p} value={edu[k]} onChange={e=>updateEdu(i,k,e.target.value)} style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a3d",borderRadius:7,color:"#f0f0f8",fontFamily:"inherit",fontSize:13,padding:"8px 10px",outline:"none",boxSizing:"border-box"}}/></div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={()=>setEducation(ed=>[...ed,{institution:"",degree:"",year:""}])} style={{width:"100%",background:"transparent",border:"1px dashed #2a2a3d",color:"#7878a0",borderRadius:10,padding:11,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>+ Add Another Education</button>
          </div>

          <button onClick={generate} disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#6c63ff,#9b59f5)",border:"none",borderRadius:12,color:"#fff",fontFamily:"inherit",fontSize:16,fontWeight:700,padding:17,cursor:loading?"not-allowed":"pointer",opacity:loading?0.6:1,marginBottom:8}}>
            {loading?"⚙ Generating your resume...":"✦ Generate My ATS-Optimized Resume"}
          </button>

          {loading&&<div style={{textAlign:"center",padding:40}}><div style={{width:40,height:40,border:"3px solid #2a2a3d",borderTopColor:"#6c63ff",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/><p style={{color:"#7878a0"}}>Building your country-specific resume...</p></div>}

          {result&&<div style={{marginTop:28}}>

            {/* ATS Score Card */}
            <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
              <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap",marginBottom:20}}>
                <div style={{textAlign:"center",minWidth:90}}>
                  <div style={{fontSize:56,fontWeight:800,color:sc(result.ats.score),lineHeight:1}}>{result.ats.score}</div>
                  <div style={{fontSize:11,color:"#7878a0",marginTop:4}}>ATS SCORE</div>
                  <div style={{display:"inline-block",background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.2)",color:"#ffd700",fontSize:11,fontWeight:600,padding:"2px 10px",borderRadius:100,marginTop:6}}>{result.ats.rating}</div>
                </div>
                <div style={{flex:1,minWidth:200}}>
                  {[["Keyword Match",result.ats.keyword,"#6c63ff"],["Formatting",result.ats.formatting,"#43e97b"],["Readability",result.ats.readability,"#ffd700"],["Skills Coverage",result.ats.skills,"#ff6584"]].map(([l,v,c])=>(
                    <div key={l} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#7878a0",marginBottom:3}}><span>{l}</span><span>{v}%</span></div>
                      <div style={{height:5,background:"#2a2a3d",borderRadius:100}}><div style={{height:"100%",width:`${v}%`,background:c,borderRadius:100}}/></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Tips */}
              {result.ats.tips?.length>0&&<div style={{background:"#1c1c28",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#6c63ff",marginBottom:12}}>💡 How to Improve Your ATS Score</div>
                {result.ats.tips.map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{background:"rgba(108,99,255,0.2)",color:"#a89fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div>
                    <div style={{fontSize:13,color:"#f0f0f8",lineHeight:1.5}}>{t}</div>
                  </div>
                ))}
              </div>}

              {/* Missing Items */}
              {result.ats.missing?.length>0&&<div style={{background:"#1c1c28",border:"1px solid rgba(255,101,132,0.2)",borderRadius:12,padding:16}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#ff6584",marginBottom:12}}>⚠ Missing from Your Resume</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {result.ats.missing.map((m,i)=>(
                    <div key={i} style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.25)",color:"#ff9eb5",padding:"5px 12px",borderRadius:100,fontSize:12}}>✗ {m}</div>
                  ))}
                </div>
              </div>}
            </div>

            {/* Resume Output */}
            <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h2 style={{margin:0,fontSize:18,fontWeight:700}}>📄 Your Resume — {form.country}</h2>
                <button onClick={()=>{navigator.clipboard.writeText(result.resume);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"rgba(67,233,123,0.1)",border:"1px solid rgba(67,233,123,0.25)",color:"#43e97b",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>{copied?"✓ Copied!":"⎘ Copy Resume"}</button>
              </div>
              <pre style={{background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:10,padding:20,fontSize:13,lineHeight:1.8,color:"#f0f0f8",whiteSpace:"pre-wrap",margin:0,fontFamily:"inherit",minHeight:200}}>{result.resume}</pre>
            </div>
          </div>}
        </>}

        {/* ATS Checker Tab */}
        {tab==="ats"&&<div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:16}}>ATS Score Checker</div>
          <p style={{color:"#7878a0",fontSize:14,marginBottom:18}}>Paste your existing resume and job description to get an instant ATS score with specific improvement tips.</p>
          <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Your Resume Text</label><textarea rows={8} placeholder="Paste your resume here..." value={atsResumeText} onChange={e=>setAtsResumeText(e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>
          <div style={{marginBottom:18}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Job Description</label><textarea rows={5} placeholder="Paste the job description..." value={atsJobDesc} onChange={e=>setAtsJobDesc(e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>
          <button onClick={analyzeATS} disabled={atsLoading||!atsResumeText.trim()||!atsJobDesc.trim()} style={{width:"100%",background:"linear-gradient(135deg,#6c63ff,#9b59f5)",border:"none",borderRadius:12,color:"#fff",fontFamily:"inherit",fontSize:16,fontWeight:700,padding:17,cursor:"pointer",opacity:atsLoading?0.6:1}}>
            {atsLoading?"⚙ Analyzing...":"◎ Analyze ATS Score"}
          </button>

          {atsResult&&<div style={{marginTop:24}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:64,fontWeight:800,color:sc(atsResult.overall)}}>{atsResult.overall}</div>
              <div style={{fontSize:12,color:"#7878a0",marginBottom:8}}>ATS SCORE</div>
              <div style={{display:"inline-block",background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.2)",color:"#ffd700",fontSize:12,fontWeight:600,padding:"3px 12px",borderRadius:100}}>{atsResult.rating}</div>
            </div>
            {[["Keyword Match",atsResult.keyword,"#6c63ff"],["Formatting",atsResult.formatting,"#43e97b"],["Readability",atsResult.readability,"#ffd700"],["Skills",atsResult.skills,"#ff6584"]].map(([l,v,c])=>(
              <div key={l} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#7878a0",marginBottom:3}}><span>{l}</span><span>{v}%</span></div>
                <div style={{height:5,background:"#2a2a3d",borderRadius:100}}><div style={{height:"100%",width:`${v}%`,background:c,borderRadius:100}}/></div>
              </div>
            ))}
            {atsResult.tips?.length>0&&<div style={{background:"#1c1c28",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:16,marginTop:16}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:"#6c63ff",marginBottom:12}}>💡 Improvement Tips</div>
              {atsResult.tips.map((t,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
                  <div style={{background:"rgba(108,99,255,0.2)",color:"#a89fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:13,color:"#f0f0f8",lineHeight:1.5}}>{t}</div>
                </div>
              ))}
            </div>}
            {atsResult.missing_keywords?.length>0&&<div style={{marginTop:12}}>
              <div style={{fontSize:11,color:"#ff6584",marginBottom:8,textTransform:"uppercase",fontWeight:700}}>Missing Keywords</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{atsResult.missing_keywords.map(k=><div key={k} style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff9eb5",padding:"4px 10px",borderRadius:100,fontSize:12}}>{k}</div>)}</div>
            </div>}
          </div>}
        </div>}

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
