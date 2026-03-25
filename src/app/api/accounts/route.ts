import { NextResponse } from "next/server";
import { getConnectedAccounts } from "@/lib/services/account-service";

export async function GET() {
  try {
    const accounts = await getConnectedAccounts();
    return NextResponse.json({ success: true, data: accounts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
