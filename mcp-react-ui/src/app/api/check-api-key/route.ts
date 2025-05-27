import { env } from "~/env";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasKey: !!env.GOOGLE_API_KEY,
    keyPrefix: env.GOOGLE_API_KEY?.substring(0, 5),
  });
} 