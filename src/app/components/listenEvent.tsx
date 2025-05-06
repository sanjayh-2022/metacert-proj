// import { getTransactionReceipt } from '@wagmi/core'
import { useTransactionReceipt } from 'wagmi'
import { config } from './config'

const ListenEvent = () => {
  const t = useTransactionReceipt({
    hash: `0x4479a29476e18aa9e273fcad63a73b1fd31ec1a7069f5125a94b0e992c7d85a6`,
  })

  console.log(t)
}

export default ListenEvent
