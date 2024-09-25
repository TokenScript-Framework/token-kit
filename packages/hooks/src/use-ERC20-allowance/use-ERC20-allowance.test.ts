import { renderHook } from "@testing-library/react";
import { useERC20Allowance } from "./use-ERC20-allowance";
import { useReadContracts, UseReadContractsReturnType } from "wagmi";
import { describe, expect, vi } from "vitest";

vi.mock("wagmi", () => ({
  useReadContracts: vi.fn(),
}));

describe("useERC20Allowance", () => {
  const mockContractAddress = "0x1234567890123456789012345678901234567890";
  const mockOwner = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
  const mockSpender = "0x9876543210987654321098765432109876543210";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return isAllowed for ERC20 allowance", async () => {
    const mockInput = {
      chainId: 1,
      tokenType: "ERC20" as const,
      contract: "0x1234567890123456789012345678901234567890" as `0x${string}`,
      owner: "0xowner" as `0x${string}`,
      spender: "0xspender" as `0x${string}`,
      amount: "1", // 1 token
    };
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        BigInt("2000000000000000000"), // allowance
        BigInt("3000000000000000000"), // balance
        18, // decimals
      ],
      status: "success",
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isSuccess: true,
    } as UseReadContractsReturnType<readonly unknown[], boolean, unknown>);

    const { result } = renderHook(() => useERC20Allowance(mockInput));

    expect(result.current).toEqual({ status: "success", isAllowed: true });
  });

  test("should return isAllowed false for ERC20 allowance when allowance is insufficient", async () => {
    const mockInput = {
      chainId: 1,
      tokenType: "ERC20" as const,
      contract: "0x1234567890123456789012345678901234567890" as `0x${string}`,
      owner: "0xowner" as `0x${string}`,
      spender: "0xspender" as `0x${string}`,
      amount: "5", // 1 token
    };
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        BigInt("2000000000000000000"), // allowance
        BigInt("3000000000000000000"), // balance
        18, // decimals
      ],
      status: "success",
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isSuccess: true,
    } as UseReadContractsReturnType<readonly unknown[], boolean, unknown>);

    const { result } = renderHook(() => useERC20Allowance(mockInput));

    expect(result.current).toEqual({ status: "success", isAllowed: false });
  });

  test("Pending status", async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: undefined,
      status: "pending",
    } as UseReadContractsReturnType<readonly unknown[], boolean, unknown>);

    const { result } = renderHook(() =>
      useERC20Allowance({
        chainId: 1,
        contract: mockContractAddress,
        owner: mockOwner,
        spender: mockSpender,
        amount: "100000000000000000",
      }),
    );

    expect(result.current.status).toBe("pending");
    expect(result.current.isAllowed).toBeUndefined();
  });
});
