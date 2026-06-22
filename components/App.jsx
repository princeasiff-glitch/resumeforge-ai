import { useState, useEffect } from "react";
import ResumePdfDocument from "../lib/ResumePdfDocument";
import CoverLetterPdfDocument from "../lib/CoverLetterPdfDocument";
import { getTemplateForCountry } from "../lib/templateConfig";

const COUNTRIES = ["United States","United Kingdom","India","Canada","Australia","Germany","France","UAE","Singapore","South Africa","Nigeria","Brazil","Japan","South Korea","Netherlands","Sweden","New Zealand","Malaysia","Philippines","Kenya","Pakistan","Bangladesh","Sri Lanka","Ireland","Italy","Spain","Portugal","Poland","Mexico","Argentina"];

const COUNTRY_FIELDS = {
  "UAE":[{key:"nationality",label:"Nationality",placeholder:""},{key:"visaStatus",label:"Visa Status",placeholder:""},{key:"languages",label:"Languages Known",placeholder:""}],
  "United Kingdom":[{key:"rightToWork",label:"Right to Work",placeholder:""},{key:"languages",label:"Languages",placeholder:""}],
  "Australia":[{key:"rightToWork",label:"Work Rights",placeholder:""},{key:"languages",label:"Languages",placeholder:""}],
  "Canada":[{key:"rightToWork",label:"Work Authorization",placeholder:""},{key:"languages",label:"Languages",placeholder:""}],
  "United States":[{key:"rightToWork",label:"Work Authorization",placeholder:""},{key:"languages",label:"Languages",placeholder:""}],
  "Germany":[{key:"rightToWork",label:"Work Permit",placeholder:""},{key:"languages",label:"Languages",placeholder:""}],
  "Singapore":[{key:"rightToWork",label:"Work Pass",placeholder:""},{key:"languages",label:"Languages",placeholder:""}],
};

const COUNTRY_PHONE = {
  "UAE":"+971","United States":"+1","United Kingdom":"+44","India":"+91",
  "Canada":"+1","Australia":"+61","Germany":"+49","France":"+33",
  "Singapore":"+65","South Africa":"+27","Nigeria":"+234","Brazil":"+55",
  "Japan":"+81","South Korea":"+82","Netherlands":"+31","Sweden":"+46",
  "New Zealand":"+64","Malaysia":"+60","Philippines":"+63","Kenya":"+254",
  "Pakistan":"+92","Bangladesh":"+880","Sri Lanka":"+94","Ireland":"+353",
  "Italy":"+39","Spain":"+34","Portugal":"+351","Poland":"+48",
  "Mexico":"+52","Argentina":"+54"
};

const SUPPORT_EMAIL = "resumeforgeai.support@gmail.com";
const FREE_LIMIT = 2;

const HOW_TO_STEPS = [
  { title: "Enter Your Personal Details", desc: "Fill in your full name, email, phone, city and LinkedIn URL. Select your current country so the phone code auto-fills correctly." },
  { title: "Select Your Target Country", desc: "Choose the country where you want to work. This is the most important step — the AI tailors your resume format, language and conventions specifically for that country." },
  { title: "Fill Your Target Role & Experience", desc: "Enter your job title, add your skills one by one, then fill in your actual work experience and education. The more detail you provide, the better your resume will be." },
  { title: "Paste a Job Description (Recommended)", desc: "Pasting the job description you're applying for boosts your ATS score by 15-20 points by matching keywords automatically." },
  { title: "Generate Your Resume", desc: "Click \"Generate My ATS-Optimized Resume\" and wait 10-20 seconds. Your resume and ATS score will appear below." },
  { title: "Download, Copy or Email", desc: "Copy the resume text, download it as a styled PDF, or email it directly to yourself. You can also generate a matching Cover Letter with one click!" },
];

const FAQS = [
  { q: "Is my personal data safe?", a: "Yes — your data is stored only in your browser (localStorage) and is never shared or sold. We use it solely to generate your resume." },
  { q: "Which countries are supported?", a: "We support 30+ countries including UAE, India, USA, UK, Canada, Australia, Germany, Singapore, South Africa and more. Each country gets a tailored resume format." },
  { q: "What is an ATS score?", a: "ATS stands for Applicant Tracking System — software used by employers to filter resumes. Our AI scores your resume on keyword match, formatting, readability and skills coverage so you know how likely it is to pass automated screening." },
  { q: "What's the difference between Free and Pro?", a: "Free gives you 2 resumes to try the app. Pro (₹299/month or ₹2999 lifetime) gives you unlimited resumes, unlimited cover letters, full ATS analysis and priority support." },
  { q: "Can I generate resumes for different countries?", a: "Yes! Each time you generate a resume you can select a different target country. The AI adjusts the layout, language and format accordingly." },
  { q: "How accurate is the ATS score?", a: "Our ATS score is AI-generated and gives a strong indication of how well your resume matches the job description. It's not a guarantee but is a reliable guide for improvement." },
  { q: "Can I edit the resume after generating?", a: "Yes — copy the resume text and paste it into Microsoft Word or Google Docs for final editing and formatting." },
  { q: "What payment methods are accepted?", a: "Indian users can pay via UPI (GPay, PhonePe, Paytm), Credit/Debit cards and Net Banking. International users can pay via Credit/Debit cards. All payments are secured by Razorpay." },
  { q: "I have a coupon code — where do I enter it?", a: "When the email popup appears, click the small \"Have a coupon code?\" link below the email field to reveal the coupon entry box." },
  { q: "How do I get my resume emailed to me?", a: "After generating your resume, click the \"📧 Email Me This Resume\" button. Your resume will be sent to the email address you provided." },
];

