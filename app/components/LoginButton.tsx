"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <p>{session.user?.email}</p>
        <button onClick={() => signOut()}>Logout</button>
      </>
    );
  }

  return <button onClick={() => signIn("google")}>Login</button>;
}

