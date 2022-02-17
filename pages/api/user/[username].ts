import type { NextApiRequest, NextApiResponse } from 'next'

import { getUser } from '../../../lib/strike'

type Data = {
  username: string
}

// API

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return new Promise(async (resolve, reject) => {
    const { username } = req.query
    try {
      const { currencies, canReceive } = await getUser(username)
      if (canReceive) {
        res.status(200).json({
          username,
          currencies: currencies.filter((c) => c.isInvoiceable)
        })
      } else {
        res.status(400).json({ error: "User can not receive on Strike" })
      }
    } catch (error) {
      if (error.response.status === 404) {
        res.status(404).json({ error: "User is not on Strike" })
      } else {
        res.status(400).json({ error: "Unexpected error" })
      }
    } finally {
      resolve()
    }
  })
}
