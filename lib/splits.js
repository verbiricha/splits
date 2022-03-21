import date from 'date-and-time'
import { createClient } from 'redis'

import { createInvoice, getInvoice, createQuote } from './strike'

const redis = createClient({ url: process.env.REDIS_URL })
redis.on("error", (err) => { throw err })
redis.connect()

export async function createSplit(id, { user, strikeUser, currency, amount, people, description, includeOwner }) {
  const amountOfPeopleToSplit = includeOwner ? people.length + 1 : people.length
  const quantity = amount / amountOfPeopleToSplit
  const invoices = await Promise.all(people.map(async (name) => {
    const { invoiceId, ...quote } = await createInvoice({
      username: user,
      amount: { amount: String(quantity), currency },
      message: `${description} (${name})`,
    })
    return { name, invoiceId, quote }
  }))
  return { id, currency, user, strikeUser, invoices, amount, people, description }
}

export function setSplit(id, split){
  return redis.set(`splits:${id}`, JSON.stringify(split))
}

export async function getSplit(id){
  const raw = await redis.get(`splits:${id}`)
  const split = JSON.parse(raw)
  const invoices = await Promise.all(split.invoices.map(async ({ name, invoiceId, quote }) => {
    const invoice = await getInvoice(invoiceId)
    const expirationDate = Date.parse(quote.expiration)
    const now = new Date()
    if (invoice.state !== 'PAID' && expirationDate < now) {
      const newQuote = await createQuote(invoiceId)
      return { name, invoiceId, quote: newQuote, state: invoice.state }
    } else {
      return { name, invoiceId, quote, state: invoice.state }
    }
  }))
  const paid = invoices.every(({ state }) => state == 'PAID')
  await setSplit(id, {...split, invoices})
  return { ...split, invoices, paid }
}
