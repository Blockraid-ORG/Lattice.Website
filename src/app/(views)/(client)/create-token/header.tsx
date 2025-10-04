import Image from "next/image";
import React from "react";

export default function Header() {
  return (
    <header className="pt-[80px] h-[30vh] relative">
      <div className="absolute left-0 top-0 right-0 bottom-0 z-0">
        <Image
          className="h-full w-full md:object-cover opacity-50 dark:opacity-30"
          alt="rocket"
          src={"/ills/waves-2.png"}
          width={1000}
          height={1000}
        />
      </div>
      <div className="container flex items-end justify-center text-center mt-12">
        <h1 className="text-3xl md:text-4xl font-semibold max-w-xl dark:bg-gradient-to-r dark:from-[#4B2CEB] dark:via-[#1B8DFA] dark:to-[#6C86FF] inline-block dark:text-transparent dark:bg-clip-text">
          Create New Token
        </h1>
      </div>
    </header>
  );
}
