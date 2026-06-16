import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postsAmount, productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: session.user.email || undefined,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        postsAmount: postsAmount?.toString() || "0",
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[POLAR_CHECKOUT]", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
