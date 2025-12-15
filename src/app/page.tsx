"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-64 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex items-start gap-12 flex-col">
          <Image
            className="dark:invert"
            src="/assets/logos/logo_dark.svg"
            alt="ScorpTech logo"
            width={150}
            height={150}
            priority
          />
          <div className="text-4xl">
            Welcome, {' '}
            <span className="font-bold bg-white rounded-[10px] px-2 text-black p-[5px_10px]">Om Prakash Bharati</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <button
            onClick={() => {
              localStorage.setItem("skipHome", "true");
              router.push("/dashboard");
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[215px] cursor-pointer"
          >
            <Image
              className="dark:invert"
              src="/assets/logos/logo_white.svg"
              alt="ScorpTech logo"
              width={32}
              height={32}
            />
            Go to Dashboard
          </button>
          <button
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-red-600 text-red-600 px-5 transition-colors hover:border-transparent dark:border-red-700 dark:text-red-500 md:w-[115px] cursor-pointer">
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
