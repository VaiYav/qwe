import { AssetETH, Asset } from '@xchainjs/xchain-util'

// toxic tether https://ropsten.etherscan.io/token/0xa3910454bf2cb59b8b3a401589a3bacc5ca42306
export const AssetUSDTERC20: Asset = {
  chain: 'ETH',
  symbol: 'USDT-0xa3910454bf2cb59b8b3a401589a3bacc5ca42306',
  ticker: 'USDT',
}

export const AssetRuneEthERC20: Asset = {
  chain: 'ETH',
  symbol: 'RUNE-0xd601c6A3a36721320573885A8d8420746dA3d7A0',
  ticker: 'RUNE',
}

// ETH.THOR - for testnet only
export const AssetThorERC20: Asset = {
  chain: 'ETH',
  symbol: 'THOR-0xA0b515c058F127a15Dd3326F490eBF47d215588e',
  ticker: 'THOR',
}

export const AssetTKN8ERC20: Asset = {
  chain: 'ETH',
  symbol: 'TKN8-0x242aD49dAcd38aC23caF2ccc118482714206beD4',
  ticker: 'TKN8',
}

export const AssetTKN18ERC20: Asset = {
  chain: 'ETH',
  symbol: 'TKN18-0x8E3f9E9b5B26AAaE9d31364d2a8e8a9dd2BE3B82',
  ticker: 'TKN18',
}

export const AssetWETHERC20: Asset = {
  chain: 'ETH',
  symbol: 'WETH-0xbCA556c912754Bc8E7D4Aad20Ad69a1B1444F42d',
  ticker: 'WETH',
}

export const AssetDAIERC20: Asset = {
  chain: 'ETH',
  symbol: 'DAI-0XAD6D458402F60FD3BD25163575031ACDCE07538D',
  ticker: 'DAI',
}

export const AssetXRUNEERC20: Asset = {
  chain: 'ETH',
  symbol: 'XRUNE-0x8626DB1a4f9f3e1002EEB9a4f3c6d391436Ffc23',
  ticker: 'XRUNE',
}

// This hardcode list is for testnet only
export const ERC20Assets = [AssetUSDTERC20, AssetDAIERC20, AssetXRUNEERC20]

export const ETHAssets = [AssetETH, ...ERC20Assets]
