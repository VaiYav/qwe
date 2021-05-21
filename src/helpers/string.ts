export enum AddressTruncMode {
  Short,
  Long,
}

export const truncateAddress = (
  addr: string,
  mode = AddressTruncMode.Short,
) => {
  if (addr && addr.length > 9) {
    const first =
      mode === AddressTruncMode.Short ? addr.substr(0, 6) : addr.substr(0, 10)
    const last =
      mode === AddressTruncMode.Short
        ? addr.substr(addr.length - 3, 3)
        : addr.substr(addr.length - 8, 8)
    return `${first}...${last}`
  }
  return addr
}
