import { useState } from "react";

const COUNTRIES = ["United States","United Kingdom","India","Canada","Australia","Germany","France","UAE","Singapore","South Africa","Nigeria","Brazil","Japan","South Korea","Netherlands","Sweden","New Zealand","Malaysia","Philippines","Kenya","Pakistan","Bangladesh","Sri Lanka","Ireland","Italy","Spain","Portugal","Poland","Mexico","Argentina"];

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
  const [form, setForm] = useState({ fullName:"",email:"",phone:"",country:"",city:"",linkedIn:"",jobTitle:"",summary:"",jobDescription:"" });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [experiences, setExperiences] = useState([{company:"",role:"",duration:"",description:""}]);
  const [education, setEducation] = useState([{institution:"",degree:"",year:""}]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const addSkill = () => { if(skillInput.trim()&&!skills.includes(skillInput.trim())){setSkills(s=>[...s,skillInput.trim()]);setSkillInput("");} };
  const updateExp = (i,k,v) => setExperiences(ex=>ex.map((e,idx)=>idx===i?{...e,[k]:v}:e));
  const updateEdu = (i,k,v) => setEducation(ed=>ed.map((e,idx)=>idx===i?{...e,[k]:v}:e));

  const generate = async () => {
    if(!form.fullName||!form.country||!form.jobTitle){setError("Please fill Name, Country, and Job Title.");return;}
    setError("");setLoading(true);setResult(null);
    try {
      const prompt = `Write a short professional resume for ${form.country}. Name:${form.fullName} Email:${form.email} Phone:${form.phone} City:${form.city} Role:${form.jobTitle} Skills:${skills.join(",")} Exp:${experiences.map(e=>`${e.role} at ${e.company} ${e.duration}: ${e.description}`).join(";")} Edu:${education.map(e=>`${e.degree} ${e.institution} ${e.year}`).join(";")}. After resume write ATSCORE: and a number 1-100.`;
      const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const text = data?.content?.[0]?.text || "";
      let score = 72;
      const scoreMatch = text.match(/ATSCORE:\s*(\d+)/);
      if(scoreMatch) score = parseInt(scoreMatch[1]);
      const resumeText = text.replace(/ATSCORE:\s*\d+/,"").trim();
      setResult({resume: resumeText, score});
    } catch(e){setError("Error: "+e.message);}
    setLoading(false);
  };

  const analyzeATS = async () => {
    setAtsLoading(true);setAtsResult(null);
    try {
      const prompt = `Score this resume vs job description. Reply with ONLY: SCORE:85 KEYWORD:80 FORMAT:90 READ:85 SKILLS:82 TIPS: tip1|tip2|tip3 MISSING: kw1|kw2\nRESUME:${atsResumeText}\nJOB:${atsJobDesc}`;
      const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const text = data?.content?.[0]?.text || "";
      const g = (k) => { const m=text.match(new RegExp(k+":(\\d+)")); return m?parseInt(m[1]):70; };
      const tips = (text.match(/TIPS:\s*(.+?)(?:MISSING:|$)/s)||["",""])[1].trim().split("|").filter(Boolean);
      const missing = (text.match(/MISSING:\s*(.+?)$/s)||["",""])[1].trim().split("|").filter(Boolean);
      setAtsResult({overall:g("SCORE"),keyword:g("KEYWORD"),formatting:g("FORMAT"),readability:g("READ"),skills:g("SKILLS"),rating:g("SCORE")>=80?"Excellent":g("SCORE")>=60?"Good":"Needs Work",tips,missing_keywords:missing});
    } catch{}
    setAtsLoading(false);
  };

  const sc = (s) => s>=80?"#43e97b":s>=60?"#ffd700":"#ff6584";

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0a0a0f",minHeight:"100vh",color:"#f0f0f8",padding:"20px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",padding:"40px 0 32px"}}>
          <div style={{display:"inline-block",background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",color:"#a89fff",fontSize:12,padding:"4px 14px",borderRadius:100,marginBottom:16}}>🌍 AI-POWERED · GLOBAL · ATS-READY</div>
          <h1 style={{fontSize:"clamp(28px,6vw,52px)",fontWeight:800,background:"linear-gradient(135deg,#fff 30%,#a89fff 70%,#ff6584 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 12px"}}>ResumeForge AI</h1>
          <p style={{color:"#7878a0",fontSize:16,margin:0}}>Build country-specific, ATS-optimized resumes for any job, anywhere.</p>
        </div>

        <div style={{display:"flex",gap:6,background:"#13131a",border:"1px solid #2a2a3d",borderRadius:12,padding:5,maxWidth:380,margin:"0 auto 32px"}}>
          {["builder","ats"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 16px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:500,background:tab===t?"#6c63ff":"transparent",color:tab===t?"#fff":"#7878a0"}}>
              {t==="builder"?"✦ Build Resume":"◎ ATS Checker"}
            </button>
          ))}
        </div>

        {tab==="builder"&&<>
          {error&&<div style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff6584",borderRadius:10,padding:"12px 16px",marginBottom:16}}>⚠ {error}</div>}

          {[{title:"Personal Information",content:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[["Full Name *","fullName","Mohammed Asif"],["Email","email","email@example.com"],["Phone","phone","+971 50 123 4567"],["City","city","Dubai"],["LinkedIn","linkedIn","linkedin.com/in/yourname"]].map(([l,k,p])=>(
              <div key={k}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>{l}</label><input placeholder={p} value={form[k]} onChange={e=>set(k,e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
            ))}
            <div><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Target Country *</label>
              <select value={form.country} onChange={e=>set("country",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none"}}>
                <option value="">Select Country...</option>
                {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>},
          {title:"Target Role",content:<>
            <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Target Job Title *</label><input placeholder="e.g. Accounting Supervisor" value={form.jobTitle} onChange={e=>set("jobTitle",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
            <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Professional Summary</label><textarea placeholder="Brief overview..." value={form.summary} onChange={e=>set("summary",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",minHeight:80,resize:"vertical",boxSizing:"border-box"}}/></div>
            <div><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Paste Job Description (for ATS)</label><textarea placeholder="Paste job description..." value={form.jobDescription} onChange={e=>set("jobDescription",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",minHeight:100,resize:"vertical",boxSizing:"border-box"}}/></div>
          </>},
          {title:"Skills",content:<>
            <div style={{display:"flex",gap:10}}>
              <input placeholder="Add a skill..." value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSkill()} style={{flex:1,background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none"}}/>
              <button onClick={addSkill} style={{background:"rgba(108,99,255,0.2)",border:"1px solid rgba(108,99,255,0.3)",color:"#6c63ff",borderRadius:8,padding:"0 20px",cursor:"pointer",fontSize:22}}>+</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
              {skills.map(s=><div key={s} style={{background:"rgba(108,99,255,0.12)",border:"1px solid rgba(108,99,255,0.25)",color:"#a89fff",padding:"5px 12px",borderRadius:100,fontSize:13,display:"flex",alignItems:"center",gap:6}}>{s}<button onClick={()=>setSkills(sk=>sk.filter(x=>x!==s))} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:15,padding:0}}>×</button></div>)}
            </div>
          </>}].map(({title,content})=>(
            <div key={title} style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>{title}</div>
              {content}
            </div>
          ))}

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
                <textarea placeholder="Key responsibilities and achievements..." value={exp.description} onChange={e=>updateExp(i,"description",e.target.value)} style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a3d",borderRadius:7,color:"#f0f0f8",fontFamily:"inherit",fontSize:13,padding:"8px 10px",outline:"none",minHeight:70,resize:"vertical",boxSizing:"border-box"}}/>
              </div>
            ))}
            <button onClick={()=>setExperiences(ex=>[...ex,{company:"",role:"",duration:"",description:""}])} style={{width:"100%",background:"transparent",border:"1px dashed #2a2a3d",color:"#7878a0",borderRadius:10,padding:11,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>+ Add Another Experience</button>
          </div>

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

          {loading&&<div style={{textAlign:"center",padding:40}}><div style={{width:40,height:40,border:"3px solid #2a2a3d",borderTopColor:"#6c63ff",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/><p style={{color:"#7878a0"}}>Building your resume... (may take 10-15 seconds)</p></div>}

          {result&&<div style={{marginTop:28}}>
            <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:20,display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{textAlign:"center",minWidth:90}}>
                <div style={{fontSize:48,fontWeight:800,color:sc(result.score),lineHeight:1}}>{result.score}</div>
                <div style={{fontSize:11,color:"#7878a0",marginTop:4}}>ATS SCORE</div>
              </div>
              <div style={{flex:1,minWidth:180}}>
                <div style={{fontSize:13,color:"#a89fff",marginBottom:8}}>Your resume has been generated and optimized for {form.country}!</div>
                <div style={{fontSize:12,color:"#7878a0"}}>Copy your resume below and paste into Word or Google Docs for final formatting.</div>
              </div>
            </div>
            <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h2 style={{margin:0,fontSize:18,fontWeight:700}}>📄 Your Resume</h2>
                <button onClick={()=>{navigator.clipboard.writeText(result.resume);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"rgba(67,233,123,0.1)",border:"1px solid rgba(67,233,123,0.25)",color:"#43e97b",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>{copied?"✓ Copied!":"⎘ Copy"}</button>
              </div>
              <pre style={{background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:10,padding:20,fontSize:13,lineHeight:1.8,color:"#f0f0f8",whiteSpace:"pre-wrap",margin:0,fontFamily:"inherit",minHeight:200}}>{result.resume}</pre>
            </div>
          </div>}
        </>}

        {tab==="ats"&&<div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:16}}>ATS Score Checker</div>
          <p style={{color:"#7878a0",fontSize:14,marginBottom:18}}>Paste your resume and job description to get an instant ATS score.</p>
          <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Your Resume Text</label><textarea rows={8} placeholder="Paste your resume here..." value={atsResumeText} onChange={e=>setAtsResumeText(e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>
          <div style={{marginBottom:18}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Job Description</label><textarea rows={5} placeholder="Paste the job description..." value={atsJobDesc} onChange={e=>setAtsJobDesc(e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>
          <button onClick={analyzeATS} disabled={atsLoading||!atsResumeText.trim()||!atsJobDesc.trim()} style={{width:"100%",background:"linear-gradient(135deg,#6c63ff,#9b59f5)",border:"none",borderRadius:12,color:"#fff",fontFamily:"inherit",fontSize:16,fontWeight:700,padding:17,cursor:"pointer",opacity:atsLoading?0.6:1}}>
            {atsLoading?"⚙ Analyzing...":"◎ Analyze ATS Score"}
          </button>
          {atsResult&&<div style={{marginTop:24,textAlign:"center"}}>
            <div style={{fontSize:64,fontWeight:800,color:sc(atsResult.overall)}}>{atsResult.overall}</div>
            <div style={{fontSize:12,color:"#7878a0",marginBottom:20}}>ATS SCORE</div>
            {[["Keyword",atsResult.keyword,"#6c63ff"],["Formatting",atsResult.formatting,"#43e97b"],["Readability",atsResult.readability,"#ffd700"],["Skills",atsResult.skills,"#ff6584"]].map(([l,v,c])=>(
              <div key={l} style={{marginBottom:8,textAlign:"left"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#7878a0",marginBottom:3}}><span>{l}</span><span>{v}%</span></div>
                <div style={{height:5,background:"#2a2a3d",borderRadius:100}}><div style={{height:"100%",width:`${v}%`,background:c,borderRadius:100}}/></div>
              </div>
            ))}
            {atsResult.tips?.length>0&&<div style={{textAlign:"left",marginTop:16}}>{atsResult.tips.map((t,i)=><div key={i} style={{fontSize:13,color:"#a89fff",marginBottom:6,paddingLeft:10,borderLeft:"2px solid #6c63ff"}}>▸ {t}</div>)}</div>}
            {atsResult.missing_keywords?.length>0&&<div style={{textAlign:"left",marginTop:16}}>
              <div style={{fontSize:11,color:"#ff6584",marginBottom:8,textTransform:"uppercase"}}>Missing Keywords</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{atsResult.missing_keywords.map(k=><div key={k} style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff9eb5",padding:"4px 10px",borderRadius:100,fontSize:12}}>{k}</div>)}</div>
            </div>}
          </div>}
        </div>}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
