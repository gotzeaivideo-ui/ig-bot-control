"use client";

import { useEffect, useState } from "react";
import { extractHandle } from "./lib/handle";

type Status = "on" | "off" | "unknown" | "checking";

export default function Home() {
  const [input, setInput] = useState("");
  const [handle, setHandle] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<Status>("unknown");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleChange(value: string) {
    setInput(value);
    const result = extractHandle(value);
    setHandle(result);
    setInvalid(value.trim().length > 0 && result === null);
    setMessage(null);
    setStatus("unknown");
  }

  useEffect(() => {
    if (!handle) return;

    let cancelled = false;
    setStatus("checking");

    callApi(handle, "status").then((res) => {
      if (cancelled) return;
      if (res.result === "on" || res.result === "off") {
        setStatus(res.result);
      } else {
        setStatus("unknown");
        setMessage(describeResult(res.result));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  async function callApi(h: string, action: "on" | "off" | "status") {
    const res = await fetch("/api/bot-control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: h, action }),
    });
    return res.json();
  }

  async function handleAction(action: "on" | "off") {
    if (!handle) return;
    setBusy(true);
    setMessage(null);
    const res = await callApi(handle, action);
    setBusy(false);

    if (res.result === "ok") {
      setStatus(action === "on" ? "on" : "off");
      setMessage(action === "on" ? "Bot enabled for this person" : "Bot disabled for this person");
    } else {
      setMessage(describeResult(res.result));
    }
  }

  function describeResult(result: string): string {
    switch (result) {
      case "not_found":
        return "They have to DM us first, nothing to control yet";
      case "misconfigured":
        return "The app is misconfigured";
      default:
        return "Something went wrong. Please try again";
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-4 text-white">
      <h1 className="text-2xl font-semibold">Bot Control</h1>

      <input
  type="text"
  value={input}
  onChange={(e) => handleChange(e.target.value)}
  placeholder="Paste Instagram profile URL or @handle"
  autoCapitalize="none"
  autoCorrect="off"
  spellCheck={false}
  className="w-full max-w-md rounded-xl bg-neutral-800 px-4 py-4 text-lg outline-none"
/>

      {handle && (
        <p className="text-lg text-green-400">Resolved handle: @{handle}</p>
      )}

      {invalid && (
        <p className="text-lg text-red-400">
          That doesn&apos;t look like a valid profile link or handle.
        </p>
      )}

      {handle && status !== "unknown" && (
        <p className="text-lg text-neutral-300">
          Current state:{" "}
          <span className="font-semibold">
            {status === "checking" ? "Checking..." : status === "on" ? "On" : "Off"}
          </span>
        </p>
      )}

      {message && <p className="text-lg text-yellow-400">{message}</p>}
      <div className="flex gap-4">
        <button
          disabled={!handle || busy}
          onClick={() => handleAction("on")}
          className="rounded-xl bg-green-600 px-8 py-4 text-lg font-medium disabled:opacity-30"
        >
          Enable
        </button>
        <button
          disabled={!handle || busy}
          onClick={() => handleAction("off")}
          className="rounded-xl bg-red-600 px-8 py-4 text-lg font-medium disabled:opacity-30"
        >
          Disable
        </button>
      </div>
    </main>
  );
}