import { describe, it, expect, vi, beforeEach } from "vitest";
import { useApproval, UseApprovalInput } from "./use-approval";
import { useReadContracts, UseReadContractsReturnType } from "wagmi";

vi.mock("wagmi", () => ({
  useReadContracts: vi.fn(),
}));

describe("useApproval", () => {
  const mockInput: UseApprovalInput = {
    chainId: 1,
    contract: "0x1234567890123456789012345678901234567890",
    owner: "0xowner",
    operator: "0xoperator",
    tokenId: "1",
    tokenType: "ERC721",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return loading status when data is loading", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      isLoading: true,
      data: undefined,
    } as UseReadContractsReturnType);

    const result = useApproval(mockInput);
    expect(result).toEqual({ status: "loading" });
  });

  it("should return success status with approved data for ERC721 with tokenId", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      status: "success",
      data: ["0xoperator", true],
    } as unknown as UseReadContractsReturnType);

    const result = useApproval(mockInput);
    expect(result).toEqual({ status: "success", data: { isApproved: true } });
  });

  it("should return success status with approved data for ERC721 without tokenId", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      isLoading: false,
      data: [true],
    } as unknown as UseReadContractsReturnType);

    const result = useApproval({ ...mockInput, tokenId: undefined });
    expect(result).toEqual({ status: "success", data: { isApproved: true } });
  });

  it("should return success status with approved data for ERC1155", () => {
    vi.mocked(useReadContracts).mockReturnValue({
      isLoading: false,
      data: [true],
    } as unknown as UseReadContractsReturnType);

    const result = useApproval({ ...mockInput, tokenType: "ERC1155" });
    expect(result).toEqual({ status: "success", data: { isApproved: true } });
  });
});
