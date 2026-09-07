export interface TurnstileVerifyResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstile(
  secretKey: string | undefined,
  token: string | undefined | null,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const isDevPlaceholder = !secretKey || secretKey === 'replace-if-enabled';
  const isTestingSecret =
    Boolean(secretKey?.startsWith('local-test-')) ||
    secretKey === '1x0000000000000000000000000000000AA';

  // If Turnstile is not configured yet (local dev placeholder), allow requests through
  if (isDevPlaceholder) {
    if (token === 'invalid-turnstile-token' || token === '2x00000000000000000000AA') {
      return { success: false, error: 'invalid_turnstile_token' };
    }
    return { success: true };
  }

  // If using local testing secret (e.g. unit tests or Cloudflare test key)
  if (isTestingSecret) {
    if (token === 'invalid-turnstile-token' || token === '2x00000000000000000000AA') {
      return { success: false, error: 'invalid_turnstile_token' };
    }
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return { success: false, error: 'missing_turnstile_token' };
    }
    return { success: true };
  }

  // Production verification against Cloudflare Turnstile API
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return { success: false, error: 'missing_turnstile_token' };
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey!);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return { success: false, error: `turnstile_http_${response.status}` };
    }

    const outcome = (await response.json()) as {
      success?: boolean;
      'error-codes'?: string[];
    };

    if (outcome.success) {
      return { success: true };
    }

    return {
      success: false,
      error: outcome['error-codes']?.join(', ') || 'turnstile_verification_failed',
    };
  } catch {
    return { success: false, error: 'turnstile_network_error' };
  }
}
