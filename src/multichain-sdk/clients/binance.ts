import {
  Client as BncClient,
  MultiTransfer,
  Network,
} from '@xchainjs/xchain-binance'
import {
  TxHash,
  Balance,
  TxParams as ClientTxParams,
} from '@xchainjs/xchain-client'
import {
  baseAmount,
  Chain,
  BNBChain,
  assetToString,
  baseToAsset,
} from '@xchainjs/xchain-util'
import { BinanceLedger } from 'wallet-core/ledger/binance'
import {
  WalletConnectClient,
  getSignRequestMsg,
  BINANCE_NETWORK_ID,
} from 'wallet-core/walletconnect'

import { XdefiClient } from '../../xdefi-sdk'
import { AmountType, Amount, Asset, AssetAmount } from '../entities'
import { IClient } from './client'
import { TxParams, MultiSendParams, WalletOption } from './types'

export interface IBnbChain extends IClient {
  getClient(): BncClient
  multiSend(params: MultiSendParams): Promise<TxHash>
}

export class BnbChain implements IBnbChain {
  private balances: AssetAmount[] = []

  private client: BncClient

  private ledgerClient: BinanceLedger | null = null

  public readonly chain: Chain

  public walletType: WalletOption | null

  constructor({ network = 'testnet' }: { network?: Network }) {
    this.chain = BNBChain
    this.client = new BncClient({
      network,
    })
    this.walletType = null
  }

  /**
   * get xchain-binance client
   */
  getClient(): BncClient {
    return this.client
  }

  get balance() {
    return this.balances
  }

  connectKeystore = (phrase: string) => {
    this.client = new BncClient({
      network: this.client.getNetwork(),
      phrase,
    })
    this.walletType = WalletOption.KEYSTORE
  }

  disconnect = () => {
    this.client.purgeClient()
    this.walletType = null
    this.ledgerClient = null
  }

  connectLedger = async (addressIndex = 0) => {
    this.ledgerClient = new BinanceLedger(addressIndex)

    const address = await this.ledgerClient.connect()

    await this.client.getBncClient().initChain()

    // patch getAddress method with ledger address
    this.client.getAddress = () => address

    this.walletType = WalletOption.LEDGER
  }

  connectXdefiWallet = async (xdefiClient: XdefiClient) => {
    if (!xdefiClient) throw Error('xdefi client not found')

    /**
     * 1. load chain provider
     * 2. patch getAddress method
     * 3. patch transfer method
     */
    xdefiClient.loadProvider(BNBChain)

    const address = await xdefiClient.getAddress(BNBChain)
    this.client.getAddress = () => address

    const transfer = async (txParams: ClientTxParams) => {
      const { asset, amount, recipient, memo } = txParams

      if (!asset) throw Error('invalid asset to transfer')

      const txHash = await xdefiClient.transfer({
        asset: assetToString(asset),
        amount: amount.amount().toNumber(),
        decimal: amount.decimal,
        recipient,
        memo,
      })

      return txHash
    }

    this.client.transfer = transfer

    this.walletType = WalletOption.XDEFI
  }

  connectTrustWallet = async (walletconnectClient: WalletConnectClient) => {
    if (!walletconnectClient) throw Error('trustwallet client not found')

    const address = walletconnectClient.getAddressByChain(BNBChain)

    if (!address) throw Error('bnb address not found')

    this.walletType = WalletOption.TRUSTWALLET

    // patch getAddress method with walletconnect address
    this.client.getAddress = () => address

    const bncClient = this.client.getBncClient()

    this.client.transfer = async (txParams: ClientTxParams) => {
      const { asset, amount, recipient, memo = '' } = txParams

      if (!asset) throw Error('invalid asset')

      const account = await bncClient.getAccount(address)
      if (!account) throw Error('invalid account')

      const accountNumber = account.result.account_number.toString()
      const sequence = account.result.sequence.toString()
      const txParam = {
        fromAddress: address,
        toAddress: recipient,
        denom: asset?.symbol,
        amount: amount.amount().toNumber(),
      }

      // get tx signing msg
      const signRequestMsg = getSignRequestMsg({
        accountNumber,
        sequence,
        memo,
        txParam,
      })

      // request tx signing to walletconnect
      const signedTx = await walletconnectClient.signCustomTransaction({
        network: BINANCE_NETWORK_ID,
        tx: signRequestMsg,
      })

      // broadcast raw tx
      const res = await bncClient.sendRawTransaction(signedTx, true)

      // return tx hash
      return res?.result[0]?.hash
    }
  }

