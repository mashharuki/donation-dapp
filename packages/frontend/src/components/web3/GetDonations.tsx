import { Descriptions, Button, Divider, Table } from 'antd'
import { ContractIds } from '@deployments/deployments'
import {
  contractQuery,
  contractTx,
  unwrapResultOrError,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const columns = [
  {
    title: 'Account',
    dataIndex: 'account',
    key: 'account',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
]

export const GetDonations: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [donations, setDonations] = useState<Array<any>>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ newMessage: string }>()

  const getDonations = async () => {
    if (!contract || !api) return
    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'getDonations')
      const message = unwrapResultOrError<Array<any>>(result)
      setDonations(message)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching donations. Try again…')
      setDonations(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }

  useEffect(() => {
    getDonations()
  }, [contract])

  if (!contract) return null

  return (
    <>
      <Button
        type="primary"
        loading={updateIsLoading}
        disabled={updateIsLoading}
        onClick={getDonations}
      >
        Get donations
      </Button>
      <Divider type="vertical" />
      <Table dataSource={donations} columns={columns} />
    </>
  )
}
