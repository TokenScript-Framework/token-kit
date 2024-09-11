import { describe, expect, it } from "@jest/globals";
import { assertIsAlertDialog, installSnap } from "@metamask/snaps-jest";

import { ADDRESSTYPE } from "./libs/types";

const metadata = {
  image:
    "https://resources.smartlayer.network/smartcat/reources/images/e5fd0c706c4eb3cc7f4295797f91e02e.png",
  attributes: [
    {
      trait_type: "Collection",
      value: "SmartCats",
    },
    {
      trait_type: "TokenId",
      value: "2665409553",
    },
    {
      trait_type: "Background",
      value: "SL Background Pink (Common)",
    },
    {
      trait_type: "Hat",
      value: "Glasses Black (Common)",
    },
    {
      trait_type: "Outfit",
      value: "SL Light Blue Hoodie (Common)",
    },
  ],
  description: "SmartCat#2426-2665409553",
  name: "SmartCat#2426-2665409553",
};

describe("onRpcRequest", () => {
  it("throws an error if the requested method does not exist", async () => {
    const { request } = await installSnap();

    const response = await request({
      method: "foo",
    });

    expect(response).toRespondWithError({
      code: -32601,
      message: "The method does not exist / is not available.",
      stack: expect.any(String),
      data: {
        method: "foo",
        cause: null,
      },
    });
  });

  describe("dialog", () => {
    it("creates a new Snap interface and use it in a confirmation dialog", async () => {
      const { request } = await installSnap();
      const token = {
        chain: "11155111",
        contract: "0x3490ffc64a4e65abb749317f7860e722ba65a2b5" as ADDRESSTYPE,
        tokenId: "2665409553",
        owner: "0x16f1CdF5200d7ae7f07c1522f19052A722D93970" as ADDRESSTYPE,
        name: "test",
        description: "test",
        aboutUrl: "https://test.com",
        actions: ["action1"],
      };

      const testMetadata = { ...token, tokenMetadata: metadata };
      const response = request({
        method: "init",
        params: testMetadata,
      });

      const formScreen = await response.getInterface();
      expect(formScreen).toHaveProperty("type", "alert");
      assertIsAlertDialog(formScreen);

      await formScreen.ok();

      expect(await response).toRespondWith(null);
    });
  });
});
