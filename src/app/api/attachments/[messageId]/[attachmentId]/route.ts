import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

/**
 * GET /api/attachments/:messageId/:attachmentId
 *
 * TODO: Implement real attachment download.
 * Implementation steps:
 *   1. Strip "gmail-" prefix from messageId to get the raw Gmail message ID.
 *   2. Use createGmailClient(userId) from "@/lib/gmail/client".
 *   3. Call gmail.users.messages.attachments.get({
 *        userId: "me", messageId: rawId, id: attachmentId
 *      }).
 *   4. Decode the base64url `data` field from the response.
 *   5. Return as a binary Response with:
 *      - Content-Type from the original part's mimeType
 *      - Content-Disposition: attachment; filename="<original filename>"
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ messageId: string; attachmentId: string }> },
) {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { messageId, attachmentId } = await params;

  return NextResponse.json(
    {
      success: false,
      error: "Attachment download not yet implemented",
      meta: { messageId, attachmentId, userId: session.user.sub },
    },
    { status: 501 },
  );
}
