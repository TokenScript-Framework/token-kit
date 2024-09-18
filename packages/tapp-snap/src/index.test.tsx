import { describe, expect, it, jest } from "@jest/globals";
import { assertIsAlertDialog, installSnap } from "@metamask/snaps-jest";
import { ADDRESSTYPE, State } from "./libs/types";
import { Dialog } from "./components/Dialog";
import { HomePage } from "./components/HomePage";
import {
  testOwner,
  testState,
  testToken,
  tokenMetadata,
} from "./libs/testContstans";
import * as utils from "./libs/utils";

describe("Wrong method for onRpcRequest", () => {
  it("throws an error if the requested method does not exist", async () => {
    const { request } = await installSnap();

    const response = await request({
      method: "test",
    });

    expect(response).toRespondWithError({
      code: -32601,
      message: "The method does not exist / is not available.",
      stack: expect.any(String),
      data: {
        method: "test",
        cause: null,
      },
    });
  });
});

describe("Right method for onRpcRequest", () => {
  it("Network mismatch dialog", async () => {
    const { request } = await installSnap();
    const token = {
      chain: "11155111",
      contract: "0x3490ffc64a4e65abb749317f7860e722ba65a2b5" as ADDRESSTYPE,
      tokenId: "2665409553",
      name: "test",
      description: "test",
      aboutUrl: "https://test.com",
      actions: ["action1"],
    };

    const testMetadata = { ...token, tokenMetadata: tokenMetadata };
    const response = request({
      method: "import",
      params: testMetadata,
    });

    const formScreen = await response.getInterface();
    expect(formScreen).toRender(
      <Dialog
        type="alert"
        title="Warning"
        message="Network mismatch, please switch to Sepolia, and try again."
      />,
    );
    expect(formScreen).toHaveProperty("type", "alert");
    assertIsAlertDialog(formScreen);

    await formScreen.ok();

    expect(await response).toRespondWith(null);
  });

  it("Owner mismatch dialog", async () => {
    const { request } = await installSnap();

    const testMetadata = { ...testToken, tokenMetadata: tokenMetadata };
    const response = request({
      method: "import",
      params: testMetadata,
    });

    const formScreen = await response.getInterface();
    expect(formScreen).toRender(
      <Dialog
        type="alert"
        title="Warning"
        message="The owner wallet mismatch, please confirm you've import this wallet and set the request permission."
      />,
    );
    expect(formScreen).toHaveProperty("type", "alert");
    assertIsAlertDialog(formScreen);

    await formScreen.ok();

    expect(await response).toRespondWith(null);
  });

  it("Right Token dialog", async () => {
    const { request, mockJsonRpc } = await installSnap();

    mockJsonRpc({
      method: "eth_requestAccounts",
      result: [testOwner],
    });

    const testMetadata = {
      ...testToken,
      tokenMetadata,
    };

    const response = request({
      method: "import",
      params: testMetadata,
    });

    const formScreen = await response.getInterface();
    expect(formScreen).toHaveProperty("type", "alert");
    assertIsAlertDialog(formScreen);

    await formScreen.ok();

    expect(await response).toRespondWith(null);
  });

  it("Return no token in home page", async () => {
    const { onHomePage } = await installSnap();

    const response = await onHomePage();

    const screen = response.getInterface();

    expect(screen).toRender(<HomePage state={null} />);
  });

  it("Return token list in home page", async () => {
    const { request, onHomePage, mockJsonRpc } = await installSnap();

    mockJsonRpc({
      method: "eth_requestAccounts",
      result: [testOwner],
    });

    const testMetadata = {
      ...testToken,
      tokenMetadata,
    };

    const importResponse = request({
      method: "import",
      params: testMetadata,
    });

    const formScreen = await importResponse.getInterface();
    expect(formScreen).toHaveProperty("type", "alert");
    assertIsAlertDialog(formScreen);

    jest
      .spyOn(utils, "getState")
      .mockImplementation(() => Promise.resolve(testState));

    const response = await onHomePage();

    const screen = response.getInterface();
    const state = (await utils.getState()) as State | null;

    expect(state).toBeDefined();
    expect(state).toEqual(testState);
    expect(screen).toRender(<HomePage state={state} />);
  });
});
