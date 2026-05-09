import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const plans = [
  {
    name: "Free",
    priceINR: 0,
    priceUSD: 0,
    period: "forever",
    color: "#7878a0",
    features: ["2 resumes per month", "Basic ATS score", "5 countries supported", "Copy resume text"],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro Monthly",
    priceINR: 299,
    priceUSD: 4,
    period: "per month",
    color: "#6c63ff",
    features: ["Unlimited resumes", "Full ATS analysis", "30+ countries", "Improvement tips", "Missing keywords", "Priority support"],
    cta: "Get Pro Monthly",
    popular: true
  },
  {
    name: "Lifetime",
    priceINR: 2999,
    priceUSD: 29,
    period: "one-time",
    color: "#43e97b",
    features: ["Everything in Pro", "Lifetime access", "All future updates", "No monthly fees", "30+ countries", "Priority support"],
    cta: "Get Lifetime Access",
    popular: false
  }
];

export default function Pricing() {
  const [loading, setLoading] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [detecting, setDetecting] = useState(true);
  const router = useRouter();

  // Auto detect country on page load
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_code === "IN") {
          setCurrency("INR");
        } else {
          setCurrency("USD");
        }
      } catch {
        setCurrency("USD"); // default to USD if detection fails
      }
      setDetecting(false);
    };
    detectCountry();
  }, []);

  const handlePayment = async (plan) => {
    const amount = currency === "INR" ? plan.priceINR : plan.priceUSD;
    if (amount === 0) { router.push("/"); return; }
    setLoading(plan.name);
    try {
      if (currency === "INR") {
        // Razorpay for Indian users
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: plan.priceINR, plan: plan.name })
        });
        const data = await res.json();
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount * 100,
          currency: "INR",
          name: "ResumeForge AI",
          description: plan.name,
          order_id: data.orderId,
          handler: function(response) {
            alert("🎉 Payment Successful! Welcome to " + plan.name + "!");
            router.push("/");
          },
          prefill: { name: "", email: "", contact: "" },
          theme: { color: "#6c63ff" }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // Stripe for international users
        alert("Stripe integration coming soon! Please contact us at princeasiff@gmail.com to upgrade.");
      }
    } catch(e) {
      alert("Payment failed: " + e.message);
    }
    setLoading("");
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <div style={{fontFamily:"system-ui,sans-serif",background:"#0a0a0f",minHeight:"100vh",color:"#f0f0f8",padding:"20px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>

          {/* Header */}
          <div style={{textAlign:"center",padding:"48px 0 40px"}}>
            <div style={{display:"inline-block",background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",color:"#a89fff",fontSize:12,padding:"4px 14px",borderRadius:100,marginBottom:16}}>💎 SIMPLE PRICING</div>
            <h1 style={{fontSize:"clamp(28px,5vw,48px)",fontWeight:800,background:"linear-gradient(135deg,#fff 30%,#a89fff 70%,#ff6584 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 12px"}}>Choose Your Plan</h1>
            <p style={{color:"#7878a0",fontSize:16,margin:"0 0 24px"}}>Start free, upgrade when you need more</p>

            {/* Currency indicator */}
            {detecting ? (
              <div style={{fontSize:13,color:"#7878a0"}}>🌍 Detecting your location...</div>
            ) : (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{fontSize:13,color:"#7878a0"}}>
                  {currency==="INR"?"🇮🇳 Showing prices in Indian Rupees (₹)":"🌍 Showing prices in US Dollars ($)"}
                </div>
                <div style={{display:"inline-flex",gap:4,background:"#13131a",border:"1px solid #2a2a3d",borderRadius:10,padding:4}}>
                  {["INR","USD"].map(c=>(
                    <button key={c} onClick={()=>setCurrency(c)} style={{padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,background:currency===c?"#6c63ff":"transparent",color:currency===c?"#fff":"#7878a0"}}>
                      {c==="INR"?"🇮🇳 ₹ INR":"🌍 $ USD"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Plans */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginBottom:40}}>
            {plans.map(plan=>(
              <div key={plan.name} style={{background:"#13131a",border:`1px solid ${plan.popular?"rgba(108,99,255,0.5)":"#2a2a3d"}`,borderRadius:20,padding:28,position:"relative",boxShadow:plan.popular?"0 0 40px rgba(108,99,255,0.15)":"none"}}>

                {plan.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#6c63ff,#9b59f5)",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:100,whiteSpace:"nowrap"}}>⭐ MOST POPULAR</div>}

                <div style={{marginBottom:20}}>
                  <div style={{fontSize:14,fontWeight:700,color:plan.color,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>{plan.name}</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                    {detecting ? (
                      <span style={{fontSize:32,fontWeight:800,color:"#7878a0"}}>...</span>
                    ) : (
                      <>
                        <span style={{fontSize:42,fontWeight:800,color:"#f0f0f8"}}>
                          {currency==="INR" ? (plan.priceINR===0?"Free":`₹${plan.priceINR}`) : (plan.priceUSD===0?"Free":`$${plan.priceUSD}`)}
                        </span>
                        {(currency==="INR"?plan.priceINR:plan.priceUSD)>0&&<span style={{fontSize:13,color:"#7878a0"}}>/{plan.period}</span>}
                      </>
                    )}
                  </div>
                </div>

                <div style={{marginBottom:24}}>
                  {plan.features.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{color:"#43e97b",fontSize:16,flexShrink:0}}>✓</div>
                      <div style={{fontSize:14,color:"#c0c0d8"}}>{f}</div>
                    </div>
                  ))}
                </div>

                <button onClick={()=>handlePayment(plan)} disabled={loading===plan.name||detecting} style={{width:"100%",background:plan.popular?"linear-gradient(135deg,#6c63ff,#9b59f5)":plan.priceINR===0?"transparent":"rgba(67,233,123,0.1)",border:plan.popular?"none":plan.priceINR===0?"1px solid #2a2a3d":"1px solid rgba(67,233,123,0.3)",borderRadius:12,color:plan.popular?"#fff":plan.priceINR===0?"#7878a0":"#43e97b",fontFamily:"inherit",fontSize:15,fontWeight:700,padding:"14px",cursor:"pointer",opacity:loading===plan.name||detecting?0.6:1}}>
                  {loading===plan.name?"Processing...":plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Payment methods */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:20,marginBottom:24,textAlign:"center"}}>
            <div style={{fontSize:12,color:"#7878a0",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Accepted Payment Methods</div>
            <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
              {[
                {icon:"💳",label:"Credit/Debit Cards"},
                {icon:"📱",label:"UPI (GPay, PhonePe, Paytm)"},
                {icon:"🏦",label:"Net Banking"},
                {icon:"💰",label:"Wallets"},
              ].map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#a0a0c0"}}>
                  <span>{m.icon}</span><span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div style={{textAlign:"center",padding:"0 0 20px"}}>
            <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
              {["🔒 100% Secure Payments","✅ Instant Access","🔄 Cancel Anytime","🌍 30+ Countries Supported"].map((b,i)=>(
                <div key={i} style={{fontSize:13,color:"#7878a0"}}>{b}</div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{background:"#13131a",border:"1px solid #2a2a3d",borderRadius:16,padding:24,marginBottom:24}}>
            <div style={{fontSize:14,fontWeight:700,color:"#6c63ff",marginBottom:16,textTransform:"uppercase",letterSpacing:"0.08em"}}>Frequently Asked Questions</div>
            {[
              {q:"Can I cancel anytime?",a:"Yes! For monthly plans you can cancel anytime. No questions asked."},
              {q:"What payment methods are accepted?",a:"Indian users can pay via UPI, Credit/Debit cards, Net Banking and Wallets. International users can pay via Credit/Debit cards."},
              {q:"Is my payment secure?",a:"Yes! Payments are processed by Razorpay (India) and Stripe (International) — both are PCI DSS compliant and fully secure."},
              {q:"What happens after I pay?",a:"You get instant access to all Pro features immediately after payment."},
            ].map((faq,i)=>(
              <div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<3?"1px solid #2a2a3d":"none"}}>
                <div style={{fontSize:14,fontWeight:600,color:"#f0f0f8",marginBottom:6}}>❓ {faq.q}</div>
                <div style={{fontSize:13,color:"#7878a0",lineHeight:1.6}}>{faq.a}</div>
              </div>
            ))}
          </div>

          {/* Back button */}
          <div style={{textAlign:"center",paddingBottom:40}}>
            <button onClick={()=>router.push("/")} style={{background:"transparent",border:"1px solid #2a2a3d",color:"#7878a0",borderRadius:10,padding:"10px 24px",cursor:"pointer",fontFamily:"inherit",fontSize:14}}>← Back to Resume Builder</button>
          </div>

        </div>
      </div>
    </>
  );
}
