import React, { useCallback, useState } from 'react'

import { chainToString, Chain } from '@xchainjs/xchain-util'
import { Form } from 'antd'
import { SUPPORTED_CHAINS } from 'multichain-sdk'

import { AssetIcon } from '../../Assets'
import { Helmet } from '../../Helmet'
import { Button, Label } from '../../UIElements'
import * as Styled from './Ledger.style'
import { chainToSigAsset } from './types'

type Props = {
  onConnect: (chain: Chain) => void
  loading?: boolean
}

const LedgerView = ({ onConnect, loading = false }: Props) => {
  const [activeChain, setActiveChain] = useState<Chain>()

  const handleConnectLedger = useCallback(() => {
    if (activeChain) {
      onConnect(activeChain)
    }
  }, [onConnect, activeChain])

  return (
    <Styled.Container>
      <Helmet title="Connect Ledger" content="Connect Ledger" />
      <Styled.Header>Connect Ledger</Styled.Header>
      <Form>
        <Styled.Content>
          <Styled.FormLabel color="normal">
            Please select chain to connect.
          </Styled.FormLabel>
          {SUPPORTED_CHAINS.map((chain) => {
            const chainAsset = chainToSigAsset(chain)

            return (
              <Styled.ChainButton
                key={chain}
                color="primary"
                typevalue={activeChain === chain ? 'default' : 'ghost'}
                fixedWidth={false}
                onClick={() => setActiveChain(chain)}
              >
                <Label>{chainToString(chain)}</Label>
                <AssetIcon asset={chainAsset} size="small" />
              </Styled.ChainButton>
            )
          })}
        </Styled.Content>
        <Styled.Footer>
          <Styled.FooterContent>
            <Button
              round
              disabled={!activeChain}
              loading={loading}
              fixedWidth={false}
              onClick={handleConnectLedger}
            >
              Connect Ledger
            </Button>
          </Styled.FooterContent>
        </Styled.Footer>
      </Form>
    </Styled.Container>
  )
}

export default LedgerView
