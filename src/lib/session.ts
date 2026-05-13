import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireCurrentUser() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
