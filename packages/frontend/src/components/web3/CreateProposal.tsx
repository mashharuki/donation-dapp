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
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export const CreateProposal: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [greeterMessage, setGreeterMessage] = useState<string>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ proposal: string }>()
  const { token } = theme.useToken()

  if (!contract) return null

  const createProposal = async () => {
    if (!account || !contract || !signer || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setUpdateIsLoading(true)
    try {
      const proposal = form.getValues('proposal')

      // Estimate gas & send transaction
      await contractTx(
        api,
        account.address,
        contract,
        'createProposal',
        {},
        [proposal],
        (result) => {
          if (result?.status?.isInBlock) {
            console.log(result)
          }
        },
      )
      form.reset()
      toast.success(`Successfully created proposal!`)
    } catch (e) {
      console.error(e)
      toast.error('Error while updating greeting. Try again.')
    } finally {
      setUpdateIsLoading(false)
    }
  }

  return (
    <div
      css={css`
        border: 1px solid ${token.colorPrimary};
        max-width: 400px;
        padding: 1rem;
      `}
    >
      {Boolean(isConnected) && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <FormLabel>Create proposal</FormLabel>
          <Input
            disabled={updateIsLoading}
            onChange={(e) => {
              console.log('e.target.value', e.target.value)

              form.setValue('proposal', e.target.value)
            }}
          />
          <Button
            loading={updateIsLoading}
            disabled={updateIsLoading}
            type="primary"
            onClick={createProposal}
          >
            Create proposal
          </Button>
        </Space>
      )}
    </div>
  )
}
