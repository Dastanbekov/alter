import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        paidCredits: true,
        freePostsUsed: true,
        freePostsResetAt: true,
        isPro: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let { freePostsUsed, freePostsResetAt } = user;
    const now = new Date();

    // Reset free posts if the reset time has passed
    if (freePostsResetAt && now > freePostsResetAt) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0); // Midnight next day
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          freePostsUsed: 0,
          freePostsResetAt: tomorrow,
        },
      });
      freePostsUsed = 0;
    } else if (!freePostsResetAt) {
      // First time initialization
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          freePostsResetAt: tomorrow,
        },
      });
    }

    const availableFree = Math.max(0, 2 - freePostsUsed);
    const totalAvailable = availableFree + user.paidCredits;

    return NextResponse.json({
      paidCredits: user.paidCredits,
      availableFree,
      totalAvailable,
      isPro: user.isPro,
    });
  } catch (error) {
    console.error("[BILLING_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
