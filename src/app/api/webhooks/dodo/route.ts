import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DodoPayments } from "dodopayments";

const apiKey = process.env.DODO_PAYMENTS_API_KEY || "";
const dodo = new DodoPayments({
  bearerToken: apiKey,
  environment: process.env.DODO_PAYMENTS_ENV === "live_mode" ? "live_mode" : "test_mode",
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "",
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    let event;
    try {
      event = dodo.webhooks.unwrap(rawBody, { headers });
    } catch (err: any) {
      console.error("[WEBHOOK_ERROR] Signature verification failed", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle payment.succeeded event
    if (event.type === "payment.succeeded") {
      const payment = event.data;
      
      const metadata = payment.metadata || {};
      const userId = metadata.userId;
      const postsAmount = metadata.postsAmount ? parseInt(metadata.postsAmount, 10) : 0;

      if (userId && postsAmount > 0) {
        // Find user and increment paidCredits
        await prisma.user.update({
          where: { id: userId },
          data: {
            paidCredits: {
              increment: postsAmount,
            },
          },
        });
        console.log(`[WEBHOOK] Successfully credited ${postsAmount} posts to user ${userId}`);
      } else {
        console.warn("[WEBHOOK] Missing userId or postsAmount in metadata", metadata);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[WEBHOOK_ERROR]", error.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
