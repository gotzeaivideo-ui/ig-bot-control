"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const passcode = formData.get("passcode");

  if (passcode !== process.env.APP_PASSCODE) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("ig-bot-auth", process.env.APP_PASSCODE as string, {
    httpOnly: true,
secure: process.env.NODE_ENV === "production",    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/");
}