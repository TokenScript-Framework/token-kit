import type {
  OnHomePageHandler,
  OnRpcRequestHandler,
  OnUserInputHandler,
} from "@metamask/snaps-sdk";
import { MethodNotFoundError, UserInputEventType } from "@metamask/snaps-sdk";

import { InteractiveForm } from "./components/InteractiveForm";
import { operateForActions } from "./components/Actions";
import { getState, getSVG, updateTokenList } from "./libs/utils";
import { HomeForm } from "./components/HomeForm";
import { ADDRESSTYPE, State, TokenMetadata } from "./libs/types";

export const onHomePage: OnHomePageHandler = async () => {
  const state: State = (await getState()) as State;

  return { content: <HomeForm state={state} /> };
};

type RequestParams = {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId: string;
  owner: ADDRESSTYPE;
  actions: string[];
  name: string;
  description: string;
  aboutUrl: string;
  tokenMetadata: TokenMetadata;
};

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case "init": {
      const {
        chain,
        contract,
        tokenId,
        owner,
        actions,
        name,
        description,
        aboutUrl,
        tokenMetadata,
      } = request.params as RequestParams;

      const tokenSVG = await getSVG(tokenMetadata.image);

      const metadata = {
        chain,
        contract,
        tokenId,
        owner,
        actions,
        name,
        description,
        aboutUrl,
        tokenMetadata: { ...tokenMetadata, ...tokenSVG },
      };

      await updateTokenList(
        {
          chain,
          contract,
          tokenId,
          owner,
          actions,
          name,
          description,
          aboutUrl,
          tokenMetadata,
        },
        `${chain}-${contract}-${tokenId}`,
        owner,
      );

      return await snap.request({
        method: "snap_dialog",
        params: {
          type: "alert",
          content: (
            <InteractiveForm
              metadata={metadata}
              chain={chain}
              contract={contract}
              tokenId={tokenId}
            />
          ),
        },
      });
    }

    default:
      throw new MethodNotFoundError({
        method: request.method,
      });
  }
};

export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.type === UserInputEventType.ButtonClickEvent && event.name) {
    await operateForActions(id, event.name);
  }
};
