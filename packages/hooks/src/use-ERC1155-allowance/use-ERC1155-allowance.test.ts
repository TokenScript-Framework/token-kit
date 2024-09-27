import { renderHook } from "@testing-library/react";
import { useERC1155Allowance } from "./use-ERC1155-allowance";
import { useReadContract, UseReadContractReturnType } from "wagmi";
import { describe, expect, vi } from "vitest";

vi.mock("wagmi", () => ({
  useReadContract: vi.fn(),
}));

describe("useAllowance", () => {
  const mockContractAddress = "0x1234567890123456789012345678901234567890";
  const mockOwner = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("ERC1155 balance insufficient", async () => {
    vi.mocked(useReadContract).mockReturnValue({
      data: "500000000000000000",
      status: "success",
    } as UseReadContractReturnType);

    const { result } = renderHook(() =>
      useERC1155Allowance({
        chainId: 1,
        contract: mockContractAddress,
        owner: mockOwner,
        amount: "1",
        tokenId: "1",
      }),
    );

    expect(result.current.status).toBe("success");
    expect(result.current.isAllowed).toBe(false);
  });

  test("Error status", async () => {
    vi.mocked(useReadContract).mockReturnValue({
      data: undefined,
      status: "error",
      error: new Error("Mock error"),
    } as UseReadContractReturnType);

    const { result } = renderHook(() =>
      useERC1155Allowance({
        chainId: 1,
        contract: mockContractAddress,
        owner: mockOwner,
        amount: "1",
        tokenId: "1",
      }),
    );

    expect(result.current.status).toBe("error");
    expect(result.current.isAllowed).toBeUndefined();
  });

  test("Large amount check", async () => {
    vi.mocked(useReadContract).mockReturnValue({
      data: "1000000000000000000000000",
      status: "success",
    } as UseReadContractReturnType);

    const { result } = renderHook(() =>
      useERC1155Allowance({
        chainId: 1,
        contract: mockContractAddress,
        owner: mockOwner,
        amount: "1000",
        tokenId: "1",
      }),
    );

    expect(result.current.status).toBe("success");
    expect(result.current.isAllowed).toBe(true);
  });
});
