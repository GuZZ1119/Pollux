import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getConnectedAccounts } from "@/lib/services/account-service";

export async function GET() {
  try {
    const session = await auth0.getSession();
    const userId = session?.user.sub ?? undefined;
    const accounts = await getConnectedAccounts(userId);
    return NextResponse.json({ success: true, data: accounts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
