"use client";

import { useTheme } from "@/utils/frontend/hooks/useTheme";
import Image from "next/image";

export function LogoView() {
  const { theme } = useTheme();
  const logoSrc =
    theme === "dark"
      ? "/assets/logos/scorp-logo-dark.png"
      : "/assets/logos/scorp-logo-light.png";
  if (!theme) return null;

  return (
    <div className="flex items-center gap-2 self-center font-medium">
      <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
        <Image src={logoSrc} alt="Logo" width={24} height={24} />
      </div>
      ScorpTech
    </div>
  );
}
