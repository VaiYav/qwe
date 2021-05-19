import styled from 'styled-components/macro'
import { palette } from 'styled-theme'

import { Label } from 'components/UIElements'

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;

  height: 50px;
  padding: 4px 8px;

  background: ${palette('background', 3)};

  svg {
    font-size: 14px;
    color: ${palette('text', 0)};

    cursor: pointer;
  }
`

export const ChainInfo = styled.div`
  display: flex;
  align-items: center;

  button {
    margin-left: 0;
  }
`

export const InfoLabel = styled(Label)``

export const Address = styled.div`
  display: flex;
  align-items: center;

  button {
    margin-left: 0;
  }
`

export const AddressLabel = styled(Label)`
  margin-right: 4px;
  cursor: pointer;
`

export const Tools = styled.div`
  display: flex;
  align-items: center;
`

export const ToolWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 2px;

  cursor: ponter;

  svg {
    width: 14px;
    height: 14px;
  }
`

export const WalletType = styled(ToolWrapper)`
  margin-top: -4px;
  padding: 0px;

  & > div {
    width: 14px;
    height: 14px;
  }
`
