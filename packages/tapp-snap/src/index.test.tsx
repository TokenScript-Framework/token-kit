import { describe, expect, it } from "@jest/globals";
import { assertIsAlertDialog, installSnap } from "@metamask/snaps-jest";
import { ADDRESSTYPE } from "./libs/types";
import { Dialog } from "./components/Dialog";
import { testToken } from "./libs/testContstans";

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
    };

    const response = request({
      method: "import",
      params: token,
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

    const response = request({
      method: "import",
      params: testToken,
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
});
