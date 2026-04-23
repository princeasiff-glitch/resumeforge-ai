export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: req.body.messages
      })
    });
    
    const data = await response.json();
    let rawText = data?.content?.[0]?.text || data?.error?.message || JSON.stringify(data);
    
    // Split ATS data FIRST before any cleaning
    let resumeText = rawText;
    let atsData = null;
    
    if (rawText.includes('---ATS_DATA---')) {
      const parts = rawText.split('---ATS_DATA---');
      resumeText = parts[0];
      try {
        const jsonStr = parts[1].replace(/```json|```/g, '').trim();
        atsData = JSON.parse(jsonStr);
      } catch(e) {
        console.log('ATS parse error:', e.message);
      }
    }
    
    // Clean markdown from resume text only
    resumeText = resumeText
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^---$/gm, '─────────────────────────')
      .trim();
    
    res.status(200).json({ text: resumeText, ats: atsData });
    
  } catch (error) {
    res.status(500).json({ text: "Error: " + error.message, ats: null });
  }
}
