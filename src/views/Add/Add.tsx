import React, { useEffect, useMemo, useState, useCallback } from 'react'

import { useHistory, useParams } from 'react-router'

import { PlusOutlined } from '@ant-design/icons'
import { THORChain } from '@xchainjs/xchain-thorchain'
import {
  PanelView,
  AssetInputCard,
  Slider,
  ConfirmModal,
  Information,
  Notification,
  FancyButton,
  LiquidityTypeOption,
  LiquidityType,
} from 'components'
import { MemberPool } from 'midgard-sdk'
import {
  getInputAssetsForAdd,
  Amount,
  Asset,
  getAssetBalance,
  Pool,
  Price,
  Liquidity,
  getMemberDetailByPool,
  AssetAmount,
  Percent,
  getEstimatedTxTime,
  SupportedChain,
} from 'multichain-sdk'

import { useMidgard } from 'redux/midgard/hooks'
import { TxTrackerType } from 'redux/midgard/types'

import { useBalance } from 'hooks/useBalance'
import { useMimir } from 'hooks/useMimir'
import { useNetworkFee } from 'hooks/useNetworkFee'
import { useTxTracker } from 'hooks/useTxTracker'

import { multichain } from 'services/multichain'

import { getAddLiquidityRoute } from 'settings/constants'
import {
  TX_FEE_TOOLTIP_LABEL,
  SLIP_TOOLTIP_LABEL,
  ESTIMATED_TIME_LABEL,
  ESTIMATED_POOL_SHARE_LABEL,
} from 'settings/constants/label'

import * as Styled from './Add.style'
import { getMaxSymAmounts } from './utils'

const AddLiquidityView = () => {
  const { asset } = useParams<{ asset: string }>()
  const [assetObj, setAssetObj] = useState<Asset>()
  const [pool, setPool] = useState<Pool>()

  const { pools, poolLoading } = useMidgard()

  useEffect(() => {
    if (!poolLoading && pools.length && assetObj) {
      const assetPool = Pool.byAsset(assetObj, pools)

      if (assetPool) {
        setPool(assetPool)
      }
    }
  }, [pools, poolLoading, assetObj])

  useEffect(() => {
    const getAssetEntity = async () => {
      if (!asset) {
        return
      }
      const assetEntity = Asset.fromAssetString(asset)

      if (assetEntity) {
        if (assetEntity.isRUNE()) return

        await assetEntity.setDecimal()

        setAssetObj(assetEntity)
      }
    }

    getAssetEntity()
  }, [asset])

  if (pool && pools.length && assetObj) {
    return <AddLiquidityPanel assetObj={assetObj} pool={pool} pools={pools} />
  }

  return null
}

