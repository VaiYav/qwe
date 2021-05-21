import React, { useCallback, useState, useMemo, useEffect } from 'react'

import {
  PlusOutlined,
  ImportOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { Keystore as KeystoreType } from '@xchainjs/xchain-crypto'
import { Chain } from '@xchainjs/xchain-util'
import { WalletStatus } from 'metamask-sdk'

import { useWallet } from 'redux/wallet/hooks'

import { metamask } from 'services/metamask'
import { xdefi } from 'services/xdefi'

import {
  FolderIcon,
  LedgerIcon,
  MetaMaskLogoIcon,
  TrustWalletLogoIcon,
  XdefiLogoIcon,
} from '../Icons'
import { Overlay, Label, Notification } from '../UIElements'
import ConnectKeystoreView from './ConnectKeystore'
import ConnectLedgerView from './ConnectLedger'
import CreateKeystoreView from './CreateKeystore'
import PhraseView from './Phrase'
import * as Styled from './WalletModal.style'

enum WalletMode {
  'Keystore' = 'Keystore',
  'Create' = 'Create',
  'Phrase' = 'Phrase',
  'Ledger' = 'Ledger',
  'TrustWallet' = 'TrustWallet',
  'MetaMask' = 'MetaMask',
  'XDefi' = 'XDefi',
  'Select' = 'Select',
}

const WalletModal = () => {
  const [walletMode, setWalletMode] = useState<WalletMode>(WalletMode.Select)

  const {
    unlockWallet,
    connectXdefiWallet,
    connectMetamask,
    connectTrustWallet,
    connectLedger,
    setIsConnectModalOpen,
    isConnectModalOpen,
    walletLoading,
  } = useWallet()

  useEffect(() => {
    if (isConnectModalOpen) setWalletMode(WalletMode.Select)
  }, [isConnectModalOpen])

  const metamaskStatus = useMemo(() => metamask.isWalletDetected(), [])
  const xdefiInstalled = useMemo(() => xdefi.isWalletDetected(), [])

  const handleConnect = useCallback(
    async (keystore: KeystoreType, phrase: string) => {
      await unlockWallet(keystore, phrase)

      setIsConnectModalOpen(false)
    },
    [unlockWallet, setIsConnectModalOpen],
  )

  const handleConnectLedger = useCallback(
    async (chain: Chain) => {
      try {
        Notification({
          type: 'info',
          message: 'Please confirm your address on the Ledger.',
        })
        await connectLedger(chain)
      } catch (error) {
        console.error(error)
        Notification({
          type: 'error',
          message: 'Connect Ledger Failed.',
        })
      }
      setIsConnectModalOpen(false)
    },
    [connectLedger, setIsConnectModalOpen],
  )

  const handleConnectMetaMask = useCallback(async () => {
    if (metamaskStatus === WalletStatus.NoWeb3Provider) {
      window.open('https://metamask.io')
    } else if (metamaskStatus === WalletStatus.XdefiDetected) {
      // TODO: Should disable xdefi wallet
    } else {
      try {
        await connectMetamask()
      } catch (error) {
        Notification({
          type: 'error',
          message: 'Connect Metamask Failed',
        })
      }
      setIsConnectModalOpen(false)
    }
  }, [metamaskStatus, connectMetamask, setIsConnectModalOpen])

  const handleConnectXDefi = useCallback(async () => {
    if (!xdefiInstalled) {
      window.open('https://xdefi.io')
    } else {
      try {
        await connectXdefiWallet()
      } catch (error) {
        console.log(error)
      }
      setIsConnectModalOpen(false)
    }
  }, [xdefiInstalled, connectXdefiWallet, setIsConnectModalOpen])

  const handleConnectTrustWallet = useCallback(async () => {
    try {
      await connectTrustWallet()
    } catch (error) {
      console.log(error)
    }
    setIsConnectModalOpen(false)
  }, [connectTrustWallet, setIsConnectModalOpen])

  const renderMainPanel = useMemo(() => {
    return (
      <Styled.MainPanel>
        <Styled.ConnectOption onClick={handleConnectMetaMask}>
          {metamaskStatus === WalletStatus.MetaMaskDetected && (
            <Label>Connect MetaMask Wallet</Label>
          )}
          {metamaskStatus === WalletStatus.XdefiDetected && (
            <Label>Disable Xdefi Wallet</Label>
          )}
          {metamaskStatus === WalletStatus.NoWeb3Provider && (
            <Label>Install MetaMask Wallet</Label>
          )}
          <MetaMaskLogoIcon />
        </Styled.ConnectOption>
        <Styled.ConnectOption onClick={handleConnectXDefi}>
          {xdefiInstalled && <Label>Connect Xdefi Wallet</Label>}
          {!xdefiInstalled && <Label>Install Xdefi Wallet</Label>}
          <XdefiLogoIcon className="xdefi-logo" />
        </Styled.ConnectOption>
        <Styled.ConnectOption onClick={() => setWalletMode(WalletMode.Ledger)}>
          <Label>Connect Ledger</Label>
          <LedgerIcon />
        </Styled.ConnectOption>
        <Styled.ConnectOption
          onClick={() => setWalletMode(WalletMode.Keystore)}
        >
          <Label>Connect Keystore</Label>
          <FolderIcon />
        </Styled.ConnectOption>
        <Styled.ConnectOption onClick={handleConnectTrustWallet}>
          <Label>Connect TrustWallet</Label>
          <TrustWalletLogoIcon />
        </Styled.ConnectOption>
        <Styled.ConnectOption onClick={() => setWalletMode(WalletMode.Create)}>
          <Label>Create Keystore</Label>
          <PlusOutlined />
        </Styled.ConnectOption>
        <Styled.ConnectOption onClick={() => setWalletMode(WalletMode.Phrase)}>
          <Label>Import Phrase</Label>
          <ImportOutlined />
        </Styled.ConnectOption>
      </Styled.MainPanel>
    )
  }, [
    metamaskStatus,
    xdefiInstalled,
    handleConnectMetaMask,
    handleConnectTrustWallet,
    handleConnectXDefi,
  ])

  return (
    <Overlay
      isOpen={isConnectModalOpen}
      onDismiss={() => setIsConnectModalOpen(false)}
    >
      <Styled.ConnectContainer>
        {walletMode !== WalletMode.Select && (
          <Styled.ModalHeader>
            <Styled.ActionButton
              onClick={() => setWalletMode(WalletMode.Select)}
            >
              <ArrowLeftOutlined />
            </Styled.ActionButton>
            <Styled.ActionButton onClick={() => setIsConnectModalOpen(false)}>
              <CloseOutlined />
            </Styled.ActionButton>
          </Styled.ModalHeader>
        )}
        {walletMode === WalletMode.Select && renderMainPanel}
        {walletMode === WalletMode.Keystore && (
          <ConnectKeystoreView
            onConnect={handleConnect}
            onCreate={() => setWalletMode(WalletMode.Create)}
            loading={walletLoading}
          />
        )}
        {walletMode === WalletMode.Ledger && (
          <ConnectLedgerView
            onConnect={handleConnectLedger}
            loading={walletLoading}
          />
        )}
        {walletMode === WalletMode.Create && (
          <CreateKeystoreView
            onConnect={handleConnect}
            onKeystore={() => setWalletMode(WalletMode.Keystore)}
          />
        )}
        {walletMode === WalletMode.Phrase && (
          <PhraseView
            onConnect={() => {}}
            onCreate={() => setWalletMode(WalletMode.Create)}
          />
        )}
      </Styled.ConnectContainer>
    </Overlay>
  )
}

export default WalletModal
