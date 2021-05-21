export type SupportedChain = 'ETH' | 'BNB'

export interface IAccount {
  network: number
  address: string
}

export interface IToken {
  denom: string
  amount: number
}

export interface ISendOrderMsgParam {
  fromAddress: string
  toAddress: string
  coins: IToken[]
}
