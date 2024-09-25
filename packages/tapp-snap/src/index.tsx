import type {
  OnHomePageHandler,
  OnRpcRequestHandler,
  OnUserInputHandler,
} from "@metamask/snaps-sdk";

import { MethodNotFoundError, UserInputEventType } from "@metamask/snaps-sdk";

import { operateForActions } from "./components/Actions";
import {
  chainPipe,
  detectChain,
  detectOwner,
  getState,
  getSVG,
  getTokenMetdata,
  importTokenToState,
} from "./libs/utils";
import { ADDRESSTYPE, CheckResult, State, TokenMetadata } from "./libs/types";
import { Dialog } from "./components/Dialog";
import { HomePage } from "./components/HomePage";
import { TokenPage } from "./components/TokenPage";
import { VIEWER_ROOT } from "./libs/constants";

export const onHomePage: OnHomePageHandler = async () => {
  const state: State = (await getState()) as State;
  return { content: <HomePage state={state} /> };
};

type RequestParams = {
  chain: string;
  contract: ADDRESSTYPE;
  tokenId: string;
  actions: string[];
  name: string;
  description: string;
  aboutUrl: string;
  tokenMetadata: TokenMetadata;
  type: string;
};

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case "import": {
      const { chain, contract, tokenId } = request.params as RequestParams;
      const detectResult = await checkChainAndOwner(chain, contract, tokenId);

      if (!detectResult.result) {
        return detectResult.dialog;
      }

      const owner = detectResult.owner;
      const { actions, name, description, aboutUrl, tokenMetadata, signed } =
        await getTokenMetdata(chain, contract, tokenId);
      if (!signed) {
        return await showWarningDialog(
          "The token is not signed, please change one.",
        );
      }

      const tokenSVG = await getSVG(tokenMetadata.image);
      await importTokenToState(
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

      return await snap.request({
        method: "snap_dialog",
        params: {
          type: "alert",
          content: (
            <TokenPage
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

const checkChainAndOwner = async (
  chain: string,
  contract: ADDRESSTYPE,
  tokenId: string,
): Promise<CheckResult> => {
  if (!(await detectChain(chain))) {
    return {
      result: false,
      dialog: await showWarningDialog(
        `Network mismatch, please switch to ${chainPipe(Number(chain))}, and try again.`,
      ),
    };
  }

  const { isOwner, owner } = await detectOwner(contract, tokenId);
  if (!isOwner) {
    return {
      result: false,
      dialog: await showWarningDialog(
        "The owner wallet mismatch, please confirm you've import this wallet and set the request permission.",
      ),
    };
  }

  return {
    result: true,
    owner: owner as ADDRESSTYPE,
  };
};

const showWarningDialog = async (message: string) => {
  return await snap.request({
    method: "snap_dialog",
    params: {
      type: "alert",
      content: <Dialog type="alert" title="Warning" message={message} />,
    },
  });
};
