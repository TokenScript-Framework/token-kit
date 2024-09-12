import { ADDRESSTYPE, State } from "../libs/types";
import { clearState, getState, getSVG } from "../libs/utils";
import { HomeForm } from "./HomeForm";
import { InteractiveForm } from "./InteractiveForm";

const ACTIONNAME_VIEWTOKEN = "viewToken";
export async function operateForActions(id: string, eventName: string) {
  const isViewTokenAction = eventName.startsWith(ACTIONNAME_VIEWTOKEN);
  const buttonName = isViewTokenAction ? ACTIONNAME_VIEWTOKEN : eventName;
  const params = isViewTokenAction
    ? parseViewTokenEvent(eventName)
    : {
        owner: "",
        tokenKey: "",
        chain: "",
        contract: "" as ADDRESSTYPE,
        tokenId: "",
      };

  switch (buttonName) {
    case "clear": {
      await clearState();
      await snap.request({
        method: "snap_updateInterface",
        params: {
          id,
          ui: <HomeForm state={null} />,
        },
      });
      break;
    }
    case "viewToken": {
      const state: State = (await getState()) as State;
      if (state === null) {
        throw new Error("State is null");
      }

      if (
        params.owner &&
        params.tokenKey &&
        params.chain &&
        params.tokenId &&
        state[params.owner]
      ) {
        const ownerTokens = state[params.owner];
        if (!ownerTokens || !ownerTokens[params.tokenKey]) {
          throw new Error("Token not found");
        }

        const metadata = ownerTokens[params.tokenKey];

        if (!metadata) {
          throw new Error("Metdata no found");
        }
        const tokenSVG = await getSVG(metadata.tokenMetadata.image);

        const updatedMetadata = {
          ...metadata,
          tokenMetadata: {
            ...metadata.tokenMetadata,
            ...tokenSVG,
          },
        };
        return await snap.request({
          method: "snap_dialog",
          params: {
            type: "alert",
            content: (
              <InteractiveForm
                metadata={updatedMetadata}
                chain={params.chain}
                contract={params.contract}
                tokenId={params.tokenId}
              />
            ),
          },
        });
      }
      break;
    }
    default:
      console.log("Unknow opertion:", eventName);
      break;
  }
}

function parseViewTokenEvent(event: string) {
  const parts = event.split("_");
  if (parts.length < 3) {
    throw new Error("Invalid event format");
  }
  const [, owner, token] = parts;
  if (!token) {
    throw new Error("Token is undefined");
  }
  const [chain, contract, tokenId] = token.split("-");
  return {
    owner,
    tokenKey: token,
    chain,
    contract: contract as ADDRESSTYPE,
    tokenId,
  };
}
