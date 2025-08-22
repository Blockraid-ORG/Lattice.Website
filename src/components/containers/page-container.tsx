"use client";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../icon";
import SuspenseLoader from "../suspense-loader";

export default function PageContainer({
  children,
  actions,
  title,
  subtitle,
  canBack,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
  subtitle?: string;
  canBack?: boolean;
}) {
  const router = useRouter();
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <header className="flex flex-col gap-3 md:flex-row justify-between p-3">
        <div>
          {canBack && (
            <button
              className="flex items-center gap-1"
              onClick={() => router.back()}
            >
              <Icon name="ic:round-arrow-back" /> Back
            </button>
          )}
          <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            {title}
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        <div>{actions}</div>
      </header>
      <div className="p-2">{children}</div>
    </Suspense>
  );
}