const AddLiquidityPanel = ({
  pool,
  pools,
  assetObj: poolAsset,
}: {
  assetObj: Asset
  pool: Pool
  pools: Pool[]
}) => {
  const history = useHistory()
  const { wallet, getMaxBalance } = useBalance()
  const { getAllMemberDetails, memberDetails } = useMidgard()
  const { submitTransaction, pollTransaction, setTxFailed } = useTxTracker()

  const { isFundsCapReached } = useMimir()

  const inputAssets = useMemo(() => getInputAssetsForAdd({ wallet, pools }), [
    wallet,
    pools,
  ])

  const [liquidityType, setLiquidityType] = useState(
    LiquidityTypeOption.SYMMETRICAL,
  )
  const isSymDeposit = useMemo(
    () => liquidityType === LiquidityTypeOption.SYMMETRICAL,
    [liquidityType],
  )

  const [assetAmount, setAssetAmount] = useState<Amount>(
    Amount.fromAssetAmount(0, 8),
  )
  const [runeAmount, setRuneAmount] = useState<Amount>(
    Amount.fromAssetAmount(0, 8),
  )
  const [percent, setPercent] = useState(0)
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false)
  const [visibleApproveModal, setVisibleApproveModal] = useState(false)

  const [isApproved, setApproved] = useState<boolean | null>(null)

  const { inboundFee } = useNetworkFee({
    inputAsset: pool.asset,
  })

  const feeLabel = useMemo(() => {
    if (liquidityType === LiquidityTypeOption.RUNE) {
      return '0.02 RUNE'
    }
    if (liquidityType === LiquidityTypeOption.ASSET) {
      return `${inboundFee.toCurrencyFormat()}`
    }
    return `${inboundFee.toCurrencyFormat()} + 0.02 RUNE`
  }, [inboundFee, liquidityType])

  useEffect(() => {
    getAllMemberDetails()
  }, [getAllMemberDetails])

  const poolMemberDetail: MemberPool | undefined = useMemo(() => {
    return getMemberDetailByPool({ memberDetails, pool })
  }, [memberDetails, pool])

  const liquidityUnits = useMemo(() => {
    if (!poolMemberDetail) return Amount.fromMidgard(0)

    return Amount.fromMidgard(poolMemberDetail.liquidityUnits)
  }, [poolMemberDetail])
  const liquidityEntity = useMemo(() => {
    return new Liquidity(pool, liquidityUnits)
  }, [pool, liquidityUnits])

  const addLiquiditySlip = useMemo(() => {
    return (liquidityEntity.getLiquiditySlip(
      runeAmount,
      assetAmount,
    ) as Percent).toFixed(2)
  }, [liquidityEntity, assetAmount, runeAmount])

  const poolShareEst = useMemo(() => {
    return liquidityEntity.getPoolShareEst(runeAmount, assetAmount).toFixed(3)
  }, [liquidityEntity, assetAmount, runeAmount])

  useEffect(() => {
    const checkApproved = async () => {
      const approved = await multichain.isAssetApproved(poolAsset)
      setApproved(approved)
    }

    if (wallet) {
      checkApproved()
    }
  }, [poolAsset, wallet])

  const poolAssetPriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: poolAsset,
        pools,
        priceAmount: assetAmount,
      }),
    [poolAsset, assetAmount, pools],
  )

  const runeAssetPriceInUSD = useMemo(
    () =>
      new Price({
        baseAsset: Asset.RUNE(),
        pools,
        priceAmount: runeAmount,
      }),
    [runeAmount, pools],
  )

  const poolAssetBalance: Amount = useMemo(() => {
    if (wallet) {
      return getAssetBalance(poolAsset, wallet).amount
    }

    // allow max amount if wallet is not connected
    return Amount.fromAssetAmount(10 ** 3, 8)
  }, [poolAsset, wallet])

  const maxPoolAssetBalance: Amount = useMemo(() => getMaxBalance(poolAsset), [
    poolAsset,
    getMaxBalance,
  ])

  const runeBalance: Amount = useMemo(() => {
    if (wallet) {
      return getAssetBalance(Asset.RUNE(), wallet).amount
    }

    // allow max amount if wallet is not connected
    return Amount.fromAssetAmount(10 ** 3, 8)
  }, [wallet])

  const maxRuneBalance: Amount = useMemo(() => getMaxBalance(Asset.RUNE()), [
    getMaxBalance,
  ])

  const { maxSymAssetAmount, maxSymRuneAmount } = getMaxSymAmounts({
    runeAmount: maxRuneBalance,
    assetAmount: maxPoolAssetBalance,
    pool,
  })

  const handleSelectLiquidityType = useCallback((type: LiquidityTypeOption) => {
    if (type === LiquidityTypeOption.ASSET) {
      setRuneAmount(Amount.fromAssetAmount(0, 8))
    } else if (type === LiquidityTypeOption.RUNE) {
      setAssetAmount(Amount.fromAssetAmount(0, 8))
    }

    setLiquidityType(type)
    setPercent(0)
  }, [])

  const handleSelectPoolAsset = useCallback(
    (poolAssetData: Asset) => {
      history.push(getAddLiquidityRoute(poolAssetData))
    },
    [history],
  )

  const handleChangeAssetAmount = useCallback(
    (amount: Amount) => {
      const maxAmount = isSymDeposit ? maxSymAssetAmount : maxPoolAssetBalance

      if (amount.gt(maxAmount)) {
        setAssetAmount(maxAmount)
        setPercent(100)

        if (isSymDeposit) {
          setRuneAmount(maxAmount.mul(pool.assetPriceInRune))
        }
      } else {
        setAssetAmount(amount)
        setPercent(amount.div(maxAmount).mul(100).assetAmount.toNumber())

        if (isSymDeposit) {
          setRuneAmount(amount.mul(pool.assetPriceInRune))
        }
      }
    },
    [maxSymAssetAmount, maxPoolAssetBalance, pool, isSymDeposit],
  )

  const handleChangePercent = useCallback(
    (p: number) => {
      setPercent(p)

      if (isSymDeposit) {
        setAssetAmount(maxSymAssetAmount.mul(p).div(100))
        setRuneAmount(maxSymRuneAmount.mul(p).div(100))
      } else if (liquidityType === LiquidityTypeOption.ASSET) {
        setAssetAmount(maxPoolAssetBalance.mul(p).div(100))
      } else if (liquidityType === LiquidityTypeOption.RUNE) {
        setRuneAmount(maxRuneBalance.mul(p).div(100))
      }
    },
    [
      maxRuneBalance,
      maxSymAssetAmount,
      maxSymRuneAmount,
      maxPoolAssetBalance,
      isSymDeposit,
      liquidityType,
    ],
  )

  const handleSelectAssetMax = useCallback(() => {
    handleChangePercent(100)
  }, [handleChangePercent])

  const handleChangeRuneAmount = useCallback(
    (amount: Amount) => {
      const maxAmount = isSymDeposit ? maxSymRuneAmount : maxRuneBalance
      if (amount.gt(maxAmount)) {
        setRuneAmount(maxAmount)

        if (isSymDeposit) {
          setAssetAmount(maxAmount.mul(pool.runePriceInAsset))
        }
      } else {
        setRuneAmount(amount)
        setPercent(amount.div(maxAmount).mul(100).assetAmount.toNumber())

        if (isSymDeposit) {
          setAssetAmount(amount.mul(pool.runePriceInAsset))
        }
      }
    },
    [maxSymRuneAmount, maxRuneBalance, pool, isSymDeposit],
  )

  const handleConfirmAdd = useCallback(async () => {
    setVisibleConfirmModal(false)
    if (wallet) {
      const runeAssetAmount =
        liquidityType !== LiquidityTypeOption.ASSET
          ? new AssetAmount(Asset.RUNE(), runeAmount)
          : undefined
      const poolAssetAmount =
        liquidityType !== LiquidityTypeOption.RUNE
          ? new AssetAmount(poolAsset, assetAmount)
          : undefined

      const inAssets = []
      if (liquidityType !== LiquidityTypeOption.ASSET) {
        inAssets.push({
          asset: Asset.RUNE().toString(),
          amount: runeAmount.toSignificant(6),
        })
      }

      if (liquidityType !== LiquidityTypeOption.RUNE) {
        inAssets.push({
          asset: poolAsset.toString(),
          amount: assetAmount.toSignificant(6),
        })
      }

      // register to tx tracker
      const trackId = submitTransaction({
        type: TxTrackerType.AddLiquidity,
        submitTx: {
          inAssets,
          outAssets: [],
          poolAsset: poolAsset.ticker,
        },
      })

      try {
        const txRes = await multichain.addLiquidity({
          pool,
          runeAmount: runeAssetAmount,
          assetAmount: poolAssetAmount,
        })

        console.log('tx res', txRes)

        const runeTxHash = txRes?.runeTx
        const assetTxHash = txRes?.assetTx

        if (runeTxHash || assetTxHash) {
          // start polling
          pollTransaction({
            type: TxTrackerType.AddLiquidity,
            uuid: trackId,
            submitTx: {
              inAssets,
              outAssets: [],
              txID: runeTxHash || assetTxHash,
              addTx: {
                runeTxID: runeTxHash,
                assetTxID: assetTxHash,
              },
              poolAsset: poolAsset.ticker,
            },
          })
        }
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
    wallet,
    pool,
    poolAsset,
    runeAmount,
    assetAmount,
    liquidityType,
    submitTransaction,
    pollTransaction,
    setTxFailed,
  ])

  const handleCancel = useCallback(() => {
    setVisibleConfirmModal(false)
  }, [])

  const handleConfirmApprove = useCallback(async () => {
    setVisibleApproveModal(false)

    if (wallet) {
      const txHash = await multichain.approveAsset(poolAsset)

      if (txHash) {
        console.log('txhash', txHash)
        const txURL = multichain.getExplorerTxUrl(poolAsset.chain, txHash)

        Notification({
          type: 'open',
          message: 'View Approve Tx.',
          description: 'Transaction submitted successfully!',
          btn: (
            <a href={txURL} target="_blank" rel="noopener noreferrer">
              View Transaction
            </a>
          ),
          duration: 20,
        })
      }
    }
  }, [poolAsset, wallet])

  const handleAddLiquidity = useCallback(() => {
    if (!wallet) {
      Notification({
        type: 'info',
        message: 'Wallet Not Found',
        description: 'Please connect wallet',
      })
      return
    }

    if (isFundsCapReached) {
      Notification({
        type: 'info',
        message: 'Funds Cap Reached',
        description:
          'You cannot add due to 90% Funds Cap has been reached. Please try again later.',
      })
      return
    }

    setVisibleConfirmModal(true)
  }, [wallet, isFundsCapReached])

  const handleApprove = useCallback(() => {
    if (wallet) {
      setVisibleApproveModal(true)
    } else {
      Notification({
        type: 'info',
        message: 'Wallet Not Found',
        description: 'Please connect wallet',
      })
    }
  }, [wallet])

  const renderConfirmModalContent = useMemo(() => {
    const title =
      liquidityType === LiquidityTypeOption.SYMMETRICAL
        ? `${assetAmount.toSignificant(
            6,
          )} ${poolAsset.ticker.toUpperCase()}, ${runeAmount.toSignificant(
            6,
          )} RUNE`
        : LiquidityTypeOption.RUNE
        ? `${runeAmount.toSignificant(6)} RUNE`
        : `${assetAmount.toSignificant(6)} ${poolAsset.ticker.toUpperCase()}`

    const estimatedTime =
      liquidityType === LiquidityTypeOption.RUNE
        ? getEstimatedTxTime({
            chain: THORChain,
            amount: runeAmount,
          })
        : getEstimatedTxTime({
            chain: poolAsset.chain as SupportedChain,
            amount: assetAmount,
          })

    return (
      <Styled.ConfirmModalContent>
        <Information title="Add" description={title} />
        <br />
        <Information
          title="Slip"
          description={addLiquiditySlip}
          tooltip={SLIP_TOOLTIP_LABEL}
        />
        <Information
          title="Pool Share Estimated"
          description={poolShareEst}
          tooltip={ESTIMATED_POOL_SHARE_LABEL}
        />
        <Information
          title="Transaction Fee"
          description={feeLabel}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
        <Information
          title="Estimated Time"
          description={estimatedTime}
          tooltip={ESTIMATED_TIME_LABEL}
        />
      </Styled.ConfirmModalContent>
    )
  }, [
    assetAmount,
    runeAmount,
    poolAsset,
    addLiquiditySlip,
    poolShareEst,
    feeLabel,
    liquidityType,
  ])

  const renderApproveModal = useMemo(() => {
    return (
      <Styled.ConfirmModalContent>
        <Information
          title="Approve Transaction"
          description={`${poolAsset.ticker.toUpperCase()}`}
        />
        <Information
          title="Transaction Fee"
          description={feeLabel}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
      </Styled.ConfirmModalContent>
    )
  }, [poolAsset, feeLabel])

  const isAddLiquidityValid = useMemo(() => {
    if (liquidityType === LiquidityTypeOption.SYMMETRICAL) {
      return runeAmount.gt(0) && assetAmount.gt(0)
    }

    if (liquidityType === LiquidityTypeOption.ASSET) {
      return assetAmount.gt(0)
    }

    if (liquidityType === LiquidityTypeOption.RUNE) {
      return runeAmount.gt(0)
    }

    return false
  }, [liquidityType, runeAmount, assetAmount])

  const isApproveRequired = useMemo(() => {
    if (
      liquidityType !== LiquidityTypeOption.RUNE &&
      isApproved !== null &&
      !isApproved
    ) {
      return true
    }

    return false
  }, [isApproved, liquidityType])

  const title = useMemo(() => `Add ${poolAsset.ticker} Liquidity`, [poolAsset])

  return (
    <PanelView meta={title} poolAsset={poolAsset} type="add">
      <LiquidityType
        poolAsset={poolAsset}
        selected={liquidityType}
        onSelect={handleSelectLiquidityType}
      />
      <AssetInputCard
        title="Add"
        asset={poolAsset}
        assets={inputAssets}
        amount={assetAmount}
        balance={poolAssetBalance}
        onChange={handleChangeAssetAmount}
        onSelect={handleSelectPoolAsset}
        onMax={handleSelectAssetMax}
        usdPrice={poolAssetPriceInUSD}
        inputProps={{ disabled: liquidityType === LiquidityTypeOption.RUNE }}
      />
      <Styled.ToolContainer>
        <Styled.SliderWrapper>
          <Slider value={percent} onChange={handleChangePercent} withLabel />
        </Styled.SliderWrapper>
        <Styled.SwitchPair>
          <PlusOutlined />
        </Styled.SwitchPair>
      </Styled.ToolContainer>
      <AssetInputCard
        title="Add"
        asset={Asset.RUNE()}
        amount={runeAmount}
        usdPrice={runeAssetPriceInUSD}
        selectDisabled={false}
        balance={runeBalance}
        onChange={handleChangeRuneAmount}
        inputProps={{ disabled: liquidityType === LiquidityTypeOption.ASSET }}
      />

      <Styled.DetailContent>
        <Information
          title="Slip"
          description={addLiquiditySlip}
          tooltip={SLIP_TOOLTIP_LABEL}
        />
        <Information
          title="Pool Share Estimated"
          description={poolShareEst}
          tooltip={ESTIMATED_POOL_SHARE_LABEL}
        />
        <Information
          title="Transaction Fee"
          description={feeLabel}
          tooltip={TX_FEE_TOOLTIP_LABEL}
        />
      </Styled.DetailContent>

      {isApproved !== null && wallet && (
        <Styled.ConfirmButtonContainer>
          {isApproveRequired && (
            <Styled.ApproveBtn onClick={handleApprove}>
              Approve
            </Styled.ApproveBtn>
          )}
          <FancyButton
            disabled={isApproveRequired}
            onClick={handleAddLiquidity}
          >
            Add
          </FancyButton>
        </Styled.ConfirmButtonContainer>
      )}
      {!wallet && (
        <Styled.ConfirmButtonContainer>
          <FancyButton
            onClick={handleAddLiquidity}
            error={!isAddLiquidityValid}
          >
            Add Liquidity
          </FancyButton>
        </Styled.ConfirmButtonContainer>
      )}

      <ConfirmModal
        visible={visibleConfirmModal}
        onOk={handleConfirmAdd}
        onCancel={handleCancel}
      >
        {renderConfirmModalContent}
      </ConfirmModal>
      <ConfirmModal
        visible={visibleApproveModal}
        onOk={handleConfirmApprove}
        onCancel={() => setVisibleApproveModal(false)}
      >
        {renderApproveModal}
      </ConfirmModal>
    </PanelView>
  )
}

export default AddLiquidityView
