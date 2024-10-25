import {
  GET as originalGET,
  POST as originalPOST,
} from "@frames.js/render/next";
import { NextRequest, NextResponse } from "next/server";

export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}

const handleRequest =
  (handler: (req: NextRequest) => Promise<Response>) =>
  async (req: NextRequest) => {
    const response = await handler(req);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  };

export const GET = handleRequest(originalGET);
export const POST = handleRequest(originalPOST);
