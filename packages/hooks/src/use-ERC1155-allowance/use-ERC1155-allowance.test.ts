import { renderHook } from "@testing-library/react";
import { useERC1155Allowance } from "./use-ERC1155-allowance";
import { useReadContracts, UseReadContractsReturnType } from "wagmi";
import { describe, expect, vi } from "vitest";

vi.mock("wagmi", () => ({
  useReadContracts: vi.fn(),
}));

describe("useAllowance", () => {
  const mockContractAddress = "0x1234567890123456789012345678901234567890";
  const mockOwner = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("ERC1155 balance check", async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [{ result: "1" }],
      status: "success",
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isSuccess: true,
    } as UseReadContractsReturnType<readonly unknown[], boolean, unknown>);

    const { result } = renderHook(() =>
      useERC1155Allowance({
        chainId: 1,
        contract: mockContractAddress,
        owner: mockOwner,
        amount: "100000000000000000",
        tokenId: "1",
      }),
    );

    expect(result.current.status).toBe("success");
    expect(result.current.isAllowed).toBe(true);
  });

  test("Pending status", async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: undefined,
      status: "pending",
    } as UseReadContractsReturnType<readonly unknown[], boolean, unknown>);

    const { result } = renderHook(() =>
      useERC1155Allowance({
        chainId: 1,
        contract: mockContractAddress,
        owner: mockOwner,
        amount: "100000000000000000",
        tokenId: "1",
      }),
    );

    expect(result.current.status).toBe("pending");
    expect(result.current.isAllowed).toBeUndefined();
  });
});
