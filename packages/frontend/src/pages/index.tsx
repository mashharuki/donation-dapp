import { Divider, Tabs, TabsProps } from 'antd'

import { GetAllProposal } from '@components/web3/GetAllProposal'
import { GetAllUsers } from '@components/web3/GetAllUsers'
import { CreateProposal } from '@components/web3/CreateProposal'
import { RegisterUser } from '@components/web3/RegisterUser'

import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'

const items: TabsProps['items'] = [
  {
    key: '1',
    label: `Proposals`,
    children: (
      <>
        <Divider />
        <CreateProposal />
        <Divider />
        <GetAllProposal />
      </>
    ),
  },
  {
    key: '2',
    label: `Users`,
    children: (
      <>
        <Divider />
        <RegisterUser />
        <Divider />
        <GetAllUsers />
        <Divider />
      </>
    ),
  },
]

const HomePage: NextPage = () => {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  )
}

export default HomePage
