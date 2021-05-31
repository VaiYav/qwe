import React, { useCallback } from 'react'

import { Overlay, Label } from '../../UIElements'
import * as Styled from './DisconnectModal.style'

export type DisconnectModalProps = {
  visible: boolean
  onOk?: () => void
  onCancel: () => void
}

export const DisconnectModal: React.FC<DisconnectModalProps> = (
  props,
): JSX.Element => {
  const { visible, onOk, onCancel } = props

  const handleOk = useCallback(() => {
    if (onOk) onOk()
  }, [onOk])

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  return (
    <Overlay isOpen={visible} onDismiss={handleCancel}>
      <Styled.Content>
        <Label align="center">
          Are you sure you want to disconnect your wallet?
        </Label>
        <Styled.Footer>
          <Styled.ActionButton onClick={handleCancel}>
            <Label color="primary">Cancel</Label>
          </Styled.ActionButton>
          <Styled.ConfirmButton round onClick={handleOk}>
            Confirm
          </Styled.ConfirmButton>
        </Styled.Footer>
      </Styled.Content>
    </Overlay>
  )
}
