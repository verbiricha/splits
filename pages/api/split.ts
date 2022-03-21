import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { customAlphabet } from 'nanoid'
import { nolookalikes } from 'nanoid-dictionary'

import { createSplit, setSplit } from '../../lib/splits'
import { getUser, createInvoice, getInvoice } from '../../lib/strike'


interface Split {
}

const generateId = customAlphabet(nolookalikes, 12)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Split>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: "Method not allowed, only POST" })
    return Promise.resolve()
  }

  return new Promise(async (resolve, reject) => {
    const { user } = req.body
    try {
      const strikeUser = await getUser(user)
      const id = generateId()
      const split = await createSplit(id, {...req.body, strikeUser })
      await setSplit(id, split)
      res.status(200).json(split)
    } catch (error) {
      console.error(error)
      res.status(400).json({ error: "Error creating split" })
    } finally {
      // @ts-expect-error
      resolve()
    }
  })
}
