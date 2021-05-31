import React, { useEffect, useMemo, useState, useCallback } from 'react'

import {
  ContentTitle,
  Helmet,
  AddressSelectCard,
  AssetInputCard,
  Slider,
  FancyButton,
  ConfirmModal,
  Information,
  Label,
  Notification,
} from 'components'
import {
  Amount,
  Asset,
  getAssetBalance,
  AssetAmount,
  Wallet,
  getRuneToUpgrade,
  hasWalletConnected,
} from 'multichain-sdk'

import { TxTrackerType } from 'redux/midgard/types'
import { useWallet } from 'redux/wallet/hooks'

import { useNetworkFee } from 'hooks/useNetworkFee'
import { useTxTracker } from 'hooks/useTxTracker'

import { multichain } from 'services/multichain'

import { truncateAddress } from 'helpers/string'

import { TX_FEE_TOOLTIP_LABEL } from 'settings/constants'

import * as Styled from './Upgrade.style'

const UpgradeView = () => {
  const { wallet } = useWallet()

  const runeToUpgrade = useMemo(() => getRuneToUpgrade(wallet), [wallet])

  const walletConnected = useMemo(
    () =>
      runeToUpgrade &&
      hasWalletConnected({ wallet, inputAssets: runeToUpgrade }),
    [wallet, runeToUpgrade],
  )

  if (!wallet || !walletConnected) {
    return (
      <Styled.Container>
        <Label>Please connect a wallet.</Label>
      </Styled.Container>
    )
  }

  if (!runeToUpgrade || runeToUpgrade.length === 0) {
    return (
      <Styled.Container>
        <Label>You don't have BEP2 or ERC20 RUNE to upgrade.</Label>
      </Styled.Container>
    )
  }

  return <UpgradePanel runeToUpgrade={runeToUpgrade} wallet={wallet} />
}