  loadBalance = async (): Promise<AssetAmount[]> => {
    try {
      const balances: Balance[] = await this.client.getBalance()

      this.balances = balances.map((data: Balance) => {
        const { asset, amount } = data

        const assetObj = new Asset(asset.chain, asset.symbol)
        const amountObj = new Amount(
          amount.amount(),
          AmountType.BASE_AMOUNT,
          assetObj.decimal,
        )

        return new AssetAmount(assetObj, amountObj)
      })

      return this.balances
    } catch (error) {
      return Promise.reject(error)
    }
  }

  hasAmountInBalance = async (assetAmount: AssetAmount): Promise<boolean> => {
    try {
      await this.loadBalance()

      const assetBalance = this.balances.find((data: AssetAmount) =>
        data.asset.eq(assetAmount.asset),
      )

      if (!assetBalance) return false

      return assetBalance.amount.gte(assetAmount.amount)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getAssetBalance = async (asset: Asset): Promise<AssetAmount> => {
    try {
      await this.loadBalance()

      const assetBalance = this.balances.find((data: AssetAmount) =>
        data.asset.eq(asset),
      )

      if (!assetBalance)
        return new AssetAmount(asset, Amount.fromAssetAmount(0, asset.decimal))

      return assetBalance
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * transfer on binance chain
   * @param {TxParams} tx transfer parameter
   */
  transfer = async (tx: TxParams): Promise<TxHash> => {
    // use xchainjs-client standard internally
    try {
      const { assetAmount, recipient, memo } = tx
      const { asset } = assetAmount
      const amount = baseAmount(assetAmount.amount.baseAmount, asset.decimal)

      // delegate signing to ledger app
      if (this.walletType === WalletOption.LEDGER) {
        if (!this.ledgerClient) throw new Error('ledger not connected')

        const { ledgerClient } = this
        const ledgerApp = ledgerClient.getLedgerApp()

        this.client.getBncClient().useLedgerSigningDelegate(
          ledgerApp,
          () => {
            // ledger pre sign
            console.log('presign request')
          },
          () => {
            // ledger verify success
            console.log('ledger signing success')
          },
          () => {
            // ledger verify failed
          },
          ledgerClient.derivationPath,
        )

        const transferResult = await this.client
          .getBncClient()
          .transfer(
            this.client.getAddress(),
            recipient,
            baseToAsset(amount).amount().toString(),
            asset.symbol,
            memo,
          )

        return transferResult.result.map(
          (txResult: { hash?: TxHash }) => txResult?.hash ?? '',
        )[0]
      }

      return await this.client.transfer({
        asset: asset.getAssetObj(),
        amount,
        recipient,
        memo,
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * multiSend on binance chain
   * @param {MultiSendParams} params transfer parameter
   */
  multiSend = async (params: MultiSendParams): Promise<TxHash> => {
    // use xchainjs-client standard internally
    try {
      const { assetAmount1, assetAmount2, recipient, memo } = params

      const transactions: MultiTransfer[] = [
        {
          to: recipient,
          coins: [
            {
              asset: assetAmount1.asset.getAssetObj(),
              amount: baseAmount(
                assetAmount1.amount.baseAmount,
                assetAmount1.asset.decimal,
              ),
            },
            {
              asset: assetAmount2.asset.getAssetObj(),
              amount: baseAmount(
                assetAmount2.amount.baseAmount,
                assetAmount2.asset.decimal,
              ),
            },
          ],
        },
      ]

      return await this.client.multiSend({
        transactions,
        memo,
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
