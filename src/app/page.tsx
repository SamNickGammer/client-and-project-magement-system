"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/utils/frontend/store/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/utils/frontend/authActions";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-64 px-16 bg-white dark:bg-black gap-20 sm:items-start">
        <div className="flex items-center gap-12 flex-col sm:items-start">
          <Image
            className="dark:invert"
            src="/assets/logos/logo_dark.svg"
            alt="ScorpTech logo"
            width={150}
            height={150}
            priority
          />
          <div className="lg:text-4xl sm:text-xl md:text-2xl md:flex md:gap-3 sm:items-center sm:gap-2 sm:text-start text-center">
            Welcome,{" "}
            <span className="font-bold bg-white rounded-[10px] px-2 text-black p-[5px_10px] flex items-center gap-2 mt-2 sm:mt-0">
              <Avatar>
                <AvatarImage
                  src={user?.image || "/assets/logos/logo_dark.svg"}
                  alt="@shadcn"
                />
                <AvatarFallback>
                  {user?.name?.[0] || user?.email?.[0] || "User"}
                </AvatarFallback>
              </Avatar>
              {user?.name || user?.email || "User"}
            </span>
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
            onClick={() => handleLogout(dispatch, router)}
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-red-600 text-red-600 px-5 transition-colors hover:border-transparent dark:border-red-700 dark:text-red-500 md:w-[115px] cursor-pointer"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
