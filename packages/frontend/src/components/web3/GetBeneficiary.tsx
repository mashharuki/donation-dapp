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

export const GetBeneficiary: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [beneficiary, setBeneficiary] = useState<Array<any>>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()

  const getBeneficiary = async () => {
    if (!contract || !api) return
    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'getBeneficiary')
      const message = unwrapResultOrError<Array<any>>(result)
      setBeneficiary(message)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching get beneficiary. Try again…')
      setBeneficiary(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }

  useEffect(() => {
    getBeneficiary()
  }, [contract])

  if (!contract) return null

  return (
    <>
      <Button
        type="primary"
        loading={updateIsLoading}
        disabled={updateIsLoading}
        onClick={getBeneficiary}
      >
        Get beneficiary
      </Button>
      <Divider type="vertical" />
      {beneficiary}
    </>
  )
}
