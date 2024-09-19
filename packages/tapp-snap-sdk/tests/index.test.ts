import { renderHook, act } from "@testing-library/react-hooks";
import { waitFor } from "@testing-library/react";
import { afterEach, expect, beforeEach, describe, it, vi } from "vitest";
import { useMetaMaskStatus } from "../src/hooks/useMetaMaskStatus";
import { JSDOM } from "jsdom";

declare global {
  interface Window {
    ethereum: {
      isMetaMask: boolean;
      request: (method: string, params?: unknown[]) => Promise<unknown>;
    };
  }
}

describe("useMetaMaskStatus", () => {
  const mockSnapId = "npm:@metamask/example-snap";

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "http://localhost",
    });
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;
    global.window.ethereum = {
      isMetaMask: true,
      request: vi.fn().mockImplementation(() => Promise.resolve()),
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
    (global.window as Partial<Window>).ethereum = undefined;
  });

  it("Should detect MetaMask installed is true", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useMetaMaskStatus(mockSnapId),
    );

    await waitForNextUpdate();

    expect(result.current.isMetaMaskInstalled).toBe(true);
  });

  it("Should detect isFlask is true", async () => {
    (
      global.window.ethereum.request as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce("MetaMask/v10.8.1-flask.0");

    const { result, waitForNextUpdate } = renderHook(() =>
      useMetaMaskStatus(mockSnapId),
    );

    await waitForNextUpdate();

    expect(result.current.isFlask).toBe(true);
  });

  it("Should detect snap installed is true", async () => {
    (global.window.ethereum.request as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("MetaMask/v10.8.1-flask.0")
      .mockResolvedValueOnce({ [mockSnapId]: {} });

    const { result, waitForNextUpdate } = renderHook(() =>
      useMetaMaskStatus(mockSnapId),
    );

    await waitForNextUpdate();

    expect(result.current.isSnapInstalled).toBe(true);
  });

  it("Should return right status", async () => {
    (
      global.window.ethereum.request as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("Test error"));

    const { result } = renderHook(() => useMetaMaskStatus(mockSnapId));

    await waitFor(() => {
      expect(result.current.isMetaMaskInstalled).toBe(true);
      expect(result.current.isFlask).toBe(false);
      expect(result.current.isSnapInstalled).toBe(false);
    });
  });

  it("refreshSnapStatus should refresh isSnapInstalled", async () => {
    (global.window.ethereum.request as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("MetaMask/v10.8.1-flask.0")
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ [mockSnapId]: {} });

    const { result, waitForNextUpdate } = renderHook(() =>
      useMetaMaskStatus(mockSnapId),
    );

    await waitForNextUpdate();

    expect(result.current.isSnapInstalled).toBe(false);

    act(() => {
      result.current.refreshSnapStatus();
    });

    await waitForNextUpdate();

    expect(result.current.isSnapInstalled).toBe(true);
  });
});