export default function App() {
  const [tab, setTab] = useState("builder");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsResumeText, setAtsResumeText] = useState("");
  const [atsJobDesc, setAtsJobDesc] = useState("");
  const [form, setForm] = useState({fullName:"",email:"",phone:"",country:"",currentLocation:"",city:"",linkedIn:"",jobTitle:"",summary:"",jobDescription:"",nationality:"",visaStatus:"",languages:"",rightToWork:""});
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [experiences, setExperiences] = useState([{company:"",role:"",duration:"",description:""}]);
  const [education, setEducation] = useState([{institution:"",degree:"",year:""}]);

  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [trackingEmail, setTrackingEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resumesRemaining, setResumesRemaining] = useState(FREE_LIMIT);
  const [limitReached, setLimitReached] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const [showCouponField, setShowCouponField] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [coverLetter, setCoverLetter] = useState(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [coverLetterCopied, setCoverLetterCopied] = useState(false);

  const [showHowTo, setShowHowTo] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("resumeforge_result");
      const savedForm = localStorage.getItem("resumeforge_form");
      const savedSkills = localStorage.getItem("resumeforge_skills");
      const savedExp = localStorage.getItem("resumeforge_experiences");
      const savedEdu = localStorage.getItem("resumeforge_education");
      const savedEmail = localStorage.getItem("resumeforge_email");
      const savedRemaining = localStorage.getItem("resumeforge_remaining");
      const savedLimit = localStorage.getItem("resumeforge_limit");
      const savedUnlimited = localStorage.getItem("resumeforge_unlimited");
      if(saved) setResult(JSON.parse(saved));
      if(savedForm) setForm(JSON.parse(savedForm));
      if(savedSkills) setSkills(JSON.parse(savedSkills));
      if(savedExp) setExperiences(JSON.parse(savedExp));
      if(savedEdu) setEducation(JSON.parse(savedEdu));
      if(savedEmail) setTrackingEmail(savedEmail);
      if(savedRemaining) setResumesRemaining(parseInt(savedRemaining));
      if(savedLimit === "true") setLimitReached(true);
      if(savedUnlimited === "true") setIsUnlimited(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("resumeforge_form", JSON.stringify(form));
      localStorage.setItem("resumeforge_skills", JSON.stringify(skills));
      localStorage.setItem("resumeforge_experiences", JSON.stringify(experiences));
      localStorage.setItem("resumeforge_education", JSON.stringify(education));
    } catch {}
  }, [form, skills, experiences, education]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const addSkill = () => { if(skillInput.trim()&&!skills.includes(skillInput.trim())){setSkills(s=>[...s,skillInput.trim()]);setSkillInput("");} };
  const updateExp = (i,k,v) => setExperiences(ex=>ex.map((e,idx)=>idx===i?{...e,[k]:v}:e));
  const updateEdu = (i,k,v) => setEducation(ed=>ed.map((e,idx)=>idx===i?{...e,[k]:v}:e));
  const extraFields = COUNTRY_FIELDS[form.country] || [];
  const currentPhoneCode = form.currentLocation ? (COUNTRY_PHONE[form.currentLocation] || "") : "";

  const clearAll = () => {
    setForm({fullName:"",email:"",phone:"",country:"",currentLocation:"",city:"",linkedIn:"",jobTitle:"",summary:"",jobDescription:"",nationality:"",visaStatus:"",languages:"",rightToWork:""});
    setSkills([]);
    setExperiences([{company:"",role:"",duration:"",description:""}]);
    setEducation([{institution:"",degree:"",year:""}]);
    setResult(null);
    setCoverLetter(null);
    try {
      localStorage.removeItem("resumeforge_result");
      localStorage.removeItem("resumeforge_form");
      localStorage.removeItem("resumeforge_skills");
      localStorage.removeItem("resumeforge_experiences");
      localStorage.removeItem("resumeforge_education");
    } catch {}
  };

  const handleGenerateClick = () => {
    if(!form.fullName||!form.country||!form.jobTitle){ setError("Please fill Name, Target Country, and Job Title."); return; }
    if(isUnlimited){ generate(trackingEmail); return; }
    if(limitReached){ setShowEmailPopup(true); return; }
    if(!trackingEmail){ setShowEmailPopup(true); return; }
    generate(trackingEmail);
  };

  const handleEmailSubmit = async () => {
    if(!trackingEmail||!trackingEmail.includes('@')){ setEmailError("Please enter a valid email address"); return; }
    setEmailError("");
    try {
      const res = await fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:trackingEmail})});
      const data = await res.json();
      if(!data.allowed&&!data.couponApplied){
        setLimitReached(true); setResumesRemaining(0);
        try{localStorage.setItem("resumeforge_email",trackingEmail);localStorage.setItem("resumeforge_remaining","0");localStorage.setItem("resumeforge_limit","true");}catch{}
        return;
      }
      const remaining = data.remaining||0;
      setResumesRemaining(remaining);
      try{localStorage.setItem("resumeforge_email",trackingEmail);localStorage.setItem("resumeforge_remaining",remaining.toString());localStorage.setItem("resumeforge_limit","false");}catch{}
      setShowEmailPopup(false);
      generate(trackingEmail);
    }catch{setShowEmailPopup(false);generate(trackingEmail);}
  };

  const handleCouponApply = async () => {
    if(!couponCode.trim()){setCouponError("Please enter a coupon code");return;}
    if(!trackingEmail||!trackingEmail.includes('@')){setCouponError("Please enter your email first");return;}
    setCouponError("");setCouponSuccess("");setApplyingCoupon(true);
    try {
      const res = await fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:trackingEmail,couponCode:couponCode.trim()})});
      const data = await res.json();
      if(data.couponError){setCouponError(data.couponError);setApplyingCoupon(false);return;}
      if(data.couponApplied){
        if(data.couponType==="unlimited"){setIsUnlimited(true);setLimitReached(false);setResumesRemaining(999);setCouponSuccess("🎉 Unlimited access granted!");try{localStorage.setItem("resumeforge_unlimited","true");localStorage.setItem("resumeforge_limit","false");localStorage.setItem("resumeforge_email",trackingEmail);}catch{}setTimeout(()=>{setShowEmailPopup(false);generate(trackingEmail);},1500);}
        if(data.couponType==="free_resumes"){setResumesRemaining(data.remaining);setLimitReached(false);setCouponSuccess(`🎉 ${data.message}`);try{localStorage.setItem("resumeforge_remaining",data.remaining.toString());localStorage.setItem("resumeforge_limit","false");localStorage.setItem("resumeforge_email",trackingEmail);}catch{}setTimeout(()=>{setShowEmailPopup(false);generate(trackingEmail);},1500);}
        if(data.couponType==="discount"){setCouponSuccess(`🎉 ${data.discountPercent}% discount applied! Redirecting to pricing...`);setTimeout(()=>{window.location.href=`/pricing?discount=${data.discountPercent}&coupon=${couponCode}`;},1500);}
      }
    }catch{setCouponError("Something went wrong. Please try again.");}
    setApplyingCoupon(false);
  };

  const generate = async (email) => {
    setError("");setLoading(true);setResult(null);setCoverLetter(null);setShowEmailPopup(false);
    if(!isUnlimited&&email&&resumesRemaining>0){
      try{
        const res = await fetch("/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
        const data = await res.json();
        if(data.remaining!==undefined){setResumesRemaining(data.remaining);try{localStorage.setItem("resumeforge_remaining",data.remaining.toString());}catch{}}
        if(!data.allowed&&!isUnlimited){setLimitReached(true);setLoading(false);setShowEmailPopup(true);return;}
      }catch{}
    }
    try{
      const countryExtra = extraFields.map(f=>`${f.label}: ${form[f.key]||"Not specified"}`).join("\n");
      const prompt = `Write a polished professional resume for ${form.country} job market. Follow exact resume conventions for ${form.country}.

IMPORTANT: Use EXACTLY the information provided by the candidate. Do NOT change, invent or modify any details about their experience, roles, responsibilities or achievements. Only make the language more polished and professional.

CANDIDATE DETAILS:
Name: ${form.fullName}
Email: ${email||form.email}
Phone: ${form.phone}
City: ${form.city}${form.currentLocation&&form.currentLocation!==form.country?` (Currently in ${form.currentLocation}, Relocating to ${form.country})`:""}
LinkedIn: ${form.linkedIn||"Not provided"}
Target Role: ${form.jobTitle}
Skills: ${skills.join(", ")||"Not specified"}
${countryExtra}

WORK EXPERIENCE (use exactly as provided, only polish the language):
${experiences.map(e=>`Role: ${e.role}\nCompany: ${e.company}\nDuration: ${e.duration}\nDetails: ${e.description}`).join("\n\n")}

EDUCATION:
${education.map(e=>`${e.degree} | ${e.institution} | ${e.year}`).join("\n")}

PROFESSIONAL SUMMARY: ${form.summary||"Generate a strong professional summary based ONLY on the experience details provided above"}

JOB DESCRIPTION TO MATCH FOR ATS:
${form.jobDescription||"General professional role"}

STRICT FORMATTING RULES:
1. NO hashtags (#) anywhere
2. NO asterisks (* or **) anywhere
3. Use UPPERCASE PLAIN TEXT for section headings only
4. Use plain hyphen (-) for bullet points
5. Do NOT mention work rights or sponsorship in Professional Summary
6. Only mention work rights in a separate section at the bottom
7. Phone number in resume should use exact number: ${form.phone}
8. Use realistic date format: Month Year – Month Year
9. Separate sections with one blank line only
10. NEVER invent or add experience/skills/achievements not provided

After the complete resume write exactly:
---ATS_DATA---
Then ONLY this JSON:
{"score":85,"keyword":80,"formatting":90,"readability":87,"skills":82,"rating":"Good","tips":["tip1","tip2","tip3","tip4"],"missing":["item1","item2","item3"]}`;

      const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      let resumeText = data?.text||"";
      let ats = {score:72,keyword:68,formatting:85,readability:78,skills:70,rating:"Good",tips:[],missing:[]};
      if(data.ats){ats={...ats,...data.ats};}
      else if(resumeText.includes("---ATS_DATA---")){
        const parts = resumeText.split("---ATS_DATA---");
        resumeText = parts[0].trim();
        try{const jsonStr=parts[1].replace(/```json|```/g,"").trim();ats={...ats,...JSON.parse(jsonStr)};}catch{}
      }
      if(!resumeText||resumeText.length<50) resumeText=data?.text||"No resume generated. Please try again.";
      const newResult={resume:resumeText,ats};
      setResult(newResult);
      try{localStorage.setItem("resumeforge_result",JSON.stringify(newResult));}catch{}
    }catch(e){setError("Error: "+e.message);}
    setLoading(false);
  };

  const analyzeATS = async () => {
    setAtsLoading(true);setAtsResult(null);
    try{
      const prompt = `You are an ATS expert. Analyze this resume against the job description carefully.
Return ONLY a JSON object with no other text:
{"overall":85,"keyword":80,"formatting":90,"readability":88,"skills":82,"rating":"Good","tips":["specific tip 1","specific tip 2","specific tip 3"],"missing_keywords":["keyword1","keyword2","keyword3"]}

RESUME:
${atsResumeText}

JOB DESCRIPTION:
${atsJobDesc}`;
      const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      if(data.ats){setAtsResult({overall:data.ats.score||data.ats.overall||70,...data.ats});}
      else{
        const text=data?.text||"{}";
        try{const clean=text.replace(/```json|```/g,"").trim();const jsonMatch=clean.match(/\{[\s\S]*\}/);if(jsonMatch)setAtsResult(JSON.parse(jsonMatch[0]));else throw new Error("No JSON");}
        catch{setAtsResult({overall:70,keyword:65,formatting:80,readability:75,skills:68,rating:"Needs Improvement",tips:["Add more keywords from job description","Use standard section headings","Quantify achievements with numbers"],missing_keywords:[]});}
      }
    }catch{}
    setAtsLoading(false);
  };

  const downloadResumePdf = async () => {
    try{
      const{pdf}=await import("@react-pdf/renderer");
      const templateStyle=getTemplateForCountry(form.country);
      const candidate={fullName:form.fullName,email:form.email||trackingEmail,phone:form.phone,city:form.city,linkedIn:form.linkedIn,jobTitle:form.jobTitle};
      const doc=(<ResumePdfDocument resumeText={result.resume} candidate={candidate} templateStyle={templateStyle}/>);
      const blob=await pdf(doc).toBlob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=`${(form.fullName||"Resume").replace(/\s+/g,"_")}_Resume.pdf`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    }catch(e){alert("Failed to generate PDF. Please try copying the resume instead.");}
  };

  const generateCoverLetter = async () => {
    setCoverLetterLoading(true);setCoverLetter(null);
    try{
      const prompt = `Write a professional cover letter for the following candidate applying for a job in ${form.country}.

CANDIDATE DETAILS:
Name: ${form.fullName}
Target Role: ${form.jobTitle}
City: ${form.city}
Email: ${form.email||trackingEmail}

THEIR RESUME SUMMARY:
${result.resume.slice(0,1500)}

JOB DESCRIPTION:
${form.jobDescription||"General professional role in "+form.country}

COVER LETTER RULES:
1. Follow ${form.country} cover letter conventions exactly
2. Start directly with "Dear Hiring Manager," — no header, no address, no date before it
3. 3-4 paragraphs maximum — opening, skills/experience, why this company, closing
4. Professional but warm tone
5. End with "Sincerely," followed by the candidate name ONCE only
6. Do NOT use asterisks, hashtags or markdown
7. Keep it to one page
8. Reference actual details from the resume — do not invent anything
9. For Gulf/Middle East: more formal tone, mention visa status if provided
10. For UK: slightly more formal than US style
11. Do NOT include date, address, email, phone or name at the top — header is added automatically
12. Do NOT write "Hiring Manager" anywhere — it is added automatically
13. Do NOT write the candidate name before "Sincerely," — only write it ONCE after "Sincerely,"
14. The ONLY acceptable ending is exactly: "Sincerely," on one line then "${form.fullName}" on the next line — nothing else after that`;

      const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const text=data?.text||"";
      if(text.length>50){setCoverLetter(text);}
      else{alert("Could not generate cover letter. Please try again.");}
    }catch(e){alert("Error generating cover letter: "+e.message);}
    setCoverLetterLoading(false);
  };

  const downloadCoverLetterPdf = async () => {
    try{
      const{pdf}=await import("@react-pdf/renderer");
      const templateStyle=getTemplateForCountry(form.country);
      const candidate={fullName:form.fullName,email:form.email||trackingEmail,phone:form.phone,city:form.city,linkedIn:form.linkedIn,jobTitle:form.jobTitle};
      const doc=(<CoverLetterPdfDocument coverLetterText={coverLetter} candidate={candidate} templateStyle={templateStyle}/>);
      const blob=await pdf(doc).toBlob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=`${(form.fullName||"Cover_Letter").replace(/\s+/g,"_")}_Cover_Letter.pdf`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
    }catch(e){alert("Failed to generate PDF. Please try copying the cover letter instead.");}
  };

  const sendResumeEmail = async () => {
    const emailToUse=trackingEmail||form.email;
    if(!emailToUse||!emailToUse.includes('@')){alert("No email found. Please enter your email first.");return;}
    setEmailSending(true);
    try{
      const res=await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:emailToUse,name:form.fullName,resumeText:result.resume,atsScore:result.ats.score,country:form.country})});
      const data=await res.json();
      if(data.success){setEmailSent(true);setTimeout(()=>setEmailSent(false),4000);}
      else{alert("Failed to send email. Please try copying the resume instead.");}
    }catch{alert("Failed to send email. Please try copying the resume instead.");}
    setEmailSending(false);
  };

  const sc=(s)=>s>=80?"#43e97b":s>=60?"#ffd700":"#ff6584";

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0a0a0f",minHeight:"100vh",color:"#f0f0f8",padding:"20px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>

        {showEmailPopup&&(
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
            <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:20,padding:32,maxWidth:460,width:"100%"}}>
              {limitReached&&!couponSuccess?(
                <>
                  <div style={{textAlign:"center",marginBottom:24}}>
                    <div style={{fontSize:48,marginBottom:12}}>🔒</div>
                    <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 8px",color:"#f0f0f8"}}>Free Limit Reached!</h2>
                    <p style={{color:"#7878a0",fontSize:14,lineHeight:1.6,margin:0}}>You've used your {FREE_LIMIT} free resumes. Upgrade to Pro or enter a coupon code!</p>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                    <a href="/pricing" style={{background:"linear-gradient(135deg,#6c63ff,#9b59f5)",borderRadius:12,color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:700,padding:"14px",cursor:"pointer",textDecoration:"none",textAlign:"center",display:"block"}}>💎 ₹299/month</a>
                    <a href="/pricing" style={{background:"rgba(67,233,123,0.1)",border:"1px solid rgba(67,233,123,0.3)",borderRadius:12,color:"#43e97b",fontFamily:"inherit",fontSize:14,fontWeight:700,padding:"14px",cursor:"pointer",textDecoration:"none",textAlign:"center",display:"block"}}>♾️ ₹2999 Lifetime</a>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                    <div style={{flex:1,height:1,background:"#2a2a3d"}}/><span style={{fontSize:12,color:"#4a4a6a"}}>or use a coupon code</span><div style={{flex:1,height:1,background:"#2a2a3d"}}/>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{display:"flex",gap:8}}>
                      <input placeholder="Enter coupon code" value={couponCode} onChange={e=>{setCouponCode(e.target.value.toUpperCase());setCouponError("");setCouponSuccess("");}} onKeyDown={e=>e.key==="Enter"&&handleCouponApply()} style={{flex:1,background:"#1c1c28",border:`1px solid ${couponError?"#ff6584":couponSuccess?"#43e97b":"#2a2a3d"}`,borderRadius:10,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"11px 14px",outline:"none"}}/>
                      <button onClick={handleCouponApply} disabled={applyingCoupon} style={{background:"rgba(108,99,255,0.2)",border:"1px solid rgba(108,99,255,0.3)",color:"#6c63ff",borderRadius:10,padding:"0 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>{applyingCoupon?"...":"Apply"}</button>
                    </div>
                    {couponError&&<div style={{fontSize:12,color:"#ff6584",marginTop:6}}>⚠ {couponError}</div>}
                    {couponSuccess&&<div style={{fontSize:12,color:"#43e97b",marginTop:6}}>{couponSuccess}</div>}
                  </div>
                  <button onClick={()=>setShowEmailPopup(false)} style={{width:"100%",background:"transparent",border:"1px solid #2a2a3d",borderRadius:12,color:"#7878a0",fontFamily:"inherit",fontSize:13,padding:"11px",cursor:"pointer",marginTop:8}}>Maybe Later</button>
                </>
              ):(
                <>
                  <div style={{textAlign:"center",marginBottom:24}}>
                    <div style={{fontSize:48,marginBottom:12}}>📧</div>
                    <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 8px",color:"#f0f0f8"}}>Almost Ready!</h2>
                    <p style={{color:"#7878a0",fontSize:14,lineHeight:1.6,margin:0}}>Enter your email to get <strong style={{color:"#43e97b"}}>{FREE_LIMIT} free resumes</strong> — no credit card needed!</p>
                  </div>
                  <div style={{marginBottom:12}}>
                    <input type="email" placeholder="your@email.com" value={trackingEmail} onChange={e=>{setTrackingEmail(e.target.value);setEmailError("");}} onKeyDown={e=>e.key==="Enter"&&handleEmailSubmit()} style={{width:"100%",background:"#1c1c28",border:`1px solid ${emailError?"#ff6584":"#2a2a3d"}`,borderRadius:10,color:"#f0f0f8",fontFamily:"inherit",fontSize:15,padding:"12px 16px",outline:"none",boxSizing:"border-box"}}/>
                    {emailError&&<div style={{fontSize:12,color:"#ff6584",marginTop:6}}>⚠ {emailError}</div>}
                  </div>
                  {!showCouponField?(
                    <button onClick={()=>setShowCouponField(true)} style={{background:"none",border:"none",color:"#6c63ff",cursor:"pointer",fontSize:12,padding:"0 0 12px",fontFamily:"inherit",textDecoration:"underline"}}>🎟️ Have a coupon code?</button>
                  ):(
                    <div style={{marginBottom:12}}>
                      <div style={{display:"flex",gap:8}}>
                        <input placeholder="Enter coupon code" value={couponCode} onChange={e=>{setCouponCode(e.target.value.toUpperCase());setCouponError("");setCouponSuccess("");}} style={{flex:1,background:"#1c1c28",border:`1px solid ${couponError?"#ff6584":couponSuccess?"#43e97b":"rgba(108,99,255,0.3)"}`,borderRadius:10,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"11px 14px",outline:"none"}}/>
                        <button onClick={handleCouponApply} disabled={applyingCoupon} style={{background:"rgba(108,99,255,0.2)",border:"1px solid rgba(108,99,255,0.3)",color:"#6c63ff",borderRadius:10,padding:"0 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>{applyingCoupon?"...":"Apply"}</button>
                      </div>
                      {couponError&&<div style={{fontSize:12,color:"#ff6584",marginTop:6}}>⚠ {couponError}</div>}
                      {couponSuccess&&<div style={{fontSize:12,color:"#43e97b",marginTop:6}}>{couponSuccess}</div>}
                    </div>
                  )}
                  <button onClick={handleEmailSubmit} style={{width:"100%",background:"linear-gradient(135deg,#6c63ff,#9b59f5)",border:"none",borderRadius:12,color:"#fff",fontFamily:"inherit",fontSize:15,fontWeight:700,padding:"14px",cursor:"pointer",marginBottom:10}}>✦ Generate My Free Resume</button>
                  <div style={{fontSize:11,color:"#4a4a6a",textAlign:"center"}}>🔒 We respect your privacy. No spam ever.</div>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{textAlign:"right",marginBottom:8}}>
          <a href="/pricing" style={{background:"linear-gradient(135deg,#6c63ff,#9b59f5)",color:"#fff",padding:"8px 20px",borderRadius:100,fontSize:13,fontWeight:700,textDecoration:"none",display:"inline-block",boxShadow:"0 4px 15px rgba(108,99,255,0.3)"}}>💎 Upgrade to Pro</a>
        </div>

        <div style={{textAlign:"center",padding:"40px 0 32px"}}>
          <div style={{display:"inline-block",background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",color:"#a89fff",fontSize:12,padding:"4px 14px",borderRadius:100,marginBottom:16}}>🌍 AI-POWERED · GLOBAL · ATS-READY</div>
          <h1 style={{fontSize:"clamp(28px,6vw,52px)",fontWeight:800,background:"linear-gradient(135deg,#fff 30%,#a89fff 70%,#ff6584 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 12px"}}>ResumeForge AI</h1>
          <p style={{color:"#7878a0",fontSize:16,margin:"0 0 12px"}}>Build country-specific, ATS-optimized resumes for any job, anywhere.</p>
          {isUnlimited&&<div style={{display:"inline-block",background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:100,padding:"4px 14px",fontSize:12,color:"#a89fff"}}>♾️ Unlimited Access Active</div>}
          {!isUnlimited&&trackingEmail&&!limitReached&&<div style={{display:"inline-block",background:"rgba(67,233,123,0.1)",border:"1px solid rgba(67,233,123,0.2)",borderRadius:100,padding:"4px 14px",fontSize:12,color:"#43e97b"}}>✅ {resumesRemaining} free resume{resumesRemaining!==1?"s":""} remaining</div>}
          {limitReached&&!isUnlimited&&<div style={{display:"inline-block",background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",borderRadius:100,padding:"4px 14px",fontSize:12,color:"#ff6584"}}>🔒 Free limit reached — <a href="/pricing" style={{color:"#6c63ff",textDecoration:"none",fontWeight:700}}>Upgrade to Pro</a></div>}
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

          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff"}}>Personal Information</div>
              <button onClick={clearAll} style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff6584",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600}}>🗑 Clear All & Start Fresh</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Full Name *</label><input placeholder="" value={form.fullName} onChange={e=>set("fullName",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
              <div><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Email</label><input placeholder="" value={form.email} onChange={e=>set("email",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
              <div><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>City</label><input placeholder="" value={form.city} onChange={e=>set("city",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
              <div><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>LinkedIn URL</label><input placeholder="" value={form.linkedIn} onChange={e=>set("linkedIn",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
              <div>
                <label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Your Current Country</label>
                <select value={form.currentLocation} onChange={e=>set("currentLocation",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none"}}>
                  <option value="">Select your current country</option>
                  {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Phone {currentPhoneCode&&<span style={{color:"#6c63ff",fontWeight:700}}>({currentPhoneCode})</span>}</label>
                <input placeholder="" value={form.phone} onChange={e=>set("phone",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{gridColumn:"1 / -1"}}>
                <label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Target Country * <span style={{color:"#4a4a6a",textTransform:"none",fontSize:10}}>(Country where you want to work)</span></label>
                <select value={form.country} onChange={e=>set("country",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none"}}>
                  <option value="">Select target country</option>
                  {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {currentPhoneCode&&<div style={{marginTop:10,background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#a89fff"}}>💡 You are currently in <strong>{form.currentLocation}</strong> — your phone number should start with <strong>{currentPhoneCode}</strong></div>}
            {form.currentLocation&&form.country&&form.currentLocation!==form.country&&<div style={{marginTop:8,background:"rgba(67,233,123,0.05)",border:"1px solid rgba(67,233,123,0.15)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#43e97b"}}>✅ Building a <strong>{form.country}</strong> resume for someone currently in <strong>{form.currentLocation}</strong></div>}
          </div>

          {extraFields.length>0&&<div style={{background:"#13131a",border:"1px solid rgba(108,99,255,0.3)",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:6}}>🌍 {form.country}-Specific Fields</div>
            <div style={{fontSize:12,color:"#7878a0",marginBottom:16}}>These fields are required for {form.country} job applications and boost your ATS score.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {extraFields.map(f=>(<div key={f.key}><label style={{fontSize:11,color:"#a89fff",display:"block",marginBottom:5,textTransform:"uppercase"}}>{f.label}</label><input placeholder="" value={form[f.key]||""} onChange={e=>set(f.key,e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid rgba(108,99,255,0.3)",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>))}
            </div>
          </div>}

          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>Target Role</div>
            <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Target Job Title *</label><input placeholder="" value={form.jobTitle} onChange={e=>set("jobTitle",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box"}}/></div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Professional Summary <span style={{color:"#4a4a6a",fontSize:10,textTransform:"none"}}>(optional — AI will write one if blank)</span></label>
              <div style={{background:"rgba(108,99,255,0.05)",border:"1px solid rgba(108,99,255,0.15)",borderRadius:8,padding:"10px 12px",fontSize:11,color:"#7878a0",marginBottom:8,lineHeight:1.6}}>💡 <strong style={{color:"#a89fff"}}>Tip:</strong> Write your own summary for best results. The AI will only polish your language, not change your story.</div>
              <textarea placeholder="" value={form.summary} onChange={e=>set("summary",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",minHeight:100,resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Paste Job Description <span style={{color:"#43e97b",fontSize:10,textTransform:"none"}}>(Boosts ATS score by 15-20 points!)</span></label>
              <textarea placeholder="" value={form.jobDescription} onChange={e=>set("jobDescription",e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",minHeight:120,resize:"vertical",boxSizing:"border-box"}}/>
            </div>
          </div>

          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>Skills</div>
            <div style={{display:"flex",gap:10}}>
              <input placeholder="" value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSkill()} style={{flex:1,background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none"}}/>
              <button onClick={addSkill} style={{background:"rgba(108,99,255,0.2)",border:"1px solid rgba(108,99,255,0.3)",color:"#6c63ff",borderRadius:8,padding:"0 20px",cursor:"pointer",fontSize:22,fontWeight:300}}>+</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
              {skills.map(s=><div key={s} style={{background:"rgba(108,99,255,0.12)",border:"1px solid rgba(108,99,255,0.25)",color:"#a89fff",padding:"5px 12px",borderRadius:100,fontSize:13,display:"flex",alignItems:"center",gap:6}}>{s}<button onClick={()=>setSkills(sk=>sk.filter(x=>x!==s))} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:15,padding:0,lineHeight:1}}>×</button></div>)}
            </div>
            {skills.length===0&&<div style={{marginTop:8,fontSize:11,color:"#4a4a6a"}}>💡 Add at least 5-8 skills to improve your ATS score</div>}
          </div>

          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:8}}>Work Experience</div>
            <div style={{background:"rgba(67,233,123,0.05)",border:"1px solid rgba(67,233,123,0.15)",borderRadius:8,padding:"10px 12px",fontSize:11,color:"#7878a0",marginBottom:16,lineHeight:1.6}}>💡 <strong style={{color:"#43e97b"}}>Important:</strong> Fill in YOUR actual experience, roles and achievements. The AI will only polish the language!</div>
            {experiences.map((exp,i)=>(
              <div key={i} style={{background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:10,padding:16,marginBottom:10,position:"relative"}}>
                {experiences.length>1&&<button onClick={()=>setExperiences(ex=>ex.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:10,right:10,background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff6584",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
                  {[["Company","company"],["Role / Title","role"],["Duration","duration"]].map(([l,k])=>(<div key={k}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:4,textTransform:"uppercase"}}>{l}</label><input placeholder="" value={exp[k]} onChange={e=>updateExp(i,k,e.target.value)} style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a3d",borderRadius:7,color:"#f0f0f8",fontFamily:"inherit",fontSize:13,padding:"8px 10px",outline:"none",boxSizing:"border-box"}}/></div>))}
                </div>
                <label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:4,textTransform:"uppercase"}}>Your Actual Responsibilities & Achievements</label>
                <textarea placeholder="" value={exp.description} onChange={e=>updateExp(i,"description",e.target.value)} style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a3d",borderRadius:7,color:"#f0f0f8",fontFamily:"inherit",fontSize:13,padding:"8px 10px",outline:"none",minHeight:100,resize:"vertical",boxSizing:"border-box"}}/>
              </div>
            ))}
            <button onClick={()=>setExperiences(ex=>[...ex,{company:"",role:"",duration:"",description:""}])} style={{width:"100%",background:"transparent",border:"1px dashed #2a2a3d",color:"#7878a0",borderRadius:10,padding:11,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>+ Add Another Experience</button>
          </div>

          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:18}}>Education</div>
            {education.map((edu,i)=>(
              <div key={i} style={{background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:10,padding:16,marginBottom:10,position:"relative"}}>
                {education.length>1&&<button onClick={()=>setEducation(ed=>ed.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:10,right:10,background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff6584",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  {[["Institution","institution"],["Degree / Qualification","degree"],["Year","year"]].map(([l,k])=>(<div key={k}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:4,textTransform:"uppercase"}}>{l}</label><input placeholder="" value={edu[k]} onChange={e=>updateEdu(i,k,e.target.value)} style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a3d",borderRadius:7,color:"#f0f0f8",fontFamily:"inherit",fontSize:13,padding:"8px 10px",outline:"none",boxSizing:"border-box"}}/></div>))}
                </div>
              </div>
            ))}
            <button onClick={()=>setEducation(ed=>[...ed,{institution:"",degree:"",year:""}])} style={{width:"100%",background:"transparent",border:"1px dashed #2a2a3d",color:"#7878a0",borderRadius:10,padding:11,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>+ Add Another Education</button>
          </div>

          <button onClick={handleGenerateClick} disabled={loading} style={{width:"100%",background:limitReached&&!isUnlimited?"rgba(255,101,132,0.2)":"linear-gradient(135deg,#6c63ff,#9b59f5)",border:limitReached&&!isUnlimited?"1px solid rgba(255,101,132,0.3)":"none",borderRadius:12,color:limitReached&&!isUnlimited?"#ff6584":"#fff",fontFamily:"inherit",fontSize:16,fontWeight:700,padding:17,cursor:loading?"not-allowed":"pointer",opacity:loading?0.6:1,marginBottom:8,boxShadow:limitReached&&!isUnlimited?"none":"0 8px 32px rgba(108,99,255,0.35)"}}>
            {loading?"⚙ Generating your resume...":limitReached&&!isUnlimited?"🔒 Free Limit Reached — Upgrade or Use Coupon":"✦ Generate My ATS-Optimized Resume"}
          </button>

          {loading&&<div style={{textAlign:"center",padding:40}}>
            <div style={{width:44,height:44,border:"3px solid #2a2a3d",borderTopColor:"#6c63ff",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
            <p style={{color:"#7878a0",fontSize:15}}>Building your {form.country} resume...</p>
            <p style={{color:"#4a4a6a",fontSize:12,marginTop:4}}>This may take 10-20 seconds</p>
          </div>}

          {result&&<div style={{marginTop:28}}>
            <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:16}}>
              <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap",marginBottom:20}}>
                <div style={{textAlign:"center",minWidth:100}}>
                  <div style={{fontSize:60,fontWeight:800,color:sc(result.ats.score),lineHeight:1}}>{result.ats.score}</div>
                  <div style={{fontSize:11,color:"#7878a0",marginTop:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>ATS Score</div>
                  <div style={{display:"inline-block",background:result.ats.score>=80?"rgba(67,233,123,0.1)":"rgba(255,215,0,0.1)",border:`1px solid ${result.ats.score>=80?"rgba(67,233,123,0.3)":"rgba(255,215,0,0.3)"}`,color:result.ats.score>=80?"#43e97b":"#ffd700",fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:100,marginTop:8}}>{result.ats.rating}</div>
                </div>
                <div style={{flex:1,minWidth:220}}>
                  {[["Keyword Match",result.ats.keyword,"#6c63ff"],["Formatting",result.ats.formatting,"#43e97b"],["Readability",result.ats.readability,"#ffd700"],["Skills Coverage",result.ats.skills,"#ff6584"]].map(([l,v,c])=>(
                    <div key={l} style={{marginBottom:9}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#7878a0",marginBottom:3}}><span>{l}</span><span style={{color:c,fontWeight:600}}>{v}%</span></div>
                      <div style={{height:6,background:"#2a2a3d",borderRadius:100}}><div style={{height:"100%",width:`${v}%`,background:c,borderRadius:100}}/></div>
                    </div>
                  ))}
                </div>
              </div>
              {result.ats.tips?.length>0&&<div style={{background:"#1c1c28",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:18,marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#6c63ff",marginBottom:14}}>💡 How to Improve Your ATS Score</div>
                {result.ats.tips.map((t,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}><div style={{background:"linear-gradient(135deg,#6c63ff,#9b59f5)",color:"#fff",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div><div style={{fontSize:13,color:"#e0e0f0",lineHeight:1.6}}>{t}</div></div>))}
              </div>}
              {result.ats.missing?.length>0&&<div style={{background:"#1c1c28",border:"1px solid rgba(255,101,132,0.2)",borderRadius:12,padding:18}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#ff6584",marginBottom:12}}>⚠ Missing from Your Resume</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {result.ats.missing.map((m,i)=>(<div key={i} style={{background:"rgba(255,101,132,0.08)",border:"1px solid rgba(255,101,132,0.25)",color:"#ff9eb5",padding:"6px 14px",borderRadius:100,fontSize:12}}>✗ {m}</div>))}
                </div>
              </div>}
            </div>

            <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <h2 style={{margin:0,fontSize:18,fontWeight:700}}>📄 Your Resume — {form.country}</h2>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button onClick={()=>{navigator.clipboard.writeText(result.resume);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"rgba(67,233,123,0.1)",border:"1px solid rgba(67,233,123,0.25)",color:"#43e97b",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:500}}>{copied?"✓ Copied!":"⎘ Copy Resume"}</button>
                  <button onClick={downloadResumePdf} style={{background:"rgba(67,233,123,0.1)",border:"1px solid rgba(67,233,123,0.25)",color:"#43e97b",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:500}}>⬇ Download Styled PDF</button>
                  <button onClick={sendResumeEmail} disabled={emailSending} style={{background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.25)",color:"#a89fff",borderRadius:8,padding:"8px 16px",cursor:emailSending?"not-allowed":"pointer",fontFamily:"inherit",fontSize:13,fontWeight:500,opacity:emailSending?0.6:1}}>{emailSending?"📧 Sending...":emailSent?"✓ Sent to your email!":"📧 Email Me This Resume"}</button>
                  <button onClick={clearAll} style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff6584",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:500}}>🗑 Start New</button>
                </div>
              </div>
              <pre style={{background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:10,padding:24,fontSize:13,lineHeight:1.9,color:"#f0f0f8",whiteSpace:"pre-wrap",margin:0,fontFamily:"'Courier New',monospace",minHeight:200}}>{result.resume}</pre>
              <div style={{marginTop:12,fontSize:12,color:"#4a4a6a"}}>💡 Copy this resume and paste into Microsoft Word or Google Docs for final formatting.</div>
            </div>

            <div style={{background:"linear-gradient(135deg,rgba(108,99,255,0.15),rgba(155,89,245,0.15))",border:"1px solid rgba(108,99,255,0.3)",borderRadius:16,padding:20,marginTop:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#f0f0f8",marginBottom:4}}>💎 Want unlimited resumes + full ATS analysis?</div>
                <div style={{fontSize:13,color:"#7878a0"}}>Upgrade to Pro for just ₹299/month or ₹2999 lifetime!</div>
              </div>
              <a href="/pricing" style={{background:"linear-gradient(135deg,#6c63ff,#9b59f5)",color:"#fff",padding:"10px 24px",borderRadius:100,fontSize:14,fontWeight:700,textDecoration:"none",display:"inline-block",whiteSpace:"nowrap"}}>View Plans →</a>
            </div>

            {/* Cover Letter Section */}
            <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginTop:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:10}}>
                <div>
                  <h2 style={{margin:"0 0 4px",fontSize:16,fontWeight:700}}>📝 Cover Letter</h2>
                  <div style={{fontSize:12,color:"#7878a0"}}>Auto-generated to match your resume & job description</div>
                </div>
                {!coverLetter&&<button onClick={generateCoverLetter} disabled={coverLetterLoading} style={{background:"linear-gradient(135deg,#6c63ff,#9b59f5)",border:"none",borderRadius:10,color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:700,padding:"10px 20px",cursor:coverLetterLoading?"not-allowed":"pointer",opacity:coverLetterLoading?0.6:1}}>
                  {coverLetterLoading?"⚙ Generating...":"✦ Generate Cover Letter"}
                </button>}
              </div>
              {coverLetterLoading&&<div style={{textAlign:"center",padding:24}}>
                <div style={{width:36,height:36,border:"3px solid #2a2a3d",borderTopColor:"#6c63ff",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 10px"}}/>
                <p style={{color:"#7878a0",fontSize:13}}>Writing your {form.country} cover letter...</p>
              </div>}
              {coverLetter&&<>
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                  <button onClick={()=>{navigator.clipboard.writeText(coverLetter);setCoverLetterCopied(true);setTimeout(()=>setCoverLetterCopied(false),2000);}} style={{background:"rgba(67,233,123,0.1)",border:"1px solid rgba(67,233,123,0.25)",color:"#43e97b",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:500}}>{coverLetterCopied?"✓ Copied!":"⎘ Copy Cover Letter"}</button>
                  <button onClick={downloadCoverLetterPdf} style={{background:"rgba(67,233,123,0.1)",border:"1px solid rgba(67,233,123,0.25)",color:"#43e97b",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:500}}>⬇ Download Cover Letter PDF</button>
                  <button onClick={()=>setCoverLetter(null)} style={{background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.2)",color:"#a89fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:500}}>↺ Regenerate</button>
                </div>
                <pre style={{background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:10,padding:20,fontSize:13,lineHeight:1.9,color:"#f0f0f8",whiteSpace:"pre-wrap",margin:0,fontFamily:"'Courier New',monospace"}}>{coverLetter}</pre>
              </>}
            </div>
          </div>}
        </>}

        {tab==="ats"&&<div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6c63ff",marginBottom:8}}>ATS Score Checker</div>
          <p style={{color:"#7878a0",fontSize:14,marginBottom:20,lineHeight:1.6}}>Already have a resume? Paste it below along with the job description to instantly check your ATS score!</p>
          <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Your Resume Text</label><textarea rows={9} placeholder="" value={atsResumeText} onChange={e=>setAtsResumeText(e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>
          <div style={{marginBottom:20}}><label style={{fontSize:11,color:"#7878a0",display:"block",marginBottom:5,textTransform:"uppercase"}}>Job Description</label><textarea rows={6} placeholder="" value={atsJobDesc} onChange={e=>setAtsJobDesc(e.target.value)} style={{width:"100%",background:"#1c1c28",border:"1px solid #2a2a3d",borderRadius:8,color:"#f0f0f8",fontFamily:"inherit",fontSize:14,padding:"10px 12px",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>
          <button onClick={analyzeATS} disabled={atsLoading||!atsResumeText.trim()||!atsJobDesc.trim()} style={{width:"100%",background:"linear-gradient(135deg,#6c63ff,#9b59f5)",border:"none",borderRadius:12,color:"#fff",fontFamily:"inherit",fontSize:16,fontWeight:700,padding:17,cursor:"pointer",opacity:atsLoading||!atsResumeText.trim()||!atsJobDesc.trim()?0.5:1}}>
            {atsLoading?"⚙ Analyzing your resume...":"◎ Check My ATS Score"}
          </button>
          {atsLoading&&<div style={{textAlign:"center",padding:30}}>
            <div style={{width:40,height:40,border:"3px solid #2a2a3d",borderTopColor:"#6c63ff",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
            <p style={{color:"#7878a0",fontSize:14}}>Analyzing your resume...</p>
          </div>}
          {atsResult&&<div style={{marginTop:24}}>
            <div style={{textAlign:"center",marginBottom:24,padding:20,background:"#1c1c28",borderRadius:12}}>
              <div style={{fontSize:72,fontWeight:800,color:sc(atsResult.overall),lineHeight:1}}>{atsResult.overall}</div>
              <div style={{fontSize:13,color:"#7878a0",marginBottom:10}}>ATS COMPATIBILITY SCORE</div>
              <div style={{display:"inline-block",background:atsResult.overall>=80?"rgba(67,233,123,0.1)":"rgba(255,215,0,0.1)",border:`1px solid ${atsResult.overall>=80?"rgba(67,233,123,0.3)":"rgba(255,215,0,0.3)"}`,color:atsResult.overall>=80?"#43e97b":"#ffd700",fontSize:13,fontWeight:700,padding:"4px 16px",borderRadius:100}}>{atsResult.rating}</div>
            </div>
            {[["Keyword Match",atsResult.keyword,"#6c63ff"],["Formatting",atsResult.formatting,"#43e97b"],["Readability",atsResult.readability,"#ffd700"],["Skills Coverage",atsResult.skills,"#ff6584"]].map(([l,v,c])=>(
              <div key={l} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#7878a0",marginBottom:4}}><span>{l}</span><span style={{color:c,fontWeight:600}}>{v}%</span></div>
                <div style={{height:6,background:"#2a2a3d",borderRadius:100}}><div style={{height:"100%",width:`${v}%`,background:c,borderRadius:100}}/></div>
              </div>
            ))}
            {atsResult.tips?.length>0&&<div style={{background:"#1c1c28",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:18,marginTop:16,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:"#6c63ff",marginBottom:14,letterSpacing:"0.08em"}}>💡 Improvement Tips</div>
              {atsResult.tips.map((t,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}><div style={{background:"linear-gradient(135deg,#6c63ff,#9b59f5)",color:"#fff",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div><div style={{fontSize:13,color:"#e0e0f0",lineHeight:1.6}}>{t}</div></div>))}
            </div>}
            {atsResult.missing_keywords?.length>0&&<div style={{background:"#1c1c28",border:"1px solid rgba(255,101,132,0.15)",borderRadius:12,padding:18}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:"#ff6584",marginBottom:12,letterSpacing:"0.08em"}}>🔍 Missing Keywords</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {atsResult.missing_keywords.map(k=>(<div key={k} style={{background:"rgba(255,101,132,0.08)",border:"1px solid rgba(255,101,132,0.2)",color:"#ff9eb5",padding:"5px 12px",borderRadius:100,fontSize:12}}>+ {k}</div>))}
              </div>
            </div>}
            <div style={{background:"linear-gradient(135deg,rgba(108,99,255,0.15),rgba(155,89,245,0.15))",border:"1px solid rgba(108,99,255,0.3)",borderRadius:16,padding:20,marginTop:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#f0f0f8",marginBottom:4}}>💎 Want to build an ATS-optimized resume?</div>
                <div style={{fontSize:13,color:"#7878a0"}}>Upgrade to Pro and generate unlimited resumes!</div>
              </div>
              <a href="/pricing" style={{background:"linear-gradient(135deg,#6c63ff,#9b59f5)",color:"#fff",padding:"10px 24px",borderRadius:100,fontSize:14,fontWeight:700,textDecoration:"none",display:"inline-block",whiteSpace:"nowrap"}}>View Plans →</a>
            </div>
          </div>}
        </div>}

        {/* ===== HOW TO USE & FAQ SECTION ===== */}
        <div style={{marginTop:48,borderTop:"1px solid #2a2a3d",paddingTop:32}}>

          {/* How To Use */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,marginBottom:12,overflow:"hidden"}}>
            <button onClick={()=>setShowHowTo(!showHowTo)} style={{width:"100%",background:"transparent",border:"none",padding:"18px 24px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>📖</span>
                <span style={{fontSize:15,fontWeight:700,color:"#f0f0f8"}}>How to Use ResumeForge AI</span>
              </div>
              <span style={{fontSize:18,color:"#6c63ff",transition:"transform 0.2s",transform:showHowTo?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
            </button>
            {showHowTo&&<div style={{padding:"0 24px 24px"}}>
              {HOW_TO_STEPS.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
                  <div style={{background:"linear-gradient(135deg,#6c63ff,#9b59f5)",color:"#fff",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0,marginTop:2}}>{i+1}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#f0f0f8",marginBottom:4}}>{step.title}</div>
                    <div style={{fontSize:13,color:"#7878a0",lineHeight:1.6}}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>}
          </div>

          {/* FAQ */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,overflow:"hidden"}}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #2a2a3d",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>❓</span>
              <span style={{fontSize:15,fontWeight:700,color:"#f0f0f8"}}>Frequently Asked Questions</span>
            </div>
            {FAQS.map((faq,i)=>(
              <div key={i} style={{borderBottom:i<FAQS.length-1?"1px solid #1a1a2a":"none"}}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:"100%",background:"transparent",border:"none",padding:"16px 24px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit",textAlign:"left"}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#e0e0f0",paddingRight:16}}>{faq.q}</span>
                  <span style={{fontSize:16,color:"#6c63ff",flexShrink:0,transition:"transform 0.2s",transform:openFaq===i?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
                </button>
                {openFaq===i&&<div style={{padding:"0 24px 16px",fontSize:13,color:"#7878a0",lineHeight:1.7,borderLeft:"3px solid #6c63ff",marginLeft:24,marginRight:24,marginBottom:8}}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",padding:"32px 0 16px",borderTop:"1px solid #2a2a3d",marginTop:32}}>
          <div style={{fontSize:12,color:"#4a4a6a"}}>Need help? Contact us at <a href={`mailto:${SUPPORT_EMAIL}`} style={{color:"#6c63ff",textDecoration:"none"}}>{SUPPORT_EMAIL}</a></div>
        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
