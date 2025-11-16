import { Icon } from "@/components/icon";
import MainLogo from "@/components/logo";
import { dataSocials } from "@/data/utilitis";
import Link from "next/link";
import React from "react";

export default function MainFooter() {
  return (
    <footer className="py-6 md:py-12 bg-blue-100/30 dark:bg-primary-foreground/40">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-3">
            <MainLogo />
            <div className="flex gap-2">
              {dataSocials.map(
                (item, index) =>
                  item.show && (
                    <Link
                      key={index}
                      className="flex w-8 h-8 items-center justify-center border rounded-lg bg-blue-200/30 dark:bg-primary/5"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name={item.icon || "ri:twitter-x-fill"} />
                    </Link>
                  )
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Resources</h2>
            <div className="mt-3 space-y-2">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                className="flex text-sm"
                href="https://terravest-1.gitbook.io/terravest-1"
              >
                Documentation
              </Link>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Term</h2>
            <div className="mt-3 space-y-2">
              <Link className="flex text-sm" href="/term-and-condition">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
