export const ERC165_ABI = [
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
];
export const ERC5169_ABI = ["function scriptURI() view returns (string[])"];

export const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
];
