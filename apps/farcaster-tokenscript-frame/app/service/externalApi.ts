import axios from "axios";

export const getTokenViewData = async (
  chain: string,
  address: `0x${string}`,
  tokenId: string,
  entry?: number,
) => {
  return (
    await axios.get(
      `${process.env.COMMON_API_ROOT}/token-view/${chain}/${address}/${tokenId}`,
      {
        headers: {
          "x-stl-key": process.env.API_KEY,
        },
        params: {
          entry,
        },
      },
    )
  ).data;
};
