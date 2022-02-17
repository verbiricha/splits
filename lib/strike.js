import axios from 'axios'

const STRIKE_API_URL = process.env.STRIKE_API_URL
const STRIKE_API_KEY = process.env.STRIKE_API_KEY

const api = axios.create({
  baseURL: STRIKE_API_URL,
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${STRIKE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export async function getInvoice(invoiceId) {
  const { data } = await api.get(`/invoices/${invoiceId}`)
  return data
}

export async function getUser(username) {
  const { data } = await api.get(`/accounts/handle/${username}/profile`)
  return data
}

export async function createQuote(invoiceId) {
  const { data } = await api.post(`/invoices/${invoiceId}/quote`);
  return data
}

export async function createInvoice({
  amount,
  username,
  message,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { invoiceId },
      } = await api.post(`/invoices/handle/${username}`, {
        amount: amount,
        description: message ? `splits - ${message}` : "splits",
      });

      const quote = await createQuote(invoiceId);

      const responsePayload = {
        invoiceId,
        ...quote,
      };
      resolve(responsePayload);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
