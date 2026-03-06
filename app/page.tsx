"use client";

import Link from "next/link";
import LoginButton from "./components/LoginButton";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Business Card App</h1>
          <p>ログインしてください</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white gap-6">
      <h1 className="text-3xl font-bold">Business Card App</h1>
      <Link href="/editor" className="btn bg-white text-black px-6 py-3 rounded">
        名刺を作成する
      </Link>
      <Link href="/cards" className="btn bg-white text-black px-6 py-3 rounded">
        保存した名刺一覧
      </Link>

      <style jsx>{`
        .btn {
          display: inline-block;
          text-align: center;
          background: #111;
          border: 1px solid #444;
        }
        .btn:hover {
          background: #222;
        }
      `}</style>
    </div>
  );
}
