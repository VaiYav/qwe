import { IWalletConnectOptions } from '@walletconnect/types'

export type TWSupportedChain = 'ETH' | 'BNB'

export interface IAccount {
  network: number
  address: string
}

export interface IWalletConnectListeners {
  connect?: () => void
  disconnect?: () => void
  sessionRequest?: () => void
  sessionUpdate?: () => void
  callRequest?: () => void
  wcSessionRequest?: () => void
  wcSessionUpdate?: () => void
}

export interface WalletConnectOption {
  options?: IWalletConnectOptions
  listeners?: IWalletConnectListeners
}
