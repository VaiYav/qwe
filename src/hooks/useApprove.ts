import { useEffect, useState, useMemo } from 'react'

import { Asset, hasConnectedWallet } from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'
import { TxTrackerStatus } from 'redux/midgard/types'
import { useWallet } from 'redux/wallet/hooks'

import { multichain } from 'services/multichain'

export const useApprove = (asset: Asset, hasWallet = true) => {
  const { approveStatus } = useMidgard()
  const { wallet } = useWallet()
  const [isApproved, setApproved] = useState<boolean | null>(
    hasWallet ? null : true,
  )

  const isWalletConnected = useMemo(() => hasConnectedWallet(wallet), [wallet])

  useEffect(() => {
    if (!hasWallet || !isWalletConnected) {
      setApproved(true)
      return
    }

    const checkApproved = async () => {
      if (approveStatus?.[asset.toString()] === TxTrackerStatus.Success) {
        setApproved(true)
      }
      const approved = await multichain.isAssetApproved(asset)
      setApproved(approved)
    }

    checkApproved()
  }, [asset, approveStatus, hasWallet, isWalletConnected])

  const assetApproveStatus = useMemo(() => approveStatus?.[asset.toString()], [
    approveStatus,
    asset,
  ])

  return {
    assetApproveStatus,
    isApproved,
  }
}
