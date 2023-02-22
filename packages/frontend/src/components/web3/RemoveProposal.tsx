import { FC, useEffect, useState } from 'react'
import { Button, Switch, Radio } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { ContractIds } from '@deployments/deployments'
import {
  contractQuery,
  contractTx,
  unwrapResultOrError,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import 'twin.macro'

const RemoveProposal = ({ proposalId }: any) => {
  const { api, account, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [loading, setIsLoading] = useState<boolean>()

  const changeVote = async () => {
    if (!account || !contract || !signer || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setIsLoading(true)

    try {
      await contractTx(
        api,
        account.address,
        contract,
        'removeActiveProposal',
        {},
        [proposalId],
        (result) => {
          if (result?.status?.isInBlock) {
            console.log(result)
          }
        },
      )

      toast.success(`Successfully removed!`)
    } catch (e) {
      console.error(e)
      toast.error('Error while updating greeting. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!contract) return null

  return (
    <>
      <Button type="primary" onClick={changeVote} loading={loading} icon={<DeleteOutlined />} />
    </>
  )
}

export default RemoveProposal
