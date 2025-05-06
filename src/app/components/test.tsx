// import { readContracts } from '@wagmi/core'
// import { config } from './config'
// import { abi } from './abi'

// const wagmigotchiContract = {
//     address: '0x5dEcd7CA736f6Bb41304597D1D15133617a7c331',
//     abi: abi,
//   } as const

// const test = async () => {
//     const result = await readContracts(config, {
//         contracts: [
//             {
//                 ...wagmigotchiContract,
//                 functionName: 'verifyCert',
//                 args: ["0x1ddc4663d4EA70b96A05372466952755a54A5834", BigInt(0)]
//             }
//         ]
//       });

//       console.log(await result);
// }

// export default test;



import { readContract } from '@wagmi/core'
import { abi } from './abi'
import { config } from './config'

const test = async () => {
    const result = await readContract(config, {
        abi,
        address: '0xbFB014898E5f55d98136fCD3dB7964231113e5aF',
        functionName: 'verifyCert',
        args: ['0x1ddc4663d4EA70b96A05372466952755a54A5834', BigInt(5)],
      })
      return result
}

export default test;