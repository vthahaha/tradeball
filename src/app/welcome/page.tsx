import { redirect } from "next/navigation";
import { WelcomeForm } from "@/components/WelcomeForm";
import { getPendingProfile, suggestUsername } from "@/lib/google";
import { getCurrentUser } from "@/lib/session";

export default async function WelcomePage() {
  if (await getCurrentUser()) redirect("/");
  const profile = await getPendingProfile();
  if (!profile) redirect("/");

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="font-display text-6xl leading-none">
        Welcome to the <span className="text-accent">league</span>
      </h1>
      <p className="mt-3 text-muted">
        Signed in as <span className="text-text">{profile.email}</span>. Pick the username your friends will see. It
        shows on trades, the feed and your profile.
      </p>
      <div className="mt-6">
        <WelcomeForm suggestion={suggestUsername(profile.name, profile.email)} />
      </div>
    </div>
  );
}
