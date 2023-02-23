import { Divider, Space } from 'antd'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

import { GetTotalRaised } from '@components/web3/GetTotalRaised'
import { GetBeneficiary } from '@components/web3/GetBeneficiary'
import { Donate } from '@components/web3/Donate'
import { ChangeBeneficiary } from '@components/web3/ChangeBeneficiary'

const HomePage: NextPage = () => {
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <Space>
        <Donate />
        <Divider type="vertical" />
        <ChangeBeneficiary />
      </Space>
      <Divider />
      <GetTotalRaised />
      <Divider />
      <GetBeneficiary />
    </>
  )
}

export default HomePage
