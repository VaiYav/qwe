import { useMemo } from 'react'

import { Asset, Amount, AssetAmount, NetworkFee } from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'

import { getGasRateByChain } from 'helpers/networkFee'

import useInterval from './useInterval'

const POLL_GAS_RATE_INTERVAL = 10 * 1000

export const useNetworkFee = ({
  inputAsset,
  outputAsset,
}: {
  inputAsset: Asset
  outputAsset?: Asset
}) => {
  const { inboundData, getInboundData, pools } = useMidgard()

  useInterval(() => {
    getInboundData()
  }, POLL_GAS_RATE_INTERVAL)

  const inboundFee = useMemo(() => {
    const gasRate = getGasRateByChain({ inboundData, chain: inputAsset.chain })
    const networkFee = NetworkFee.getNetworkFeeByAsset({
      asset: inputAsset,
      gasRate,
      direction: 'inbound',
    })

    return networkFee
  }, [inputAsset, inboundData])

  const outboundFee = useMemo(() => {
    if (!outputAsset) return null

    const gasRate = getGasRateByChain({ inboundData, chain: outputAsset.chain })
    const networkFee = NetworkFee.getNetworkFeeByAsset({
      asset: outputAsset,
      gasRate,
      direction: 'outbound',
    })

    return networkFee
  }, [outputAsset, inboundData])

  const totalFee = useMemo(() => {
    if (!outboundFee || !inboundFee.asset.eq(inputAsset)) return inboundFee

    const outboundFeeInSendAsset = new AssetAmount(
      inputAsset,
      Amount.fromAssetAmount(
        outboundFee.totalPriceIn(inputAsset, pools).price,
        inputAsset.decimal,
      ),
    )

    return inboundFee.add(outboundFeeInSendAsset)
  }, [inputAsset, inboundFee, outboundFee, pools])

  return {
    totalFee,
    inboundFee,
    outboundFee,
  }
}
