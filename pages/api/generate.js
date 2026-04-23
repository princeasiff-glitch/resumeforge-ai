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
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        messages: req.body.messages
      })
    });
    
    const data = await response.json();
    
    // Extract text and send directly
    const text = data?.content?.[0]?.text || data?.error?.message || JSON.stringify(data);
    res.status(200).json({ text });
    
  } catch (error) {
    res.status(500).json({ text: "Error: " + error.message });
  }
}
