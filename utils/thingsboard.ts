export async function getThingsboardToken(): Promise<string> {
  const baseUrl = process.env.THINGSBOARD_API_URL;
  const clientId = process.env.THINGSBOARD_CLIENT_ID;
  const clientSecret = process.env.THINGSBOARD_CLIENT_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error('ThingsBoard credentials not configured');
  }

  const tokenResp = await fetch(`${baseUrl}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!tokenResp.ok) {
    throw new Error('Failed to authenticate with ThingsBoard');
  }

  const { access_token } = await tokenResp.json();
  if (!access_token) {
    throw new Error('No access token received from ThingsBoard');
  }

  return access_token as string;
}
