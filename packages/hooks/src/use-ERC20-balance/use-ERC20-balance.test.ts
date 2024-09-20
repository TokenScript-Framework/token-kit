import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useReadContracts, UseReadContractsReturnType } from "wagmi";
import { useERC20Balance } from "./use-ERC20-balance";

vi.mock("wagmi", () => {
  return {
    useReadContracts: vi.fn(),
  };
});

describe("useERC20Balance", () => {
  it("should return pending status when data is loading", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      status: "pending",
      data: undefined,
    } as UseReadContractsReturnType);

    const { result } = renderHook(() =>
      useERC20Balance({
        chainId: 1,
        contract: "0x1234567890123456789012345678901234567890",
        wallet: "0x0987654321098765432109876543210987654321",
      }),
    );

    expect(result.current.status).toBe("pending");
    expect(result.current.data).toBeUndefined();
  });

  it("should return success status with correct data when loaded", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      status: "success",
      data: ["Token Name", "TKN", 18, 1000000000000000000n],
    } as unknown as UseReadContractsReturnType);

    const { result } = renderHook(() =>
      useERC20Balance({
        chainId: 1,
        contract: "0x1234567890123456789012345678901234567890",
        wallet: "0x0987654321098765432109876543210987654321",
      }),
    );

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual({
      formatted: "1",
      name: "Token Name",
      symbol: "TKN",
      decimals: 18,
      balance: 1000000000000000000n,
    });
  });

  it("should return error status when there's an error", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      status: "error",
      data: undefined,
    } as unknown as UseReadContractsReturnType);

    const { result } = renderHook(() =>
      useERC20Balance({
        chainId: 1,
        contract: "0x1234567890123456789012345678901234567890",
        wallet: "0x0987654321098765432109876543210987654321",
      }),
    );

    expect(result.current.status).toBe("error");
    expect(result.current.data).toBeUndefined();
  });

  it("should handle different decimal values correctly", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      status: "success",
      data: ["USDT", "USDT", 6, 1000000n],
    } as unknown as UseReadContractsReturnType);

    const { result } = renderHook(() =>
      useERC20Balance({
        chainId: 1,
        contract: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        wallet: "0x0987654321098765432109876543210987654321",
      }),
    );

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual({
      formatted: "1",
      name: "USDT",
      symbol: "USDT",
      decimals: 6,
      balance: 1000000n,
    });
  });

  it("should handle zero balance correctly", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      status: "success",
      data: ["Zero Token", "ZT", 18, 0n],
    } as unknown as UseReadContractsReturnType);

    const { result } = renderHook(() =>
      useERC20Balance({
        chainId: 1,
        contract: "0x1234567890123456789012345678901234567890",
        wallet: "0x0987654321098765432109876543210987654321",
      }),
    );

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual({
      formatted: "0",
      name: "Zero Token",
      symbol: "ZT",
      decimals: 18,
      balance: 0n,
    });
  });
});
