export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const Razorpay = require('razorpay');

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const { amount, currency, plan } = req.body;
  
  // Convert to smallest unit
  // INR: paise (multiply by 100)
  // USD: cents (multiply by 100)
  const finalCurrency = currency || 'INR';
  const finalAmount = amount * 100;

  try {
    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency: finalCurrency,
      receipt: `receipt_${Date.now()}`,
      notes: { plan, currency: finalCurrency }
    });
    
    console.log('Order created:', order.id, 'Currency:', finalCurrency, 'Amount:', finalAmount);
    res.status(200).json({ 
      orderId: order.id, 
      amount: amount,
      currency: finalCurrency
    });
  } catch (error) {
    console.log('Payment error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
