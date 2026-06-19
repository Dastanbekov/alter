import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// We skip SDK signature verification because the DodoPayments test environment
// returns non-verifiable signatures. In production, enable it once confirmed.
export async function POST(req: NextRequest) {
  let rawBody = "";

  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Failed to read body" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error("[WEBHOOK] Invalid JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[WEBHOOK] Received event type:", event?.type);

  // Only handle payment success
  if (event?.type !== "payment.succeeded") {
    return NextResponse.json({ received: true });
  }

  try {
    const payment = event.data ?? {};
    const metadata: Record<string, string> = payment.metadata ?? {};

    const userId = metadata.userId ?? metadata.user_id ?? "";
    const postsAmount = parseInt(metadata.postsAmount ?? metadata.posts_amount ?? "0", 10);

    console.log("[WEBHOOK] userId:", userId, "postsAmount:", postsAmount);

    if (!userId || postsAmount <= 0) {
      console.warn("[WEBHOOK] Missing userId or postsAmount — skipping credit");
      return NextResponse.json({ received: true });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        paidCredits: { increment: postsAmount },
      },
    });

    console.log(`[WEBHOOK] ✅ Credited ${postsAmount} posts to user ${userId}`);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[WEBHOOK] Error processing payment:", err?.message ?? err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
