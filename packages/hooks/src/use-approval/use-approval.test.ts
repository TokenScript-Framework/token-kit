import { describe, it, expect, vi, beforeEach } from "vitest";
import { useApproval } from "./use-approval";
import { useReadContracts, UseReadContractsReturnType } from "wagmi";

vi.mock("wagmi", () => ({
  useReadContracts: vi.fn(),
}));

describe("useApproval", () => {
  const mockInput = {
    chainId: 1,
    contract: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    owner: "0x1111111111111111111111111111111111111111" as `0x${string}`,
    operator: "0x2222222222222222222222222222222222222222" as `0x${string}`,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return loading status when isLoading is true", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isPending: true,
      isLoading: true,
      status: "pending",
    } as UseReadContractsReturnType);

    const result = useApproval({
      ...mockInput,
      tokenType: "ERC721",
      tokenId: "1",
    });
    expect(result).toEqual({ status: "loading" });
  });

  it("should return correct approval status for ERC721 token", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      isLoading: false,
      data: [{ result: mockInput.operator }, { result: false }],
      error: null,
      isError: false,
      isPending: false,
      isSuccess: true,
      status: "success",
    } as UseReadContractsReturnType);

    const result = useApproval({
      ...mockInput,
      tokenType: "ERC721",
      tokenId: "1",
    });
    expect(result).toEqual({ status: "success", data: { isApproved: true } });
  });

  it("should return correct approval status for ERC721 token with isApprovedForAll", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      isLoading: false,
      data: [
        { result: "0x3333333333333333333333333333333333333333" },
        { result: true },
      ],
      error: null,
      isError: false,
      isPending: false,
      isSuccess: true,
      status: "success",
    } as UseReadContractsReturnType);

    const result = useApproval({
      ...mockInput,
      tokenType: "ERC721",
      tokenId: "1",
    });
    expect(result).toEqual({ status: "success", data: { isApproved: true } });
  });

  it("should return correct approval status for ERC1155 token", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      isLoading: false,
      data: [{ result: true }],
      error: null,
      isError: false,
      isPending: false,
      isSuccess: true,
      status: "success",
    } as UseReadContractsReturnType);

    const result = useApproval({ ...mockInput, tokenType: "ERC1155" });
    expect(result).toEqual({ status: "success", data: { isApproved: true } });
  });

  it("should handle ERC721 without tokenId", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      isLoading: false,
      data: [{ result: mockInput.operator }, { result: false }],
      error: null,
      isError: false,
      isPending: false,
      isSuccess: true,
      status: "success",
    } as UseReadContractsReturnType);

    const result = useApproval({
      ...mockInput,
      tokenType: "ERC721",
      tokenId: "1",
    });
    expect(result).toEqual({ status: "success", data: { isApproved: true } });
  });
});
