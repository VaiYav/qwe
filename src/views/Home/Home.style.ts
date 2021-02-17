import { ContentView } from 'components'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const HomeContainer = styled(ContentView)`
  background: ${palette('background', 3)};
`
export const PoolTableView = styled.div`
  padding: 10px 0;
`

export const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`
