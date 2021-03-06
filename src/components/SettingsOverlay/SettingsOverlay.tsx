import React, { useRef } from 'react'

import { Settings } from 'react-feather'

import styled from 'styled-components'
import { palette } from 'styled-theme'

import { useApp } from 'redux/app/hooks'

import { useOnClickOutside } from 'hooks/useOnClickOutside'

import { media } from 'helpers/style'

import { Button, CoreButton, Label, Question, Tooltip } from '../UIElements'

const StyledMenuIcon = styled(Settings)`
  height: 20px;
  width: 20px;

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 18.125rem;
  background: ${palette('background', 0)};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01);

  border: 1px solid ${palette('gray', 0)};
  border-radius: 0.5rem;

  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  right: -1rem;
  z-index: 100;

  padding: 8px 8px;

  ${media.sm`
    min-width: 20.125rem;
  `}
`

const StyledCol = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 8px;
`

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
`

const StyledToggleBtn = styled(Button).attrs({
  typevalue: 'outline',
  round: true,
  fixedWidth: false,
})`
  margin-right: 8px;
`

const slipOptions = [3, 5, 10]

export const SettingsOverlay = () => {
  const node = useRef<HTMLDivElement>()

  const {
    isSettingOpen: open,
    toggleSettings: toggle,
    slippageTolerance,
    feeOptionType,
    FeeOptions,
    expertMode,
    ExpertOptions,
    setExpertMode,
    setSlippage,
    setFeeOptionType,
  } = useApp()

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    <StyledMenu ref={node as any}>
      <CoreButton onClick={toggle}>
        <Tooltip tooltip="Setting" placement="top">
          <StyledMenuIcon />
        </Tooltip>
      </CoreButton>
      {open && (
        <MenuFlyout>
          <StyledCol>
            <StyledRow>
              <Label>Slippage Tolerance</Label>
              <Question
                tooltip="Your transaction will revert if the price changes unfavorably by more than this percentage."
                placement="top"
              />
            </StyledRow>
            <StyledRow>
              {slipOptions.map((slipOption: number) => (
                <StyledToggleBtn
                  onClick={() => setSlippage(slipOption)}
                  focused={slippageTolerance === slipOption}
                  key={slipOption}
                >
                  {slipOption}%
                </StyledToggleBtn>
              ))}
            </StyledRow>
          </StyledCol>
          <StyledCol>
            <StyledRow>
              <Label>Transaction Fee</Label>
              <Question
                tooltip="Accelerating a transaction by using a higher gas price increases its chances of getting processed by the network faster"
                placement="top"
              />
            </StyledRow>
            <StyledRow>
              <StyledToggleBtn
                onClick={() => setFeeOptionType(FeeOptions.average)}
                focused={feeOptionType === FeeOptions.average}
              >
                Average
              </StyledToggleBtn>
              <StyledToggleBtn
                onClick={() => setFeeOptionType(FeeOptions.fast)}
                focused={feeOptionType === FeeOptions.fast}
              >
                Fast
              </StyledToggleBtn>
              <StyledToggleBtn
                onClick={() => setFeeOptionType(FeeOptions.fastest)}
                focused={feeOptionType === FeeOptions.fastest}
              >
                Fastest
              </StyledToggleBtn>
            </StyledRow>
          </StyledCol>
          <StyledCol>
            <StyledRow>
              <Label>Expert Mode</Label>
              <Question
                tooltip="You are able to pool RUNE + Asset with the dynamic ratio in Expert Mode"
                placement="top"
              />
            </StyledRow>
            <StyledRow>
              <StyledToggleBtn
                onClick={() => setExpertMode(ExpertOptions.on)}
                focused={expertMode === ExpertOptions.on}
              >
                On
              </StyledToggleBtn>
              <StyledToggleBtn
                onClick={() => setExpertMode(ExpertOptions.off)}
                focused={expertMode === ExpertOptions.off}
              >
                Off
              </StyledToggleBtn>
            </StyledRow>
          </StyledCol>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
