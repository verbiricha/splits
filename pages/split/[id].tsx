import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import dynamic from 'next/dynamic'

import { getSplit } from '../../lib/splits'

import styles from '../../styles/Home.module.css'
import formStyles from '../../styles/Forms.module.css'
import splitStyles from '../../styles/Split.module.css'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return
    }

    const id = setInterval(() => savedCallback.current(), delay)

    return () => clearInterval(id)
  }, [delay])
}

const useLocation = () => {
  return typeof window !== 'undefined' ? window.location  : {}
}

const useNavigator = () => {
  return typeof window !== 'undefined' ? navigator : null
}

const Invoice = dynamic(
  () => import('../../components/Invoice'),
  { ssr: false }
)

const CopyIcon = ({...props}) => {
  return (
    <svg x="0px" y="0px" viewBox="0 0 115.77 122.88" {...props}>
      <path d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"/>
    </svg>
  )
}

// @ts-expect-error
const Split: NextPage = ({ data }) => {
  const [split, setSplit] = useState(data)
  // @ts-expect-error
  const { href, host, pathname } = useLocation()
  const { id, currency, description, invoices, amount, user, strikeUser } = split

  const splitDescription = `${description} ${description  ? '-' : ''} ${amount.toFixed(2)} ${currency}`

  useInterval(() => {
    if (!split?.paid) {
      fetch(`/api/split/${id}`)
      .then((r) => r.json())
      .then(setSplit)
      .catch((err) => console.error(err))
    }
  }, 2000)

  const invoiceComponents = invoices.map((invoice: any) => {
    const { name, quote, state } = invoice
    const paid = state === 'PAID'
    const invoiceAmount = Number(quote.targetAmount.amount).toFixed(2)
    const invoiceProps = {...quote, state}
    return (
      <div id={name} className={styles.content} key={name}>
        <p><strong>{name}</strong> {paid ? 'paid' : 'owes'} <strong><a href={`https://next.strike.me/${user}`}>{user}</a></strong> <strong>{invoiceAmount} {currency}</strong></p>
        <Invoice {...invoiceProps} />
      </div>
    )
  })
  
  const paidAmount = invoices
  // @ts-expect-error
  .filter(({ state }) => state === 'PAID')
  // @ts-expect-error
  .reduce((acc, { quote }) => acc + Number(quote.targetAmount.amount), 0)

  const unpaidAmount = invoices
  // @ts-expect-error
  .filter(({ state }) => state !== 'PAID')
  // @ts-expect-error
  .reduce((acc, { quote }) => acc + Number(quote.targetAmount.amount), 0)

  const ownerPaidAmount = amount - paidAmount
  const owed = split?.paid 
    ? ownerPaidAmount === 0 ? <p><strong>{user}</strong> received <strong>{paidAmount.toFixed(2)} {currency}</strong></p> : <p><strong>{user}</strong> paid <strong>{ownerPaidAmount.toFixed(2)} {currency}</strong></p>  
    : <p><strong>{user}</strong> paid <strong>{ownerPaidAmount.toFixed(2)} {currency}</strong> and is owed <strong>{unpaidAmount.toFixed(2)} {currency}</strong></p>

  const [isCopied, setIsCopied] = useState(false)
  const navigator = useNavigator()
  const copy = async (v: string) => {
    navigator && await navigator.clipboard.writeText(v)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Splits ⚡ - {description}</title>
        <meta name="description" content={splitDescription} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Splits
          </h1>
          <h2>{splitDescription}</h2>
        </header>
        <div className={styles.content}>
          <div className={splitStyles.shareLink} onClick={() => copy(href)}>
            <div className={splitStyles.shareLinkInput}>
              <input
                className={formStyles.input}
                disabled={true}
                style={{ width: '100%', margin: 0, cursor: 'grab' }}
                value={`${host}${pathname}`} />
            </div>
            <div>
            <button
              className={splitStyles.shareButton}
              type="button"
              onClick={() => copy(href)}>
              <CopyIcon width="20px" height="20px" />
            </button>
            {isCopied && <span className={splitStyles.shareLinkCopied}>Copied!</span>}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {owed}
        </div>

        {invoiceComponents}

      </main>
    </div>
  )
}

// @ts-expect-error
export async function getServerSideProps({ params }) {
  const { id } = params
  const split = await getSplit(id)
  return { props: { data: split } }
}

export default Split
