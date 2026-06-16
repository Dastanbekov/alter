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
    const workspaces = await prisma.workspace.findMany({
      where: {
        userId: session.user.id,
        posts: {
          some: {
            status: "scheduled",
          },
        },
      },
      include: {
        posts: {
          where: {
            status: "scheduled",
          },
          orderBy: {
            scheduledAt: "asc",
          },
        },
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled posts" },
      { status: 500 }
    );
  }
}
