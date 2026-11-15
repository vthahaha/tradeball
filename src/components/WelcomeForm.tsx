"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WelcomeForm({ suggestion }: { suggestion: string }) {
  const router = useRouter();
  const [username, setUsername] = useState(suggestion);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/finish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Couldn't create your account");
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-md border border-line bg-panel/90 p-6">
      <div>
        <label htmlFor="username" className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Username
        </label>
        <div className="mt-1 flex items-center rounded-lg border border-line bg-bg-2 focus-within:border-accent focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-dashed focus-within:outline-accent">
          <span className="pl-3 text-lg text-muted">@</span>
          <input
            id="username"
            autoFocus
            className="w-full bg-transparent px-1 py-2.5 text-lg outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            maxLength={16}
            required
          />
        </div>
        <p className="mt-1 font-cond text-xs text-muted">3–16 letters, numbers or _</p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={busy || username.length < 3}>
        {busy ? "Creating…" : "Start with 3 free packs"}
      </button>
    </form>
  );
}
