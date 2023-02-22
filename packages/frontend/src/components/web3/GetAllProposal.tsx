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
import 'twin.macro'

import ChangeProposalStatus from './ChangeProposalStatus'
import VoteProposal from './VoteProposal'
import RemoveProposal from './RemoveProposal'

export const GetAllProposal: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [proposals, setProposals] = useState<Array<any>>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ newMessage: string }>()

  // Fetch Greeting
  const getAllProposal = async () => {
    if (!contract || !api) return
    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'getAllProposal')
      const message = unwrapResultOrError<Array<any>>(result)
      setProposals(message)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching greeting. Try again…')
      setProposals(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }

  useEffect(() => {
    getAllProposal()
  }, [contract])

  console.log('proposals', proposals)

  if (!contract) return null

  return (
    <>
      <Button
        type="primary"
        loading={updateIsLoading}
        disabled={updateIsLoading}
        onClick={getAllProposal}
      >
        getAllProposal
      </Button>
      <Divider />

      {proposals
        ?.map((proposal, i) => {
          return (
            <div key={i}>
              <Descriptions bordered>
                <Descriptions.Item label="Proposal Name">{proposal.proposalName}</Descriptions.Item>
                <Descriptions.Item label="Proposal Status">
                  <ChangeProposalStatus proposalId={i} status={proposal.proposalStatus} />
                </Descriptions.Item>
                <Descriptions.Item label="Total Vote">{proposal.totalVote}</Descriptions.Item>
                <Descriptions.Item label="Vote">
                  <VoteProposal
                    proposalId={i}
                    vote={{
                      yes: proposal.voteAye,
                      no: proposal.voteNey,
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Actions">
                  <RemoveProposal proposalId={proposal?.id} />
                </Descriptions.Item>
              </Descriptions>
              <Divider />
            </div>
          )
        })
        ?.reverse()}
    </>
  )
}
