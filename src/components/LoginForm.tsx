"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState("");
  const [needInvite, setNeedInvite] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, pin, invite }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data.needInvite) setNeedInvite(true);
    if (!res.ok) return setError(data.error ?? "Couldn't sign in");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-panel/90 p-6">
      <div>
        <label htmlFor="username" className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Username
        </label>
        <input
          id="username"
          autoComplete="username"
          className="mt-1 w-full rounded-lg border border-line bg-bg-2 px-3 py-2.5 text-lg outline-none focus:border-accent"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. hai"
          maxLength={16}
          required
        />
      </div>
      <div>
        <label htmlFor="pin" className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">
          PIN (4–8 digits)
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-line bg-bg-2 px-3 py-2.5 text-lg tracking-[0.4em] outline-none focus:border-accent"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          maxLength={8}
          required
        />
      </div>
      {needInvite && (
        <div>
          <label htmlFor="invite" className="font-cond text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Invite code
          </label>
          <input
            id="invite"
            autoFocus
            className="mt-1 w-full rounded-lg border border-line bg-bg-2 px-3 py-2.5 text-lg outline-none focus:border-accent"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            maxLength={40}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Entering…" : "Enter the stadium"}
      </button>
      <p className="text-center font-cond text-xs text-muted">New name? We&apos;ll make you an account with 3 free packs.</p>
    </form>
  );
}
