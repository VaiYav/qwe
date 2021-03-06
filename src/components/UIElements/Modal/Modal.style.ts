import { Modal } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const ModalWrapper = styled(Modal)`
  border-color: ${palette('gray', 0)};

  .ant-modal-content {
    border-radius: 10px;
    overflow: hidden;
  }

  .ant-modal-header {
    padding: 10px 14px;
    text-align: center;
    background: ${palette('gradient', 0)};
    border: none;
    text-transform: uppercase;
    letter-spacing: 1.5px;

    .ant-modal-title {
      color: ${palette('text', 3)};
    }
  }
  .ant-modal-body {
    padding: 46px 32px;
    background: ${palette('background', 1)};
    border-color: ${palette('gray', 0)};

    .ant-input-prefix {
      color: ${palette('gray', 0)};
    }
    .ant-form-item-extra,
    .ant-form-explain {
      color: ${palette('text', 2)};
    }
  }
  .ant-modal-close {
    .ant-modal-close-x {
      width: 44px;
      height: 48px;
      line-height: 48px;
      color: ${palette('text', 3)};
    }
  }
  .ant-modal-footer {
    height: 46px;
    padding: 0;
    background: ${palette('background', 1)};
    border-color: ${palette('gray', 0)};
    text-transform: uppercase;

    & > div {
      display: flex;
      flex-direction: row;
      height: 100%;
    }
  }

  .ok-ant-btn,
  .cancel-ant-btn {
    flex-grow: 1;
    height: 100%;
    border: none;
    border-radius: 0px;
    background: ${palette('background', 1)};
    color: ${palette('text', 2)};

    &:first-child {
      border-right: 1px solid ${palette('gray', 0)};
    }

    &.disabled,
    &:hover,
    &:active,
    &:focus {
      color: ${palette('primary', 0)};
      background-color: ${palette('background', 1)} !important;
    }

    &.ant-btn-primary {
      color: ${palette('primary', 0)};
      border-color: ${palette('gray', 0)};

      &:hover,
      &:active,
      &:focus {
        background-color: ${palette('gradient', 1)};
        border-color: ${palette('gray', 1)};
      }
    }
  }
`
