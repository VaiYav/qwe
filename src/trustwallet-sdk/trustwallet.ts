import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { IConnector, IWalletConnectOptions } from '@walletconnect/types'

import { networkByChain, supportedNetworks, errorCodes } from './constants'
import { IAccount, SupportedChain } from './types'

export class TrustWalletClient {
  public connector: IConnector | undefined

  public accounts: IAccount[] = []

  private options: IWalletConnectOptions | undefined

  constructor(options?: IWalletConnectOptions) {
    this.connector = undefined
    this.options = options
  }

  get connected() {
    if (this.connector) {
      return this.connector.connected
    }
    return false
  }

  public connect = async (): Promise<IConnector> => {
    const options: IWalletConnectOptions = {
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: QRCodeModal,
      ...this.options,
    }

    // create new connector
    const connector = new WalletConnect(options)

    await connector.connect()
    this.connector = connector

    return connector
  }

  public getAccounts = async (): Promise<IAccount[]> => {
    if (!this.connector) {
      throw new Error(errorCodes.ERROR_SESSION_DISCONNECTED)
    }

    const accounts: IAccount[] = await this.connector.sendCustomRequest({
      jsonrpc: '2.0',
      method: 'get_accounts',
    })

    const supportedAccounts = accounts.filter((account) =>
      supportedNetworks.includes(account.network),
    )

    this.accounts = supportedAccounts

    return supportedAccounts
  }

  public getAddressByChain = (chain: SupportedChain): string => {
    const selectedAccount = this.accounts.find(
      (item) => item.network === networkByChain[chain],
    )

    if (!selectedAccount) {
      throw new Error(errorCodes.ERROR_CHAIN_NOT_SUPPORTED)
    }

    return selectedAccount.address
  }

  public trustSignTransaction = async (
    network: number,
    transaction: any,
  ): Promise<any> => {
    if (!this.connector) {
      throw new Error(errorCodes.ERROR_SESSION_DISCONNECTED)
    }

    return this.connector.sendCustomRequest({
      jsonrpc: '2.0',
      method: 'trust_signTransaction',
      params: [
        {
          network,
          transaction: JSON.stringify(transaction),
        },
      ],
    })
  }

  public killSession = async (): Promise<void> => {
    if (this.connector) {
      await this.connector.killSession()
    }
  }
}
