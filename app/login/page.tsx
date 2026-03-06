"use client";

import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const { status } = useSession();

  // セッション確認中は何も表示しない（チラつき防止）
  if (status === "loading") return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
      <div className="bg-neutral-800 p-10 rounded-xl shadow-xl text-center space-y-6">
        <h1 className="text-2xl font-semibold tracking-wide">
          Business Card Studio
        </h1>

        <p className="text-neutral-400 text-sm">
          名刺を、自由に、美しく
        </p>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/cards" })}
          className="w-full py-4 bg-white text-black rounded-xl text-lg font-medium hover:bg-neutral-200 transition"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
}