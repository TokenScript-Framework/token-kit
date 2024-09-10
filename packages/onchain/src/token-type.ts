import { ethers, Provider } from "ethers";
import { ERC1155, ERC721 } from "./constant";
import { ABI } from "./abi";

export async function isValidateToken(
  type: "ERC721" | "ERC1155",
  address: string,
  provider: Provider
) {
  const validateERC5169 = await isERC5169(address, provider);
  if (!validateERC5169) {
    return false;
  }

  const contract = new ethers.Contract(address, ABI, provider);
  const interfaceId = type === "ERC721" ? ERC721 : ERC1155;

  try {
    return await Promise.any(
      interfaceId.map((id) => contract.supportsInterface(id))
    );
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function isERC5169(address: string, provider: Provider) {
  const contract = new ethers.Contract(address, ABI, provider);
  try {
    await contract.scriptURI();
    return true;
  } catch (err) {
    //console.error(err);
    return false;
  }
}
