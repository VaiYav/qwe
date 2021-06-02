import { parseUnits } from '@ethersproject/units'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import {
  Client as EthClient,
  estimateDefaultFeesWithGasPricesAndLimits,
} from '@xchainjs/xchain-ethereum'
import BigNumber from 'bignumber.js'

/**
 *
 * @param client ethereum client
 * @param feeRate optional fee rate
 * @param feeOptionKey average | fast | fastest
 * @returns gas price based on feeOptionKey
 */
export const getGasPrice = async ({
  client,
  feeRate,
  feeOptionKey = 'fast',
  decimal,
}: {
  client: EthClient
  feeRate?: number
  feeOptionKey?: FeeOptionKey
  decimal?: number
}): Promise<string> => {
  if (feeRate) return parseUnits(String(feeRate), 'gwei').toString()

  let gasPriceAmount: BigNumber

  try {
    const gasPrices = await client.estimateGasPrices()
    gasPriceAmount = gasPrices[feeOptionKey].amount()
  } catch {
    gasPriceAmount = estimateDefaultFeesWithGasPricesAndLimits().gasPrices[
      feeOptionKey
    ].amount()
  }

  return decimal ? gasPriceAmount.toFixed(decimal) : gasPriceAmount.toFixed()
}
