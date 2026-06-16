import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount } = await req.json(); // amount is the number of posts

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const getPrice = (posts: number) => {
      if (posts <= 10) return 3.0;
      if (posts <= 50) return 10.0;
      if (posts <= 100) return 18.0;
      if (posts <= 200) return 32.0;
      return (posts / 500) * 69.0;
    };

    const priceUsd = getPrice(amount);
    const priceCents = Math.round(priceUsd * 100);

    // Create a dynamic checkout session
    const checkout = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID || ""],
      successUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard?checkout=success`,
      amount: priceCents, // Set exact price in cents
      metadata: {
        userId: session.user.id,
        postsAmount: amount.toString(), // Store how many posts to credit
      },
    });

    return NextResponse.json({ success: true, url: checkout.url });
  } catch (error) {
    console.error("[BILLING_BUY]", error);
    return NextResponse.json({ error: "Checkout creation failed" }, { status: 500 });
  }
}
