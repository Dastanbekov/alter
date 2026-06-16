import { NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("webhook-signature");
    const secret = process.env.POLAR_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[POLAR_WEBHOOK] Missing POLAR_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Missing secret" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook payload
    const payload = validateEvent(bodyText, Object.fromEntries(req.headers) as Record<string, string>, secret);

    // Process order.created
    if (payload.type === "order.created") {
      const order = payload.data;
      const metadata = order.metadata as Record<string, string> | undefined;

      const userId = metadata?.userId;
      const postsAmountStr = metadata?.postsAmount;

      if (!userId) {
        console.warn("[POLAR_WEBHOOK] order.created missing userId in metadata", order.id);
        return NextResponse.json({ received: true });
      }

      const postsAmount = parseInt(postsAmountStr || "0", 10);

      if (postsAmount > 0) {
        // Grant credits and unlock PRO
        await prisma.user.update({
          where: { id: userId },
          data: {
            paidCredits: {
              increment: postsAmount,
            },
            isPro: true,
          },
        });
        console.log(`[POLAR_WEBHOOK] Granted ${postsAmount} posts to user ${userId} and unlocked PRO.`);
      }
    }

    // Also handle checkout.updated if preferred by some integrations, 
    // but order.created is the standard for successful purchases.

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[POLAR_WEBHOOK]", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 400 });
  }
}
