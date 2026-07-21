import Image from "next/image";
import type { ReactNode } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthFormPanelProps = {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthFormPanel({ icon, title, description, children }: AuthFormPanelProps) {
  return (
    <section className="relative flex w-full flex-1 items-center justify-center overflow-hidden p-6 sm:p-10 lg:w-3/5 lg:flex-none">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/login/campus-aerial.png"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#00346d]/60 via-[#124687]/40 to-[#1a4b8c]/55" />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/15" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-white/60 bg-white/95 py-8 shadow-[0_24px_64px_rgba(0,52,109,0.28)] ring-0 backdrop-blur-md">
        <CardHeader className="space-y-3 px-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary-container text-primary">
            <MaterialIcon icon={icon} className="text-3xl" />
          </div>
          <CardTitle className="text-headline-md font-headline-md text-primary">{title}</CardTitle>
          <CardDescription className="text-body-md text-on-surface-variant">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">{children}</CardContent>
      </Card>
    </section>
  );
}
