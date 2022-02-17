import Head from 'next/head'

import styles from '../styles/Home.module.css'

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Splits ⚡</title>
        <meta name="description" content="Split bills with your friends, instantly" />
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
          <h2>Split bills with your friends, instantly</h2>
        </header>
        {children}
      </main>
    </div>
  )
}

export default Layout
