import { Descriptions, Button, Divider } from 'antd'
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

export const GetTotalRaised: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [totalRaised, setTotalRaised] = useState<Array<any>>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ newMessage: string }>()

  const getTotalRaised = async () => {
    if (!contract || !api) return
    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'getTotalRaised')
      const message = unwrapResultOrError<Array<any>>(result)
      setTotalRaised(message)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching getAllProposal. Try again…')
      setTotalRaised(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }

  useEffect(() => {
    getTotalRaised()
  }, [contract])

  if (!contract) return null

  return (
    <>
      <Button
        type="primary"
        loading={updateIsLoading}
        disabled={updateIsLoading}
        onClick={getTotalRaised}
      >
        getTotalRaised
      </Button>
      <Divider />
      {totalRaised}
    </>
  )
}
