// import { crypto } from '@binance-chain/javascript-sdk'
// import base64js from 'base64-js'

import { ISendOrderMsgParam } from './types'

// export const getByteArrayFromAddress = (address: string) => {
//   return base64js.fromByteArray(crypto.decodeAddress(address))
// }

export const getSendOrderMsg = (sendOrderMsgParam: ISendOrderMsgParam) => {
  const { fromAddress, toAddress, coins } = sendOrderMsgParam

  const sortedCoins = coins
    .sort((a, b) => a.denom.localeCompare(b.denom))
    .filter((token) => token.amount > 0)

  if (!sortedCoins.length) return null

  const sendOrderMsg = {
    inputs: [
      {
        address: fromAddress,
        coins: sortedCoins,
      },
    ],
    outputs: [
      {
        address: toAddress,
        coins: sortedCoins,
      },
    ],
  }

  return sendOrderMsg
}
