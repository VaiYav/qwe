import { FeeOptionKey, TxHash } from '@xchainjs/xchain-client'
import {
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
} from '@xchainjs/xchain-util'

import { AssetAmount, Pool, Percent } from '../entities'

export type Network = 'testnet' | 'mainnet'

export type TxParams = {
  assetAmount: AssetAmount
  recipient: string
  memo?: string
  feeOptionKey?: FeeOptionKey
  feeRate?: number
}

export type MultiSendParams = {
  assetAmount1: AssetAmount
  assetAmount2: AssetAmount
  recipient: string
  memo?: string
}

export type AddLiquidityParams = {
  pool: Pool
  runeAmount?: AssetAmount
  assetAmount?: AssetAmount
}

export type AddLiquidityTxns = {
  runeTx?: TxHash
  assetTx?: TxHash
}

export type LPType = 'sym' | 'rune' | 'asset'

export type WithdrawParams = {
  pool: Pool
  percent: Percent
  from: LPType
  to: LPType
}

// note only supported chains
export const SUPPORTED_CHAINS = [
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
] as const
export type SupportedChain = typeof SUPPORTED_CHAINS[number]

// ledger supported chains
export const LEDGER_SUPPORTED_CHAINS = [
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
  LTCChain,
  BCHChain,
] as const

export type ApproveParams = {
  spender: string
  sender: string
  feeOptionKey?: FeeOptionKey
}

export type DepositParams = TxParams & {
  router: string
}

export type UpgradeParams = {
  runeAmount: AssetAmount
  recipient: string
}

export enum WalletOption {
  'KEYSTORE' = 'KEYSTORE',
  'XDEFI' = 'XDEFI',
  'METAMASK' = 'METAMASK',
  'TRUSTWALLET' = 'TRUSTWALLET',
  'LEDGER' = 'LEDGER',
}

export type ChainWallet = {
  address: string
  balance: AssetAmount[]
  walletType: WalletOption
}

export type Wallet = Record<SupportedChain, ChainWallet | null>
