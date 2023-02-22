import { FC, useEffect, useState } from 'react'
import { Descriptions, Switch } from 'antd'
import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
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

const ChangeProposalStatus = ({ proposalId, status }: any) => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [checked, setChecked] = useState(status)
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [loading, setIsLoading] = useState<boolean>()
  const form = useForm<{ newMessage: string }>()

  const changeProposalStatus = async () => {
    if (!account || !contract || !signer || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setIsLoading(true)
    try {
      // Estimate gas & send transaction
      await contractTx(
        api,
        account.address,
        contract,
        'changeProposalStatus',
        {},
        [proposalId],
        (result) => {
          if (result?.status?.isFinalized) {
            setIsLoading(false)
            result.events.forEach(({ event: { data } }) => {
              if (String(data.method) == 'ExtrinsicFailed') {
                return toast.error('Error while changing proposal status.')
              } else if (String(data.method) == 'ExtrinsicSuccess') {
                setChecked(!checked)
                return toast.success('Successfully changed proposal status!')
              }
            })
          }
        },
      )
    } catch (e) {
      console.error(e)
      toast.error('Error while changing proposal status.')
    }
  }

  if (!contract) return null

  return (
    <Switch
      checked={checked}
      loading={loading}
      checkedChildren="true"
      unCheckedChildren="false"
      onChange={changeProposalStatus}
    />
  )
}

export default ChangeProposalStatus
