"use client";

import React from "react";
import Image from "next/image";
import { BadgeSocial, Badge } from "./badge";
import { TProject } from "@/types/project";

interface HeaderContentProps {
  data: TProject;
}

const HeaderContent = ({ data }: HeaderContentProps) => {
  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 p-2 border-2 border-gray-200">
            <Image
              width={80}
              height={80}
              src={data.logo}
              alt={data.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {data.name}
          </h1>

          {/* External Links */}
          <div className="flex gap-3 items-center">
            {data.socials.map((social, index) => (
              <BadgeSocial
                key={index}
                icon={social.social.icon}
                url={social.url}
                name={social.social.name}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge icon="ri:information-line" name={data.chains[0].chain.name} />
          <Badge icon="ri:information-line" name={data.category.name} />
          <Badge icon="ri:information-line" name={data.projectType.name} />
        </div>
        <p className="text-gray-600 text-md mb-6 dark:text-gray-400">
          {data.detail}
        </p>
      </div>
    </div>
  );
};

export default HeaderContent;
