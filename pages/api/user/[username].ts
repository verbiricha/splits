import type { NextApiRequest, NextApiResponse } from 'next'

import { getUser } from '../../../lib/strike'

type Currency = {
  currency: 'BTC' | 'USD'
}

type User = {
  username: string
  currencies: Currency[]
}

type Error = {
  error?: string
}

// API

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | Error>
) {
  return new Promise(async (resolve, reject) => {
    const { username } = req.query
    try {
      const { currencies, canReceive } = await getUser(username)
      if (canReceive) {
        res.status(200).json({
          username: username as string,
          currencies: currencies.filter((c: any) => c.isInvoiceable)
        })
      } else {
        res.status(400).json({ error: "User can not receive on Strike" })
      }
    } catch (error) {
      // @ts-expect-error
      const { response } = error
      if (response.status === 404) {
        res.status(404).json({ error: "User is not on Strike" })
      } else {
        res.status(400).json({ error: "Unexpected error" })
      }
    } finally {
      // @ts-expect-error
      resolve()
    }
  })
}
