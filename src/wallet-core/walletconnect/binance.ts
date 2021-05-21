import { crypto } from '@binance-chain/javascript-sdk'
import { SignedSend } from '@binance-chain/javascript-sdk/lib/types'
import base64js from 'base64-js'

export const BINANCE_CHAIN_ID = 'Binance-Chain-Tigris'

export const BINANCE_NETWORK_ID = 714

export interface TxParam {
  fromAddress: string
  toAddress: string
  denom: string
  amount: number
}

export const getByteArrayFromAddress = (address: string) => {
  return base64js.fromByteArray(crypto.decodeAddress(address))
}

export const buildTransferMsg = (txParam: TxParam): SignedSend => {
  const { fromAddress, toAddress, denom, amount } = txParam

  const transferMsg = {
    inputs: [
      {
        address: getByteArrayFromAddress(fromAddress),
        coins: [
          {
            denom,
            amount,
          },
        ],
      },
    ],
    outputs: [
      {
        address: getByteArrayFromAddress(toAddress),
        coins: [
          {
            denom,
            amount,
          },
        ],
      },
    ],
  }

  return transferMsg
}

export type SignRequestParam = {
  accountNumber: string
  sequence: string
  memo: string
  txParam: TxParam
}

export const getSignRequestMsg = ({
  accountNumber,
  sequence,
  memo,
  txParam,
}: SignRequestParam) => {
  const transferMsg = buildTransferMsg(txParam)

  const tx = {
    accountNumber,
    chainId: BINANCE_CHAIN_ID,
    sequence,
    memo,
    send_order: transferMsg,
  }

  return tx
}
