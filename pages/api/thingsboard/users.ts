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

    const usersResp = await fetch(`${baseUrl}/api/users`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!usersResp.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await usersResp.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
