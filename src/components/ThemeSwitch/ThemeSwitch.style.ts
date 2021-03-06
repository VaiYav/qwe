import styled from 'styled-components'
import { palette } from 'styled-theme'

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  position: relative;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 32px;
  padding: 0.15rem 0.25rem;
  border-radius: 0.5rem;

  margin-left: 0;
  outline: none;

  :hover {
    cursor: pointer;
    outline: none;
    background-color: ${palette('background', 2)};
  }

  > * {
    stroke: ${palette('text', 0)};
  }
`
