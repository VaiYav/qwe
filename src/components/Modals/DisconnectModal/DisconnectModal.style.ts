import styled from 'styled-components'

import { Button, CoreButton } from '../../UIElements'

export const Content = styled.div`
  width: 100%;
  flex-direction: column;

  padding: 20px 20px;
`

export const Footer = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

export const ConfirmButton = styled(Button)`
  margin-left: 8px;
`
export const ActionButton = styled(CoreButton)`
  border-radius: 18px;

  div {
    padding-left: 4px;
    padding-right: 4px;
  }
`
