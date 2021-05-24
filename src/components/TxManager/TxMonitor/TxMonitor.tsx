import React, { useMemo } from 'react'

import { ChevronUp, ChevronDown, ExternalLink } from 'react-feather'

import {
  CheckCircleOutlined,
  LoadingOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { Asset } from 'multichain-sdk'

import { TxTracker, TxTrackerStatus, TxTrackerType } from 'redux/midgard/types'

import { Label } from '../../UIElements'
import * as Styled from './TxMonitor.style'
import { ProgressStatus } from './types'
import {
  getApproveTxUrl,
  getSwapInTxUrl,
  getSwapOutTxUrl,
  getSwapOutTxData,
  getTxTitle,
  getTotalProgressStatus,
  getTxColor,
  getAddTxUrl,
  getWithdrawTxUrl,
  getWithdrawSubmitTxUrl,
} from './utils'

const ProgressIcon = ({ status }: { status: ProgressStatus }) => {
  if (status === 'refunded') {
    return (
      <Styled.ProgressIconWrapper color="warning">
        <RollbackOutlined />
      </Styled.ProgressIconWrapper>
    )
  }
  if (status === 'success') {
    return (
      <Styled.ProgressIconWrapper color="success">
        <CheckCircleOutlined />
      </Styled.ProgressIconWrapper>
    )
  }

  if (status === 'pending') {
    return (
      <Styled.ProgressIconWrapper color="primary">
        <LoadingOutlined />
      </Styled.ProgressIconWrapper>
    )
  }

  return (
    <Styled.ProgressIconWrapper color="error">
      <CloseCircleOutlined />
    </Styled.ProgressIconWrapper>
  )
}

export const TxMonitor = ({ txTracker }: { txTracker: TxTracker }) => {
  const [collapsed, setCollapsed] = React.useState(true)
  const [outTxData, setOutTxData] = React.useState<string>('')

  React.useEffect(() => {
    const getSwapTxData = async () => {
      const txOutData = await getSwapOutTxData(txTracker)

      if (txOutData) {
        setOutTxData(txOutData)
      }
    }

    if (txTracker.status === TxTrackerStatus.Success) {
      if (txTracker.type === TxTrackerType.Swap) {
        getSwapTxData()
      }
    }
  }, [txTracker])

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed)
  }, [collapsed])

  const title = useMemo(() => getTxTitle(txTracker), [txTracker])

  const totalProgressStatus: ProgressStatus = useMemo(
    () => getTotalProgressStatus(txTracker),
    [txTracker],
  )

  const txColor = useMemo(() => getTxColor(txTracker), [txTracker])

  const renderTxContent = useMemo(() => {
    const { type, status, submitTx } = txTracker

    if (type === TxTrackerType.Swap) {
      const { inAssets = [], outAssets = [] } = submitTx
      const { asset: sendAsset, amount: sendAmount } = inAssets[0]
      const { asset: receiveAsset, amount: receiveAmount } = outAssets[0]

      if (status === TxTrackerStatus.Failed) {
        return (
          <Styled.TxInformation>
            <ProgressIcon status="failed" />
            <Label color="error">
              Send {sendAmount} {Asset.fromAssetString(sendAsset)?.ticker}{' '}
              Failed
            </Label>
          </Styled.TxInformation>
        )
      }

      return (
        <>
          <Styled.TxInformation>
            <ProgressIcon
              status={
                status === TxTrackerStatus.Submitting ? 'pending' : 'success'
              }
            />
            <Label color="primary">
              Send {sendAmount} {Asset.fromAssetString(sendAsset)?.ticker}
            </Label>
            {status !== TxTrackerStatus.Submitting && (
              <Styled.ExternalLinkWrapper
                link={getSwapInTxUrl(txTracker)}
                color="primary"
              >
                <ExternalLink />
              </Styled.ExternalLinkWrapper>
            )}
          </Styled.TxInformation>
          {status !== TxTrackerStatus.Submitting && (
            <Styled.TxInformation border>
              <ProgressIcon
                status={
                  status === TxTrackerStatus.Success ? 'success' : 'pending'
                }
              />
              <Label color="primary">
                {status === TxTrackerStatus.Pending &&
                  `Receive ${receiveAmount} ${
                    Asset.fromAssetString(receiveAsset)?.ticker
                  }`}
                {status === TxTrackerStatus.Success && outTxData
                  ? outTxData
                  : ''}
              </Label>
              {status === TxTrackerStatus.Success && (
                <Styled.ExternalLinkWrapper
                  link={getSwapOutTxUrl(txTracker)}
                  color="primary"
                >
                  <ExternalLink />
                </Styled.ExternalLinkWrapper>
              )}
            </Styled.TxInformation>
          )}
        </>
      )
    }

    if (type === TxTrackerType.AddLiquidity) {
      const { inAssets = [] } = submitTx

      return (
        <>
          {txTracker.refunded && (
            <Styled.TxInformation key="refunded">
              <ProgressIcon status="refunded" />
              <Label color="warning">Refunded</Label>
            </Styled.TxInformation>
          )}
          {!txTracker.refunded &&
            inAssets.map(({ asset, amount }) => {
              const assetObj = Asset.fromAssetString(asset)
              if (!assetObj) return null

              return (
                <Styled.TxInformation key={asset}>
                  <ProgressIcon
                    status={
                      status !== TxTrackerStatus.Success ? 'pending' : 'success'
                    }
                  />
                  <Label color="primary">
                    {status !== TxTrackerStatus.Success
                      ? `Add ${amount} ${assetObj?.ticker}`
                      : `Added ${amount} ${assetObj?.ticker}`}
                  </Label>
                  {status !== TxTrackerStatus.Submitting && (
                    <Styled.ExternalLinkWrapper
                      link={getAddTxUrl({ asset: assetObj, txTracker })}
                      color="primary"
                    >
                      <ExternalLink />
                    </Styled.ExternalLinkWrapper>
                  )}
                </Styled.TxInformation>
              )
            })}
        </>
      )
    }

    if (type === TxTrackerType.Withdraw) {
      const { outAssets = [] } = submitTx

      return (
        <>
          <Styled.TxInformation>
            <ProgressIcon
              status={
                status === TxTrackerStatus.Submitting ? 'pending' : 'success'
              }
            />
            <Label color="primary">Submit Withdraw TX</Label>
            {status !== TxTrackerStatus.Submitting && (
              <Styled.ExternalLinkWrapper
                link={getWithdrawSubmitTxUrl(txTracker)}
                color="primary"
              >
                <ExternalLink />
              </Styled.ExternalLinkWrapper>
            )}
          </Styled.TxInformation>
          {txTracker.refunded && (
            <Styled.TxInformation key="refunded">
              <ProgressIcon status="refunded" />
              <Label color="warning">Refunded</Label>
            </Styled.TxInformation>
          )}
          {!txTracker.refunded &&
            status !== TxTrackerStatus.Submitting &&
            outAssets.map(({ asset, amount }) => {
              const assetObj = Asset.fromAssetString(asset)
              if (!assetObj) return null

              return (
                <Styled.TxInformation key={asset}>
                  <ProgressIcon
                    status={
                      status !== TxTrackerStatus.Success ? 'pending' : 'success'
                    }
                  />
                  <Label color="primary">
                    {status !== TxTrackerStatus.Success
                      ? `Withdraw ${amount} ${assetObj?.ticker}`
                      : `Withdraw ${amount} ${assetObj?.ticker} Finished`}
                  </Label>
                  {status === TxTrackerStatus.Success && (
                    <Styled.ExternalLinkWrapper
                      link={getWithdrawTxUrl({ asset: assetObj, txTracker })}
                      color="primary"
                    >
                      <ExternalLink />
                    </Styled.ExternalLinkWrapper>
                  )}
                </Styled.TxInformation>
              )
            })}
        </>
      )
    }

    if (type === TxTrackerType.Switch) {
      const { inAssets = [], outAssets = [] } = submitTx
      const { asset: sendAsset, amount: sendAmount } = inAssets[0]
      const { amount: receiveAmount } = outAssets[0]

      return (
        <>
          <Styled.TxInformation>
            <ProgressIcon
              status={
                status === TxTrackerStatus.Submitting ? 'pending' : 'success'
              }
            />
            <Label color="primary">
              Send {sendAmount} {Asset.fromAssetString(sendAsset)?.chain}{' '}
              {Asset.fromAssetString(sendAsset)?.ticker}
            </Label>
            {status !== TxTrackerStatus.Submitting && (
              <Styled.ExternalLinkWrapper
                link={getSwapInTxUrl(txTracker)}
                color="primary"
              >
                <ExternalLink />
              </Styled.ExternalLinkWrapper>
            )}
          </Styled.TxInformation>
          {status !== TxTrackerStatus.Submitting && (
            <Styled.TxInformation border>
              <ProgressIcon
                status={
                  status !== TxTrackerStatus.Success ? 'pending' : 'success'
                }
              />
              <Label color="primary">
                {status === TxTrackerStatus.Pending &&
                  `Receive ${receiveAmount} Native RUNE`}
                {status === TxTrackerStatus.Success &&
                  `Received ${receiveAmount} Native RUNE`}
              </Label>
              {status === TxTrackerStatus.Success && (
                <Styled.ExternalLinkWrapper
                  link={getSwapOutTxUrl(txTracker)}
                  color="primary"
                >
                  <ExternalLink />
                </Styled.ExternalLinkWrapper>
              )}
            </Styled.TxInformation>
          )}
        </>
      )
    }

    if (type === TxTrackerType.Approve) {
      const { inAssets = [] } = submitTx
      const { asset: approveAsset } = inAssets[0]

      if (status === TxTrackerStatus.Failed) {
        return (
          <Styled.TxInformation>
            <ProgressIcon status="failed" />
            <Label color="error">
              Approve {Asset.fromAssetString(approveAsset)?.ticker} Failed
            </Label>
          </Styled.TxInformation>
        )
      }

      return (
        <>
          <Styled.TxInformation>
            <ProgressIcon
              status={
                status === TxTrackerStatus.Submitting ? 'pending' : 'success'
              }
            />
            <Label color="primary">
              {status === TxTrackerStatus.Pending &&
                `Approve ${Asset.fromAssetString(approveAsset)?.ticker}`}
              {status === TxTrackerStatus.Success &&
                `Approved ${Asset.fromAssetString(approveAsset)?.ticker}`}
            </Label>
            {status !== TxTrackerStatus.Submitting && (
              <Styled.ExternalLinkWrapper
                link={getApproveTxUrl(txTracker)}
                color="primary"
              >
                <ExternalLink />
              </Styled.ExternalLinkWrapper>
            )}
          </Styled.TxInformation>
        </>
      )
    }

    return null
  }, [txTracker, outTxData])

  return (
    <Styled.Container collapsed={collapsed}>
      <Styled.Header>
        <ProgressIcon status={totalProgressStatus} />
        <Styled.TxTitle color={txColor}>{title}</Styled.TxTitle>
        <Styled.HeaderRight>
          <Styled.HeaderBtn onClick={toggle} color={txColor}>
            {!collapsed ? <ChevronUp /> : <ChevronDown />}
          </Styled.HeaderBtn>
        </Styled.HeaderRight>
      </Styled.Header>
      <Styled.Content>{renderTxContent}</Styled.Content>
    </Styled.Container>
  )
}
