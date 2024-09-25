import { describe, expect, it, vi } from "vitest";
import { useReadContract, UseReadContractReturnType } from "wagmi";
import { useOwner, UseOwnerInput } from "./use-owner";

vi.mock("wagmi", () => {
  return {
    useReadContract: vi.fn(),
  };
});

describe("useOwner", () => {
  const mockInput: UseOwnerInput = {
    chainId: 1,
    contract: "0x06012c8cf97bead5deae237070f9587f8e7a2690",
    tokenId: "1",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return loading status when data is pending", () => {
    vi.mocked(useReadContract).mockReturnValue({
      data: undefined,
      status: "pending",
    } as UseReadContractReturnType);

    const result = useOwner(mockInput);
    expect(result).toEqual({ status: "loading" });
  });

  it("should return error status when data is error", () => {
    vi.mocked(useReadContract).mockReturnValue({
      data: undefined,
      status: "error",
    } as UseReadContractReturnType);

    const result = useOwner(mockInput);
    expect(result).toEqual({ status: "error" });
  });

  it("should return success status when data is ready", () => {
    const mockOwner = { owner: "0xabcdef1234567890abcdef1234567890abcdef12" };
    vi.mocked(useReadContract).mockReturnValue({
      data: mockOwner,
      status: "success",
    } as UseReadContractReturnType);

    const result = useOwner(mockInput);
    expect(result).toEqual({ status: "success", data: mockOwner });
  });

  it("use right params for useReadContract", () => {
    useOwner(mockInput);

    expect(useReadContract).toHaveBeenCalledWith({
      chainId: mockInput.chainId,
      address: mockInput.contract,
      abi: expect.any(Array),
      functionName: "ownerOf",
      args: [BigInt(mockInput.tokenId)],
    });
  });
});
