import QR from './QR'
import styles from './Invoice.module.css'

const Invoice = ({ quoteId, lnInvoice, expiration, expirationInSec, state }) => {
  const isPaid = state === 'PAID'
  const expirationDate = Date.parse(expiration) 
  const now = new Date()
  const isExpired = expirationDate < now

  return (
    <div key={quoteId} className={styles.invoice}>
      {!isPaid &&
        <a href={"lightning:" + lnInvoice}>
          <QR
            color="#BADA55"
            data={lnInvoice}
            expired={isExpired}
            animationDuration={expirationInSec}
          />
        </a>
      }
    </div>
  )
}

export default Invoice
