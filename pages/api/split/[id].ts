import type { NextApiRequest, NextApiResponse } from 'next'

import { getSplit } from '../../../lib/splits'

interface Split {
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Split>
) {
  return new Promise(async (resolve, reject) => {
    const { id } = req.query
    try {
      const split = await getSplit(id)
      res.status(200).json(split)
    } catch (error) {
      console.error(error)
      res.status(404).json({ error: "Split not found" })
    } finally {
      resolve()
    }
  })
}
