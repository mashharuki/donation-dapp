import { Descriptions, Badge } from 'antd'
import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
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

export const GetAllUsers: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [data, setData] = useState<Array<any>>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ newMessage: string }>()

  const getAllUsers = async () => {
    if (!contract || !api) return
    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'getAllUsers')
      const message = unwrapResultOrError<Array<any>>(result)
      setData(message)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching getAllUsers. Try again…')
      setData(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }

  useEffect(() => {
    getAllUsers()
  }, [contract])

  if (!contract) return null

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[40rem]">
        <Card variant="outline" p={4}>
          <Button
            mt={4}
            colorScheme="purple"
            isLoading={updateIsLoading}
            disabled={updateIsLoading}
            type="button"
            onClick={getAllUsers}
          >
            getAllUsers
          </Button>
        </Card>

        {data?.map((user, i) => {
          return (
            <Descriptions key={i} title={user.userName}>
              <Descriptions.Item label="userName">{user.userName}</Descriptions.Item>
              <Descriptions.Item label="userAccount">{user.userAccount}</Descriptions.Item>
            </Descriptions>
          )
        })}
      </div>
    </>
  )
}
