import { ADDRESSTYPE, State } from "../libs/types";
import { clearState, getState, getSVG, updateState } from "../libs/utils";
import { Dialog } from "./Dialog";
import { HomePage } from "./HomePage";
import { TokenPage } from "./TokenPage";

export async function operateForActions(id: string, eventName: string) {
  const params = parseViewTokenEvent(eventName);

  const state: State = (await getState()) as State;
  switch (params.actionName) {
    case "cancel": {
      await snap.request({
        method: "snap_updateInterface",
        params: {
          id,
          ui: <HomePage state={state} />,
        },
      });
      break;
    }
    case "confirmRemoveAll": {
      await clearState();
      await snap.request({
        method: "snap_updateInterface",
        params: {
          id,
          ui: <HomePage state={null} />,
        },
      });

      break;
    }
    case "removeAll": {
      await snap.request({
        method: "snap_updateInterface",
        params: {
          id,
          ui: (
            <Dialog
              type="confirm"
              title="Confirm"
              actionName="confirmRemoveAll"
              message="Are you sure to remove all tokens."
            />
          ),
        },
      });
      break;
    }
    case "viewToken": {
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
          throw new Error("Not found metadata");
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
              <TokenPage
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
    case "removeToken": {
      await snap.request({
        method: "snap_updateInterface",
        params: {
          id,
          ui: (
            <Dialog
              type="confirm"
              title="Confirm"
              actionName={`confirmRemoveToken_${params.owner}_${params.tokenKey}`}
              message="Are you sure to remove this tokens."
            />
          ),
        },
      });
      break;
    }
    case "confirmRemoveToken": {
      const state: State = (await getState()) as State;
      if (params.owner && params.tokenKey) {
        const ownerTokens = state[params.owner];
        if (ownerTokens && ownerTokens[params.tokenKey]) {
          delete ownerTokens[params.tokenKey];
          if (Object.keys(ownerTokens).length === 0) {
            delete state[params.owner];
          }
          await updateState(state);

          await snap.request({
            method: "snap_updateInterface",
            params: { id, ui: <HomePage state={state} /> },
          });
        }
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
  const [actionName, owner, token] = parts;
  if (parts.length === 1 || !token) {
    return { actionName };
  }

  const [chain, contract, tokenId] = token.split("-");
  return {
    actionName,
    owner,
    tokenKey: token,
    chain,
    contract: contract as ADDRESSTYPE,
    tokenId,
  };
}
