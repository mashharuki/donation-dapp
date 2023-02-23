import { Button, Input, theme } from 'antd'
import { css } from '@emotion/react'
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

export const ChangeBeneficiary: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ beneficiary: string }>()
  const { token } = theme.useToken()

  if (!contract) return null

  const changeBeneficiary = async () => {
    if (!account || !contract || !signer || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setUpdateIsLoading(true)
    try {
      const beneficiary = form.getValues('beneficiary')

      await contractTx(
        api,
        account.address,
        contract,
        'changeBeneficiary',
        {},
        [beneficiary],
        (result) => {
          if (result?.status?.isInBlock) {
            console.log(result)
          }
        },
      )
      form.reset()
      toast.success(`Successfully changed beneficiary to ${beneficiary}`)
    } catch (e) {
      console.error(e)
      toast.error('Error while changing beneficiary')
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
        width: 500px;
        padding: 1rem;
      `}
    >
      {Boolean(isConnected) && (
        <>
          <Input
            disabled={updateIsLoading}
            placeholder="Account ID"
            onChange={(e) => {
              form.setValue('beneficiary', e.target.value)
            }}
          />
          <Button
            loading={updateIsLoading}
            disabled={updateIsLoading}
            type="primary"
            onClick={changeBeneficiary}
          >
            Change beneficiary
          </Button>
        </>
      )}
    </div>
  )
}
