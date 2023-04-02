// Create a React.FC-typed component using export const
// Name it UserCard
// This will check useSession and check if the user is logged in or not
// If the user is logged in, it will show the profile picture, name, and logout
// If the user is not logged in, it will show the login button
// style it with tailwindcss & daisyui

import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

// If the user is not logged in, it will show the login button
export const UserCard: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-row items-center justify-center gap-2">
      <p>{sessionData && <span>{sessionData.user?.name}</span>}</p>
      <button
        className="btm-xs btn-primary btn"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
