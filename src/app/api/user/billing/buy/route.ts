import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DodoPayments } from "dodopayments";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
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

    // Create a product on the fly for this specific amount
    const product = await dodo.products.create({
      name: `marketGO - ${amount} Posts Top-Up`,
      description: `Prepaid pack of ${amount} AI generation posts.`,
      tax_category: "saas",
      price: {
        type: "one_time_price",
        price: priceCents,
        currency: "USD",
        discount: 0,
        purchasing_power_parity: false,
      },
    });

    // Create a dynamic checkout session
    const checkout = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: product.product_id, quantity: 1 }],
      return_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard?checkout=success`,
      metadata: {
        userId: session.user.id,
        postsAmount: amount.toString(), // Store how many posts to credit
      },
    });

    return NextResponse.json({ success: true, url: checkout.checkout_url });
  } catch (error) {
    console.error("[BILLING_BUY]", error);
    return NextResponse.json({ error: "Checkout creation failed" }, { status: 500 });
  }
}
