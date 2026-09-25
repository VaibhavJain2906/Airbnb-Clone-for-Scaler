import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "./Button";

export function ComingSoon({
  title = "Feature Coming Soon",
  description = "This section is currently under development as a planned enhancement for the platform.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#FF385C] flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
        {title}
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      <Link href="/">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Button>
      </Link>
    </div>
  );
}
