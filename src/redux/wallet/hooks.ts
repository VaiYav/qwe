import { useCallback } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { Keystore } from '@xchainjs/xchain-crypto'
import { Chain, ETHChain } from '@xchainjs/xchain-util'
import { SupportedChain } from 'multichain-sdk'

import { RootState } from 'redux/store'
import * as walletActions from 'redux/wallet/actions'
import { actions } from 'redux/wallet/slice'

import { multichain } from 'services/multichain'

export const useWallet = () => {
  const dispatch = useDispatch()

  const walletState = useSelector((state: RootState) => state.wallet)

  const { walletLoading, chainWalletLoading } = walletState
  const walletLoadingByChain = Object.keys(chainWalletLoading).map(
    (chain) => chainWalletLoading[chain as SupportedChain],
  )
  const isWalletLoading = walletLoadingByChain.reduce(
    (status, next) => status || next,
    walletLoading,
  )

  const unlockWallet = useCallback(
    async (keystore: Keystore, phrase: string) => {
      // set multichain phrase
      multichain.connectKeystore(phrase)

      dispatch(actions.connectKeystore(keystore))
      dispatch(walletActions.loadAllWallets())
    },
    [dispatch],
  )

  const disconnectWallet = useCallback(() => {
    multichain.resetClients()

    dispatch(actions.disconnect())
  }, [dispatch])

  const connectLedger = useCallback(
    async (chain: Chain) => {
      await multichain.connectLedger({ chain })

      dispatch(walletActions.getWalletByChain(chain as SupportedChain))
    },
    [dispatch],
  )

  const connectXdefiWallet = useCallback(async () => {
    await multichain.connectXDefiWallet()

    dispatch(walletActions.loadAllWallets())
  }, [dispatch])

  const connectMetamask = useCallback(async () => {
    await multichain.connectMetamask()

    dispatch(walletActions.getWalletByChain(ETHChain))
  }, [dispatch])

  const connectTrustWallet = useCallback(async () => {
    await multichain.connectTrustWallet({
      listeners: {
        disconnect: disconnectWallet,
      },
    })

    dispatch(walletActions.getWalletByChain('BNB'))
    dispatch(walletActions.getWalletByChain('ETH'))
  }, [dispatch, disconnectWallet])

  const setIsConnectModalOpen = useCallback(
    (visible: boolean) => {
      dispatch(actions.setIsConnectModalOpen(visible))
    },
    [dispatch],
  )

  return {
    ...walletState,
    ...walletActions,
    isWalletLoading,
    unlockWallet,
    setIsConnectModalOpen,
    disconnectWallet,
    connectXdefiWallet,
    connectMetamask,
    connectTrustWallet,
    connectLedger,
  }
}
