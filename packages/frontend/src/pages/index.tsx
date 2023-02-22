import { Divider, Tabs, TabsProps } from 'antd'

import { GetTotalRaised } from '@components/web3/GetTotalRaised'
import { Donate } from '@components/web3/Donate'

import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

const HomePage: NextPage = () => {
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <Donate />
      <Divider />
      <GetTotalRaised />
    </>
  )
}

export default HomePage
