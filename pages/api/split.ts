import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { nanoid } from 'nanoid'
import { createSplit, setSplit } from '../../lib/splits'
import { getUser, createInvoice, getInvoice } from '../../lib/strike'


interface Split {
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Split>
) {
  if (req.method !== 'POST') {
    res.status(405).json()
    return Promise.resolve()
  }

  return new Promise(async (resolve, reject) => {
    const { user } = req.body
    try {
      const strikeUser = await getUser(user)
      const id = nanoid()
      const split = await createSplit(id, {...req.body, strikeUser })
      await setSplit(id, split)
      res.status(200).json(split)
    } catch (error) {
      console.error(error)
      res.status(400).json({ error: "Error creating split" })
    } finally {
      resolve()
    }
  })
}
