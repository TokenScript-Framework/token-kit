import { ethers, Provider } from "ethers";
import { ERC1155InterfaceId, ERC721InterfaceId } from "./constant";
import { ABI, ERC20_ABI } from "./abi";

export async function tokenType(address: string, provider: Provider) {
  if (await isERC20(address, provider)) {
    return { type: "ERC20" };
  }

  const contract = new ethers.Contract(address, ABI, provider);

  try {
    const supportedERC721Keys = await checkInterfaces(
      contract,
      ERC721InterfaceId,
    );

    if (supportedERC721Keys.length > 0) {
      return { type: "ERC721", supportedInterfaces: supportedERC721Keys };
    }

    const supportedERC1155Keys = await checkInterfaces(
      contract,
      ERC1155InterfaceId,
    );

    if (supportedERC1155Keys.length > 0) {
      return { type: "ERC1155", supportedInterfaces: supportedERC1155Keys };
    }

    if (await isERC5169(address, provider)) {
      return { type: "ERC5169" };
    }

    return { type: "Unknown Type" };
  } catch (err) {
    console.error(err);
    return { type: "Unknow Type" };
  }
}

async function checkInterfaces(contract, interfaceIds) {
  const entries = Object.entries(interfaceIds);
  const supportedInterfaces = await Promise.all(
    entries.map(async ([key, value]) => {
      const isSupported = await contract.supportsInterface(value);
      return isSupported ? key : null;
    }),
  );
  return supportedInterfaces.filter(Boolean);
}

async function isERC5169(address: string, provider: Provider) {
  const contract = new ethers.Contract(address, ABI, provider);
  try {
    await contract.scriptURI();
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function isERC20(address: string, provider: Provider) {
  const contract = new ethers.Contract(address, ERC20_ABI, provider);
  try {
    await Promise.all([
      contract.totalSupply(),
      contract.balanceOf("0x0000000000000000000000000000000000000000"),
    ]);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