const UpgradePanel = ({
  runeToUpgrade,
  wallet,
}: {
  runeToUpgrade: Asset[]
  wallet: Wallet
}) => {
  const { submitTransaction, pollTransaction, setTxFailed } = useTxTracker()

  const [selectedAsset, setSelectedAsset] = useState<Asset>(runeToUpgrade[0])

  const [upgradeAmount, setUpgradeAmount] = useState<Amount>(
    Amount.fromAssetAmount(0, 8),
  )
  const [percent, setPercent] = useState(0)

  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)

  const [recipientThor, setRecipientThor] = useState('')

  const thorchainAddr = multichain.getWalletAddressByChain('THOR') || ''

  const assetBalance: Amount = useMemo(() => {
    if (wallet) {
      return getAssetBalance(selectedAsset, wallet).amount
    }
    return Amount.fromAssetAmount(0, 8)
  }, [selectedAsset, wallet])

  const { inboundFee } = useNetworkFee({
    inputAsset: selectedAsset,
  })

  useEffect(() => {
    const address = multichain.getWalletAddressByChain('THOR')
    setRecipientThor(address || '')
  }, [])

  const handleSelectAsset = useCallback((selected: Asset) => {
    setSelectedAsset(selected)
  }, [])

  const handleChangeUpgradeAmount = useCallback(
    (amount: Amount) => {
      if (amount.gt(assetBalance)) {
        setUpgradeAmount(assetBalance)
        setPercent(100)
      } else {
        setUpgradeAmount(amount)
        setPercent(amount.div(assetBalance).mul(100).assetAmount.toNumber())
      }
    },
    [assetBalance],
  )

  const handleChangePercent = useCallback(
    (p: number) => {
      setPercent(p)
      const newAmount = assetBalance.mul(p).div(100)
      setUpgradeAmount(newAmount)
    },
    [assetBalance],
  )

  const handleSelectMax = useCallback(() => {
    handleChangePercent(100)
  }, [handleChangePercent])

  const handleConfirmUpgrade = useCallback(async () => {
    setVisibleConfirmModal(false)

    if (selectedAsset && recipientThor) {
      const runeAmount = new AssetAmount(selectedAsset, upgradeAmount)

      // register to tx tracker
      const trackId = submitTransaction({
        type: TxTrackerType.Switch,
        submitTx: {
          inAssets: [
            {
              asset: selectedAsset.toString(),
              amount: upgradeAmount.toSignificant(6),
            },
          ],
          outAssets: [
            {
              asset: Asset.RUNE().toString(),
              amount: upgradeAmount.toSignificant(6),
            },
          ],
          recipient: recipientThor,
        },
      })

      try {
        const txHash = await multichain.upgrade({
          runeAmount,
          recipient: recipientThor,
        })

        // start polling
        pollTransaction({
          type: TxTrackerType.Switch,
          uuid: trackId,
          submitTx: {
            inAssets: [
              {
                asset: selectedAsset.toString(),
                amount: upgradeAmount.toSignificant(6),
              },
            ],
            outAssets: [
              {
                asset: Asset.RUNE().toString(),
                amount: upgradeAmount.toSignificant(6),
              },
            ],
            txID: txHash,
            submitDate: new Date(),
            recipient: recipientThor,
          },
        })
      } catch (error) {
        setTxFailed(trackId)

        Notification({
          type: 'error',
          message: 'Submit Transaction Failed.',
          duration: 20,
        })
        console.log(error)
      }
    }
  }, [
    selectedAsset,
    upgradeAmount,
    submitTransaction,
    pollTransaction,
    recipientThor,
    setTxFailed,
  ])

  const handleCancelUpgrade = useCallback(() => {
    setVisibleConfirmModal(false)
  }, [])

  const handleUpgrade = useCallback(() => {
    if (!recipientThor) {
      Notification({
        type: 'info',
        message: 'You have to connect wallet for Thorchain.',
      })
      return
    }
    if (
      !multichain.validateAddress({ chain: 'THOR', address: recipientThor })
    ) {
      Notification({
        type: 'error',
        message: 'Invalid Recipient Address',
        description: 'Recipient address should be a valid address.',
      })
      return
    }
    setVisibleConfirmModal(true)
  }, [recipientThor])

  const renderConfirmModalContent = useMemo(() => {
    return (
      <Styled.ConfirmModalContent>
        <Information
          title="Upgrade"
          description={`${selectedAsset.ticker.toUpperCase()} (${selectedAsset.type.toUpperCase()})`}
        />
        <Information
          title="Transaction Fee"
          description={inboundFee.toCurrencyFormat()}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
        <br />
        <Information
          title="Recipient Address"
          description={truncateAddress(recipientThor)}
        />
      </Styled.ConfirmModalContent>
    )
  }, [inboundFee, selectedAsset, recipientThor])

  const title = useMemo(() => `Upgrade ${selectedAsset.chain} RUNE`, [
    selectedAsset,
  ])

  return (
    <Styled.Container>
      <Helmet title={title} content={title} />
      <ContentTitle>{title}</ContentTitle>
      <Styled.ContentPanel>
        <AssetInputCard
          title="upgrade"
          asset={selectedAsset}
          assets={runeToUpgrade}
          selectDisabled={runeToUpgrade.length !== 2}
          amount={upgradeAmount}
          balance={assetBalance}
          onChange={handleChangeUpgradeAmount}
          onSelect={handleSelectAsset}
          onMax={handleSelectMax}
          wallet={wallet || undefined}
        />
        <Slider value={percent} onChange={handleChangePercent} withLabel />

        <Styled.FormItem>
          <Information
            title="Transaction Fee"
            description={inboundFee.toCurrencyFormat()}
            tooltip={TX_FEE_TOOLTIP_LABEL}
          />
        </Styled.FormItem>

        <AddressSelectCard
          title="Recipient Address"
          address={recipientThor}
          chain="THOR"
          chainAddr={thorchainAddr}
          onAddressChange={setRecipientThor}
        />

        <Styled.ConfirmButtonContainer>
          <FancyButton onClick={handleUpgrade} error={false}>
            Upgrade
          </FancyButton>
        </Styled.ConfirmButtonContainer>
      </Styled.ContentPanel>
      <ConfirmModal
        visible={visibleConfirmModal}
        onOk={handleConfirmUpgrade}
        onCancel={handleCancelUpgrade}
        inputAssets={[selectedAsset]}
      >
        {renderConfirmModalContent}
      </ConfirmModal>
    </Styled.Container>
  )
}

export default UpgradeView
