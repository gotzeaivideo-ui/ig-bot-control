import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("ig-bot-auth")?.value;
  if (authCookie !== process.env.APP_PASSCODE) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { handle, action } = body as { handle?: string; action?: string };

  if (!handle || !action) {
    return NextResponse.json({ error: "missing handle or action" }, { status: 400 });
  }

  if (!["on", "off", "status"].includes(action)) {
    return NextResponse.json({ error: "bad action" }, { status: 400 });
  }

  const url = new URL(process.env.BOT_CONTROL_URL as string);
  url.searchParams.set("action", action);
  url.searchParams.set("u", handle);
  url.searchParams.set("s", process.env.BOT_CONTROL_SECRET as string);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(url.toString());
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }

  const text = await upstreamResponse.text();

  if (upstreamResponse.status === 404) {
    return NextResponse.json({ result: "not_found" });
  }

  if (upstreamResponse.status === 403) {
    return NextResponse.json({ result: "misconfigured" }, { status: 500 });
  }

  if (!upstreamResponse.ok) {
    return NextResponse.json({ result: "error" }, { status: 500 });
  }

  if (action === "status") {
    const isPaused = text.includes('"bot_paused": true');
    return NextResponse.json({ result: isPaused ? "off" : "on" });
  }

  return NextResponse.json({ result: "ok" });
}