export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const Razorpay = require('razorpay');
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const { amount, plan } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { plan }
    });
    res.status(200).json({ orderId: order.id, amount, currency: 'INR' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
