"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WipePanel() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function wipe() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/wipe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: text }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg(data.error ?? "Wipe failed");
    setMsg(`Done. Removed ${data.before.cards} cards and ${data.before.trades} trades; ${data.after.users} players got fresh tickets.`);
    setText("");
    router.refresh();
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <label htmlFor="wipe-confirm" className="field-label">
        Type WIPE to confirm
      </label>
      <input
        id="wipe-confirm"
        value={text}
        onChange={(e) => setText(e.target.value.toUpperCase())}
        className="w-32 rounded-md border border-line bg-bg-2 px-3 py-2 font-cond font-bold tracking-widest outline-none focus:border-accent"
        autoComplete="off"
      />
      <button className="btn btn-primary" disabled={text !== "WIPE" || busy} onClick={wipe}>
        {busy ? "Wiping…" : "Wipe and relaunch"}
      </button>
      {msg && (
        <p role="status" className="w-full text-sm font-semibold text-text">
          {msg}
        </p>
      )}
    </div>
  );
}
