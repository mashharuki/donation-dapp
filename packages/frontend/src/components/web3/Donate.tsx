import { Button, Input, theme, Space } from 'antd'
import { css } from '@emotion/react'
import { FormControl, FormLabel } from '@chakra-ui/react'
import { ContractIds } from '@deployments/deployments'
import {
  contractQuery,
  contractTx,
  unwrapResultOrError,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export const Donate: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ amount: string }>()
  const { token } = theme.useToken()

  if (!contract) return null

  const createProposal = async () => {
    if (!account || !contract || !signer || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setUpdateIsLoading(true)
    try {
      const amount = form.getValues('amount')

      // Estimate gas & send transaction
      await contractTx(
        api,
        account.address,
        contract,
        'donate',
        {
          value: amount,
        },
        [],
        (result) => {
          if (result?.status?.isInBlock) {
            console.log(result)
          }
        },
      )
      form.reset()
      toast.success(`Successfully donated ${amount}`)
    } catch (e) {
      console.error(e)
      toast.error('Error while donating. Try again…')
    } finally {
      setUpdateIsLoading(false)
    }
  }

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 1rem;
        border: 1px solid ${token.colorPrimary};
        max-width: 400px;
        padding: 1rem;
      `}
    >
      {Boolean(isConnected) && (
        <>
          <Input
            disabled={updateIsLoading}
            placeholder="Amount"
            type="number"
            onChange={(e) => {
              form.setValue('amount', e.target.value)
            }}
          />
          <Button
            loading={updateIsLoading}
            disabled={updateIsLoading}
            type="primary"
            onClick={createProposal}
          >
            Donate
          </Button>
        </>
      )}
    </div>
  )
}
