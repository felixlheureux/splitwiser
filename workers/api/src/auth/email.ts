export const sendOtpEmail = async (env: Env, email: string, otp: string) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Splitwiser <login@splitwiser.app>',
      to: [email],
      subject: `${otp} is your Splitwiser login code`,
      text: `Your sign-in code for Splitwiser is:\n\n${otp}\n\nThis code expires in 10 minutes. Enter it in the app to sign in.\n\nIf you didn't request this code, you can safely ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1e293b;">
          <div style="display: inline-block; width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center; line-height: 40px; color: #fff; font-weight: 800; font-size: 20px; margin-bottom: 20px;">s.</div>
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Sign in to Splitwiser</h2>
          <p style="font-size: 14px; line-height: 20px; color: #475569; margin: 0 0 24px 0;">Enter this code in your browser or installed app to sign in:</p>
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 18px 24px; text-align: center; letter-spacing: 0.25em; font-size: 32px; font-weight: 800; color: #0d9488; font-family: monospace; margin-bottom: 24px;">
            ${otp}
          </div>
          <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Sign-in email delivery failed (${response.status}).`);
  }
};

