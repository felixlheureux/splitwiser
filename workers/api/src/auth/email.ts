export const sendSignInEmail = async (env: Env, email: string, url: string) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Splitwiser <login@splitwiser.app>',
      to: [email],
      subject: 'Sign in to Splitwiser',
      text: `Click this link to sign in to Splitwiser:\n\n${url}\n\nThe link expires in 10 minutes and can be used once. If you didn't request it, you can ignore this email.`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Sign-in email delivery failed (${response.status}).`);
  }
};
