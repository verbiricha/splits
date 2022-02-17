import type { NextPage } from 'next'

import Layout from '../components/Layout'
import CreateSplit from '../components/CreateSplit'

const Home: NextPage = () => {
  return (
    <Layout>
      <CreateSplit />
    </Layout>
  )
}

export default Home
