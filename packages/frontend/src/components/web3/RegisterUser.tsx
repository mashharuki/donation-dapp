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

export const RegisterUser: FC = () => {
  const { api, account, isConnected, signer } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.greeter)
  const [greeterMessage, setGreeterMessage] = useState<string>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const form = useForm<{ newMessage: string }>()

  if (!contract) return null

  console.log({ account })

  const registerUser = async () => {
    if (!account || !contract || !signer || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setUpdateIsLoading(true)
    try {
      // Gather form value
      const newMessage = form.getValues('newMessage')

      // Estimate gas & send transaction
      await contractTx(
        api,
        account.address,
        contract,
        'registerUser',
        {},
        [account.address, newMessage],
        (result) => {
          if (result?.status?.isInBlock) {
            setGreeterMessage(newMessage)
          }
        },
      )
      toast.success(`Successfully created proposal!`)
    } catch (e) {
      console.error(e)
      toast.error('Error while updating greeting. Try again.')
    } finally {
      setUpdateIsLoading(false)
    }
  }

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[20rem]">
        {!!isConnected && (
          <Card variant="outline" p={4}>
            <form>
              <Stack direction="column" spacing={2} align="end">
                <FormControl>
                  <FormLabel>userName</FormLabel>
                  <Input disabled={updateIsLoading} {...form.register('newMessage')} />
                </FormControl>
                <Button
                  mt={4}
                  colorScheme="purple"
                  isLoading={updateIsLoading}
                  disabled={updateIsLoading}
                  type="button"
                  onClick={registerUser}
                >
                  registerUser
                </Button>
              </Stack>
            </form>
          </Card>
        )}
      </div>
    </>
  )
}
