import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen -ml-56">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pollux</h1>
        <p className="text-lg text-gray-500 mb-8">
          AI-powered communication layer for Gmail and Slack.
          Draft smarter replies, send with confidence.
        </p>
        <a
          href="/auth/login"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
