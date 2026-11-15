"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** A destructive admin action guarded by typing a keyword. */
export function ConfirmAction({
  endpoint,
  keyword,
  label,
  busyLabel,
  done,
}: {
  endpoint: string;
  keyword: string;
  label: string;
  busyLabel: string;
  /** Turns the endpoint's JSON response into the success message. */
  done: "wipe" | "mine";
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const id = `confirm-${done}`;

  async function run() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: text }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg(data.error ?? "That didn't work");
    setMsg(
      done === "wipe"
        ? `Done. Removed ${data.before.cards} cards and ${data.before.trades} trades; ${data.after.users} players got fresh tickets.`
        : `Done. Deleted your ${data.cards} cards${data.trades ? ` and ${data.trades} trades they were in` : ""}.`,
    );
    setText("");
    router.refresh();
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <label htmlFor={id} className="field-label">
        Type {keyword} to confirm
      </label>
      <input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value.toUpperCase())}
        className="w-32 rounded-md border border-line bg-bg-2 px-3 py-2 font-cond font-bold tracking-widest focus:border-accent"
        autoComplete="off"
      />
      <button className="btn btn-primary" disabled={text !== keyword || busy} onClick={run}>
        {busy ? busyLabel : label}
      </button>
      {msg && (
        <p role="status" className="w-full text-sm font-semibold text-text">
          {msg}
        </p>
      )}
    </div>
  );
}
