import { ledger, crypto } from '@binance-chain/javascript-sdk'

import { LEDGER_CONNECT_TIMEOUT } from '../constants'
import { getPrefix } from './utils'

export const BINANCE_DERIVATION_PATH = [44, 714, 0, 0, 0]

export class BinanceLedger {
  private prefix: string

  public derivationPath: number[] = BINANCE_DERIVATION_PATH

  constructor(addressIndex = 0) {
    // enable ledger for only mainnet
    this.prefix = getPrefix('mainnet')

    this.derivationPath[4] = addressIndex
  }

  connect = async (): Promise<string> => {
    const transport = await ledger.transports.u2f.create(LEDGER_CONNECT_TIMEOUT)

    // eslint-disable-next-line new-cap
    const app = new ledger.app(transport, 100000, 100000)

    const version = await app.getVersion()
    console.log('ledger get version: ', version)

    // get public key

    const { pk } = await app.getPublicKey(this.derivationPath)

    // get address from pubkey
    const address = crypto.getAddressFromPublicKey(pk, this.prefix)
    console.log('ledger get address: ', address)

    // confirm address from ledger
    await app.showAddress(this.prefix, this.derivationPath)
    console.log('ledger confirmed address: ', address)

    return address
  }
}
