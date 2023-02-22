import { FC, useEffect, useState } from 'react'
import { Button, Switch, Radio } from 'antd'
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

const VoteProposal = ({ proposalId, vote }: any) => {
  const { api, account, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [voteVal, setVote] = useState(vote.yes ? 'Aye' : 'Nye')
  const [loading, setIsLoading] = useState<boolean>()
  const form = useForm<{ newMessage: string }>()

  const changeVote = async () => {
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
        'voteProposal',
        {},
        [voteVal, proposalId],
        (result) => {
          if (result?.status?.isInBlock) {
            console.log(result)
          }
        },
      )

      toast.success(`Successfully voted!`)
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
      <Radio.Group
        onChange={(e) => setVote(e.target.value)}
        value={voteVal}
        options={[
          { label: 'Aye', value: 'Aye' },
          { label: 'Nye', value: 'Nye' },
        ]}
      />
      <Button type="primary" onClick={changeVote} loading={loading}>
        Vote
      </Button>
    </>
  )
}

export default VoteProposal
