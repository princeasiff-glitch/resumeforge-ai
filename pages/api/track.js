export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const key = `resume_count_${email.toLowerCase().trim()}`;

  try {
    // Get current count
    const getResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
        }
      }
    );
    const getData = await getResponse.json();
    const currentCount = parseInt(getData.result || '0');

    if (currentCount >= 2) {
      return res.status(200).json({ 
        allowed: false, 
        count: currentCount,
        message: "Free limit reached"
      });
    }

    // Increment count
    const incrResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/incr/${key}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
        }
      }
    );
    const incrData = await incrResponse.json();
    const newCount = parseInt(incrData.result || '1');

    return res.status(200).json({ 
      allowed: true, 
      count: newCount,
      remaining: 2 - newCount
    });

  } catch (error) {
    // If tracking fails, allow generation
    return res.status(200).json({ allowed: true, count: 0, remaining: 2 });
  }
}
