// Coupon codes configuration
const COUPONS = {
  "AFSR2026": { type: "unlimited", value: 999, description: "Unlimited forever" },
  "FREEBIE10": { type: "free_resumes", value: 10, description: "10 free resumes" },
  "LAUNCH50": { type: "discount", value: 50, description: "50% off Pro" },
  "FRIEND5": { type: "free_resumes", value: 5, description: "5 free resumes" },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, couponCode } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanCoupon = couponCode ? couponCode.toUpperCase().trim() : null;

  // Check coupon code
  if (cleanCoupon) {
    const coupon = COUPONS[cleanCoupon];
    
    if (!coupon) {
      return res.status(200).json({ 
        allowed: false,
        couponError: "Invalid coupon code. Please check and try again!",
        count: 0,
        remaining: 0
      });
    }

    // Valid coupon found!
    if (coupon.type === "unlimited") {
      return res.status(200).json({ 
        allowed: true,
        couponApplied: true,
        couponType: "unlimited",
        remaining: 999,
        message: "🎉 Unlimited access granted!"
      });
    }

    if (coupon.type === "free_resumes") {
      // Store coupon-based count
      const key = `resume_count_${cleanEmail}`;
      const limitKey = `resume_limit_${cleanEmail}`;

      try {
        // Set higher limit for this email
        await fetch(
          `${process.env.UPSTASH_REDIS_REST_URL}/set/${limitKey}/${coupon.value}`,
          { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
        );

        const getResponse = await fetch(
          `${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`,
          { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
        );
        const getData = await getResponse.json();
        const currentCount = parseInt(getData.result || '0');
        const remaining = coupon.value - currentCount;

        if (remaining <= 0) {
          return res.status(200).json({
            allowed: false,
            count: currentCount,
            remaining: 0,
            message: "Coupon limit reached"
          });
        }

        return res.status(200).json({
          allowed: true,
          couponApplied: true,
          couponType: "free_resumes",
          remaining: remaining,
          limit: coupon.value,
          message: `🎉 Coupon applied! You have ${remaining} free resumes!`
        });

      } catch {
        return res.status(200).json({ allowed: true, couponApplied: true, remaining: coupon.value });
      }
    }

    if (coupon.type === "discount") {
      return res.status(200).json({
        allowed: false,
        couponApplied: true,
        couponType: "discount",
        discountPercent: coupon.value,
        redirectToPricing: true,
        message: `🎉 ${coupon.value}% discount applied! Redirecting to pricing...`
      });
    }
  }

  // No coupon — normal free tracking
  const key = `resume_count_${cleanEmail}`;
  const limitKey = `resume_limit_${cleanEmail}`;

  try {
    // Check if custom limit exists (from coupon)
    const limitResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${limitKey}`,
      { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
    );
    const limitData = await limitResponse.json();
    const userLimit = parseInt(limitData.result || '2');

    const getResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`,
      { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
    );
    const getData = await getResponse.json();
    const currentCount = parseInt(getData.result || '0');

    if (currentCount >= userLimit) {
      return res.status(200).json({ 
        allowed: false, 
        count: currentCount,
        remaining: 0,
        message: "Free limit reached"
      });
    }

    const incrResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/incr/${key}`,
      { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
    );
    const incrData = await incrResponse.json();
    const newCount = parseInt(incrData.result || '1');
    const remaining = userLimit - newCount;

    return res.status(200).json({ 
      allowed: true, 
      count: newCount,
      remaining: remaining
    });

  } catch (error) {
    return res.status(200).json({ allowed: true, count: 0, remaining: 2 });
  }
}
