import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const baseUrl = process.env.THINGSBOARD_API_URL;
  const clientId = process.env.THINGSBOARD_CLIENT_ID;
  const clientSecret = process.env.THINGSBOARD_CLIENT_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    return res
      .status(500)
      .json({ error: 'ThingsBoard credentials not configured' });
  }

  try {
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

    const tenantsResp = await fetch(`${baseUrl}/api/tenants`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!tenantsResp.ok) {
      throw new Error('Failed to fetch tenants');
    }

    const data = await tenantsResp.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
