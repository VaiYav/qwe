import { CaretDownOutlined } from '@ant-design/icons'
import styled, { css } from 'styled-components'
import { palette } from 'styled-theme'

import { transition } from 'settings/style-util'

import { Modal as UnstyledModal } from '../../UIElements'
import { AssetData as UnstyledAssetData } from '../AssetData'

export const AssetSelectWrapper = styled.div<{ minWidth?: number }>`
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 2px;
  text-transform: uppercase;
  ${transition()};
`

export const AssetSelectMenuWrapper = styled.div<{ hasTitle: boolean }>`
  padding: 8px 0px;
  padding-top: ${(props) => (props.hasTitle ? 4 : 32)}px;
`

export const DropdownIcon = styled(CaretDownOutlined)`
  transition: transform 0.2s ease-in-out;
  ${({ open }) =>
    open ? 'transform: rotate(180deg);' : 'transform: rotate(0);'}
  font-size: 18px;

  svg {
    font-size: 22px;
    color: ${palette('primary', 0)};
  }
`

export const DropdownIconHolder = styled.div`
  display: flex;
  align-items: center;
  transition: transform 0.2s ease-in-out;
`

export const AssetDropdownButton = styled.button`
  ${({ disabled }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    &:focus {
      outline: none;
    }
    > * {
      margin-right: 10px;

      &:last-child {
        margin: 0;
      }
    }

    ${!disabled
      ? css`
          &:hover {
            ${DropdownIconHolder} {
              transform: translateY(-1px);
            }
          }
        `
      : ''};
  `}
`

export const AssetData = styled(UnstyledAssetData)`
  flex: 1;
  padding-left: 0;
`

export const Selector = styled.div<{ disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 2px 4px 2px 4px;
  border-radius: 0.5rem;
  cursor: ${(props) => (props.disabled ? 'inherit' : 'pointer')};

  :hover {
    background-color: ${(props) =>
      props.disabled ? 'inherit' : palette('background', 2)};
  }
`

export const Modal = styled(UnstyledModal)`
  max-width: 300px;

  .ant-modal-body {
    padding: 0px 0px;
  }

  .ant-modal-content {
    background: transparent;
  }
`
