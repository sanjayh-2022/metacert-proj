import { useWriteContract, useReadContract } from 'wagmi'
import { abi } from './abi'

import test from './test'

import listenEvent from './listenEvent'


 
export function MintNFT() {
  const { data: hash, writeContract } = useWriteContract()

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xbFB014898E5f55d98136fCD3dB7964231113e5aF',
      abi,
      functionName: 'registerIssuer',
      args: ["testName", "testAddress", BigInt(123), BigInt(1)],
    });
    test();
    listenEvent();
  } 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button type="submit">Mint</button>
      {hash && <div>Transaction Hash: {hash}</div>}
    </form>
  )
}