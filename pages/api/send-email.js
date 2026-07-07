import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name, resumeText, atsScore, country, resumePdfBase64, coverLetterPdfBase64 } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    const attachments = [];

    if (resumePdfBase64) {
      attachments.push({
        filename: `${(name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`,
        content: resumePdfBase64,
        contentType: 'application/pdf',
      });
    }

    if (coverLetterPdfBase64) {
      attachments.push({
        filename: `${(name || 'Cover_Letter').replace(/\s+/g, '_')}_Cover_Letter.pdf`,
        content: coverLetterPdfBase64,
        contentType: 'application/pdf',
      });
    }

    const hasPdf = attachments.length > 0;

    const { data, error } = await resend.emails.send({
      from: 'ResumeForge AI <noreply@resumeforgeai.live>',
      to: [email],
      subject: `Your ${country} Resume from ResumeForge AI 🎯`,
      attachments,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #f0f0f8; padding: 30px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: rgba(108,99,255,0.15); border: 1px solid rgba(108,99,255,0.3); color: #a89fff; font-size: 11px; padding: 4px 14px; border-radius: 100px; margin-bottom: 12px;">🌍 AI-POWERED · ATS-READY</div>
            <h1 style="font-size: 28px; font-weight: 800; color: #f0f0f8; margin: 0;">ResumeForge AI</h1>
          </div>
          <p style="font-size: 15px; color: #c0c0d8; line-height: 1.6;">Hi ${name},</p>
          <p style="font-size: 15px; color: #c0c0d8; line-height: 1.6;">
            Your AI-generated resume for <strong style="color: #a89fff;">${country}</strong> is ready! 🎉
            ${hasPdf ? '<br/>Your <strong style="color: #43e97b;">styled PDF</strong> is attached to this email.' : ''}
          </p>
          ${hasPdf ? `
          <div style="background: rgba(67,233,123,0.1); border: 1px solid rgba(67,233,123,0.3); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <div style="font-size: 14px; font-weight: 700; color: #43e97b; margin-bottom: 4px;">📎 ${attachments.length} PDF file${attachments.length > 1 ? 's' : ''} attached</div>
            <div style="font-size: 12px; color: #7878a0;">${attachments.map(a => a.filename).join(' &nbsp;·&nbsp; ')}</div>
          </div>
          ` : ''}
          <div style="text-align: center; background: #1c1c28; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="font-size: 48px; font-weight: 800; color: ${atsScore >= 80 ? '#43e97b' : atsScore >= 60 ? '#ffd700' : '#ff6584'};">${atsScore}</div>
            <div style="font-size: 11px; color: #7878a0; text-transform: uppercase; letter-spacing: 0.05em;">ATS Score</div>
          </div>
          ${!hasPdf ? `<div style="background: #1c1c28; border: 1px solid #2a2a3d; border-radius: 10px; padding: 20px; font-size: 13px; line-height: 1.8; color: #f0f0f8; white-space: pre-wrap; font-family: 'Courier New', monospace; margin-bottom: 20px;">${resumeText}</div>` : ''}
          <div style="background: linear-gradient(135deg, rgba(108,99,255,0.15), rgba(155,89,245,0.15)); border: 1px solid rgba(108,99,255,0.3); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #f0f0f8; margin-bottom: 8px;">💎 Want unlimited resumes + full ATS analysis?</div>
            <a href="https://resumeforgeai.live/pricing" style="display: inline-block; background: linear-gradient(135deg, #6c63ff, #9b59f5); color: #fff; padding: 10px 24px; border-radius: 100px; font-size: 13px; font-weight: 700; text-decoration: none; margin-top: 8px;">View Plans →</a>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #2a2a3d; font-size: 12px; color: #4a4a6a;">
            Need help? Contact us at <a href="mailto:resumeforgeai.support@gmail.com" style="color: #6c63ff; text-decoration: none;">resumeforgeai.support@gmail.com</a>
            <br/><br/>
            👉 <a href="https://resumeforgeai.live" style="color: #6c63ff; text-decoration: none;">resumeforgeai.live</a>
          </div>
        </div>
      `
    });

    if (error) {
      console.log('Resend error:', JSON.stringify(error));
      return res.status(500).json({ error: error.message || JSON.stringify(error) });
    }

    console.log('Email sent successfully:', data.id);
    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.log('Catch error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
