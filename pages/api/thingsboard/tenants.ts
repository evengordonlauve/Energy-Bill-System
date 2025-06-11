import type { NextApiRequest, NextApiResponse } from 'next';
import { getThingsboardToken } from '../../../utils/thingsboard';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const baseUrl = process.env.THINGSBOARD_API_URL;

  if (!baseUrl) {
    return res
      .status(500)
      .json({ error: 'ThingsBoard credentials not configured' });
  }

  try {
    const access_token = await getThingsboardToken();

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
