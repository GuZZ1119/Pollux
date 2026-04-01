import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen -ml-[220px]">
      <div className="text-center max-w-md px-6">
        <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-accent flex items-center justify-center">
          <span className="text-white text-lg font-bold">P</span>
        </div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight mb-2">Pollux</h1>
        <p className="text-[15px] text-ink-secondary leading-relaxed mb-8">
          AI communication copilot for Gmail and Slack.
          Draft smarter replies, send with confidence.
        </p>
        <a
          href="/auth/login"
          className="inline-block px-6 py-2.5 bg-accent text-white text-[14px] font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
