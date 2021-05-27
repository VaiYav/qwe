import { Asset } from 'multichain-sdk'

import {
  STATS_ROUTE,
  LIQUIDITY_ROUTE,
  PENDING_LIQUIDITY_ROUTE,
  getSwapRoute,
  getAddLiquidityRoute,
} from 'settings/constants'

export const navMenuList = [
  {
    link: '/',
    label: 'DASHBOARD',
    isWideOnly: false,
  },
  {
    link: getSwapRoute(Asset.BTC(), Asset.RUNE()),
    label: 'SWAP',
    isWideOnly: false,
  },
  {
    link: '/pools',
    label: 'POOLS',
    isWideOnly: true,
  },
  {
    link: LIQUIDITY_ROUTE,
    label: 'LIQUIDITY',
    isWideOnly: false,
  },
  {
    link: getAddLiquidityRoute(Asset.BTC()),
    label: 'DEPOSIT',
    isWideOnly: true,
  },
  {
    link: PENDING_LIQUIDITY_ROUTE,
    label: 'PENDING',
    isWideOnly: false,
  },
  {
    link: STATS_ROUTE,
    label: 'STATS',
    isWideOnly: true,
  },
]
