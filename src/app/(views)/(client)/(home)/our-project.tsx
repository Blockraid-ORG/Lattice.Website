"use client";

import { NumberComma } from "@/lib/utils";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { TProject } from "@/types/project";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function untuk membuat data project yang konsisten
const createProjectData = (baseData: any): TProject => ({
  ...baseData,
  allocations: [],
  factoryAddress: undefined,
  lockerDistributed: false,
  lockerDistributeHash: null,
  rewardContractAddress: null,
  presaleAddress: undefined,
  whitelistsAddress: null,
  paused: false,
  presales: [],
  Presales: [],
  user: {
    id: baseData.userId || "default-user-id",
    fullname: "Project Owner",
    walletAddress: "0x1234567890abcdef",
    verifications: [{ status: "VERIFIED" }],
  },
  reviewLogs: [],
  isHashAirdrop: false,
  additionalReward: [],
  addressPoolPaymentLog: [],
  ProjectPresaleWhitelistAddress: [],
});

// Dummy data untuk preview
const dummyData = {
  data: [
    {
      id: "ff0b1bcf-616b-44ae-a389-3de6dc2b356c",
      name: "TEST200",
      slug: "1758814351314",
      logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreifyklo7t5wqzjh7blj2vfzycpszezwjutug3youffg2hebjmdigum",
      banner:
        "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreiejsngccrsst2wg4llrdl4coynkksyvlygzzo2loy4cnlder2ftyq",
      ticker: "ETET",
      decimals: 18,
      totalSupply: "1000000",
      detail: "desc",
      status: "DEPLOYED",
      userId: "233d0077-46f8-4cc4-b413-e7367ea44369",
      contractAddress: "0x471eD1736E857a8d3e3f74329304b657d4390F15",
      socials: [
        {
          url: "https://google.com",
          social: {
            id: "04fb7849-fbab-4880-bb6c-aa9bf06a81c4",
            name: "Discord",
            icon: "ri:discord-fill",
          },
        },
        {
          url: "https://x.com/junkcoin_JKC",
          social: {
            id: "74912515-2b53-47f7-823d-01a90f519a41",
            name: "X",
            icon: "ri:twitter-x-line",
          },
        },
      ],
      category: {
        id: "c8c1d2ed-8498-4b1a-9a0c-23b07e6086a2",
        name: "Private Credit",
        icon: "fluent-emoji-high-contrast:bank",
      },
      chains: [
        {
          chain: {
            id: "eaed1d2e-da82-4b43-bf87-aa2fda6c18f7",
            name: "BSC Testnet",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance-tesnet.png",
            type: "Testnet",
          },
        },
      ],
    },
    {
      id: "ce48f2ee-0dc6-4007-92f0-9a7254bfc344",
      name: "Jogja Undercover2",
      slug: "1758803727044",
      logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreifyklo7t5wqzjh7blj2vfzycpszezwjutug3youffg2hebjmdigum",
      banner:
        "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreifzgb7ufe26u25pw6q4ltigcfdouu7tpfbjuafxegzjvqf2fj43na",
      ticker: "EJOG",
      decimals: 18,
      totalSupply: "1000000",
      detail: "TST bg",
      status: "DEPLOYED",
      userId: "233d0077-46f8-4cc4-b413-e7367ea44369",
      contractAddress: "0xB9c70Da6B1e759cE5953AE1698FE1C8A10dd3828",
      socials: [
        {
          url: "https://x.com/junkcoin_JKC",
          social: {
            id: "74912515-2b53-47f7-823d-01a90f519a41",
            name: "X",
            icon: "ri:twitter-x-line",
          },
        },
      ],
      category: {
        id: "f079611d-460d-46b5-b25e-a53d873cc02a",
        name: "Royalty Streams",
        icon: "material-symbols:music-cast",
      },
      chains: [
        {
          chain: {
            id: "eaed1d2e-da82-4b43-bf87-aa2fda6c18f7",
            name: "BSC Testnet",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance-tesnet.png",
            type: "Testnet",
          },
        },
      ],
    },
    {
      id: "d6ef24e3-8132-4d03-a4ea-782280f1f6e5",
      name: "Alva",
      slug: "1758637412814",
      logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeig7elkbhwbb4kxrhw2wuc2ent5gchbefold54ufd32uiwslxkp57y",
      banner:
        "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreih3unmg4chgq3bcbbvpkk6drash7lst4pt2ex4gaxcilxic6hefde",
      ticker: "ALV_E",
      decimals: 18,
      totalSupply: "1000",
      detail: "desc",
      status: "DEPLOYED",
      userId: "a3556dda-ad92-45b4-af66-e2d89840a29f",
      contractAddress: "0x545eF82bc2490207E02181198D0bE817C0003c7F",
      socials: [
        {
          url: "https://x.com/dff",
          social: {
            id: "74912515-2b53-47f7-823d-01a90f519a41",
            name: "X",
            icon: "ri:twitter-x-line",
          },
        },
      ],
      category: {
        id: "c8c1d2ed-8498-4b1a-9a0c-23b07e6086a2",
        name: "Private Credit",
        icon: "fluent-emoji-high-contrast:bank",
      },
      chains: [
        {
          chain: {
            id: "eaed1d2e-da82-4b43-bf87-aa2fda6c18f7",
            name: "BSC Testnet",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance-tesnet.png",
            type: "Testnet",
          },
        },
      ],
    },
    {
      id: "d9900f38-0d69-47af-8dca-a58e771a5743",
      name: "OTAK OTAK",
      slug: "1758504340406",
      logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeig37mt2wu7phe7ztiatly6rs5gci6jcrptee7evhe3boj5b2t6xlm",
      banner:
        "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeig37mt2wu7phe7ztiatly6rs5gci6jcrptee7evhe3boj5b2t6xlm",
      ticker: "OTAK_D",
      decimals: 18,
      totalSupply: "1000",
      detail: "description",
      status: "DEPLOYED",
      userId: "a3556dda-ad92-45b4-af66-e2d89840a29f",
      contractAddress: "0xb87deaBF7652EAFd318820D4af621aE3CB66271f",
      socials: [
        {
          url: "https://x.com/bjg",
          social: {
            id: "74912515-2b53-47f7-823d-01a90f519a41",
            name: "X",
            icon: "ri:twitter-x-line",
          },
        },
      ],
      category: {
        id: "c8c1d2ed-8498-4b1a-9a0c-23b07e6086a2",
        name: "Private Credit",
        icon: "fluent-emoji-high-contrast:bank",
      },
      chains: [
        {
          chain: {
            id: "eaed1d2e-da82-4b43-bf87-aa2fda6c18f7",
            name: "BSC Testnet",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance-tesnet.png",
            type: "Testnet",
          },
        },
      ],
    },
    {
      id: "7d5233ab-eddf-40c3-8f9a-32d2661ac98c",
      name: "Perumahan Kencana",
      slug: "1758469184142",
      logo: "https://maroon-delicate-coyote-528.mypinata.cloud/ipfs/bafybeiglkpkyiuxdr3uzneugudt2qexavthmyzamtsotcvxthghs5trrry",
      banner:
        "https://maroon-delicate-coyote-528.mypinata.cloud/ipfs/bafybeiayyxlonw4setq2u5nkvdwle7ieyp4h34xokuptknl3nsihg5xufy",
      ticker: "PKC_D",
      decimals: 18,
      totalSupply: "1000000",
      detail:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      status: "DEPLOYED",
      userId: "46953ad1-98c1-4603-9127-8c2c655ba346",
      contractAddress: "0x5096B1391CD573f5b57F9e98cCFCA5405a60B4A9",
      socials: [
        {
          url: "https://github.com/wahyunf354",
          social: {
            id: "9702e31c-24ea-4123-9f95-2cd7a1454c6c",
            name: "Github",
            icon: "ri:github-fill",
          },
        },
      ],
      category: {
        id: "c8c1d2ed-8498-4b1a-9a0c-23b07e6086a2",
        name: "Private Credit",
        icon: "fluent-emoji-high-contrast:bank",
      },
      chains: [
        {
          chain: {
            id: "b7ff3060-8d3d-4d26-bc7b-c6e6338c8daa",
            name: "Arbitrum",
            logo: "uploads/file-1756467535499-715129102.png",
            type: "Mainnet",
          },
        },
      ],
    },
    {
      id: "b327f85a-eef5-480e-8bb9-ab82001a9a0d",
      name: "KOCENG",
      slug: "1758364958867",
      logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreidezdf2huufnuq4lpdo7mxdguwkkogoj6tgv62gdj2lklzssyh4ey",
      banner:
        "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeig37mt2wu7phe7ztiatly6rs5gci6jcrptee7evhe3boj5b2t6xlm",
      ticker: "KC_D",
      decimals: 18,
      totalSupply: "1000",
      detail: "KOKCE",
      status: "DEPLOYED",
      userId: "a3556dda-ad92-45b4-af66-e2d89840a29f",
      contractAddress: "0x2750c1416267906Aaa696C9AdF77006E4C6c334B",
      socials: [
        {
          url: "https://x.com/bjg",
          social: {
            id: "74912515-2b53-47f7-823d-01a90f519a41",
            name: "X",
            icon: "ri:twitter-x-line",
          },
        },
      ],
      category: {
        id: "f079611d-460d-46b5-b25e-a53d873cc02a",
        name: "Royalty Streams",
        icon: "material-symbols:music-cast",
      },
      chains: [
        {
          chain: {
            id: "8a4ef120-5ac5-4e45-9f6a-2426accd5a42",
            name: "BNB Smart Chain",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance.png",
            type: "Mainnet",
          },
        },
      ],
    },
    {
      id: "f4e5501f-5004-40d8-b1f9-4418fc0f3947",
      name: "WADUH WADUH",
      slug: "1758081990608",
      logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreibth35p3nspc3kizrk4lvff2mgthxvi3cayps4x6ibyusdwdr3n5e",
      banner:
        "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreidezdf2huufnuq4lpdo7mxdguwkkogoj6tgv62gdj2lklzssyh4ey",
      ticker: "WADUH_D",
      decimals: 18,
      totalSupply: "1000",
      detail: "ini adalah",
      status: "DEPLOYED",
      userId: "a3556dda-ad92-45b4-af66-e2d89840a29f",
      contractAddress: "0x32993E2FaeE27ab173Ebe7C4Cd38440b74a08299",
      socials: [
        {
          url: "https://x.com/bjg",
          social: {
            id: "74912515-2b53-47f7-823d-01a90f519a41",
            name: "X",
            icon: "ri:twitter-x-line",
          },
        },
      ],
      category: {
        id: "c8c1d2ed-8498-4b1a-9a0c-23b07e6086a2",
        name: "Private Credit",
        icon: "fluent-emoji-high-contrast:bank",
      },
      chains: [
        {
          chain: {
            id: "eaed1d2e-da82-4b43-bf87-aa2fda6c18f7",
            name: "BSC Testnet",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance-tesnet.png",
            type: "Testnet",
          },
        },
      ],
    },
    {
      id: "7b8d429f-be75-4358-aff4-0202becaf2eb",
      name: "ARJUNA TOKEN",
      slug: "1757859508494",
      logo: "https://maroon-delicate-coyote-528.mypinata.cloud/ipfs/bafybeiglkpkyiuxdr3uzneugudt2qexavthmyzamtsotcvxthghs5trrry",
      banner:
        "https://maroon-delicate-coyote-528.mypinata.cloud/ipfs/bafybeiglkpkyiuxdr3uzneugudt2qexavthmyzamtsotcvxthghs5trrry",
      ticker: "AR_D",
      decimals: 18,
      totalSupply: "10000",
      detail:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      status: "DEPLOYED",
      userId: "46953ad1-98c1-4603-9127-8c2c655ba346",
      contractAddress: "0x86c3E4E9AfB387a61e4d4666398C35FBd3a55793",
      socials: [
        {
          url: "https://github.com/wahyunf354",
          social: {
            id: "9702e31c-24ea-4123-9f95-2cd7a1454c6c",
            name: "Github",
            icon: "ri:github-fill",
          },
        },
      ],
      category: {
        id: "bc5b623d-a443-4edf-80f1-9ca1835ea14c",
        name: "Real Estate",
        icon: "fluent-emoji-high-contrast:houses",
      },
      chains: [
        {
          chain: {
            id: "8a4ef120-5ac5-4e45-9f6a-2426accd5a42",
            name: "BNB Smart Chain",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance.png",
            type: "Mainnet",
          },
        },
      ],
    },
    {
      id: "2867d834-b660-4be7-afa2-e71313aa74d0",
      name: "Citra Arjuna RWA Token",
      slug: "1757854050715",
      logo: "https://maroon-delicate-coyote-528.mypinata.cloud/ipfs/bafybeiglkpkyiuxdr3uzneugudt2qexavthmyzamtsotcvxthghs5trrry",
      banner:
        "https://maroon-delicate-coyote-528.mypinata.cloud/ipfs/bafybeiayyxlonw4setq2u5nkvdwle7ieyp4h34xokuptknl3nsihg5xufy",
      ticker: "CA_D",
      decimals: 18,
      totalSupply: "10000",
      detail:
        "Hunian Nyata, Nilai Nyata!\n\nToken RWA ini hadir sebagai representasi aset perumahan Citra Arjuna",
      status: "DEPLOYED",
      userId: "46953ad1-98c1-4603-9127-8c2c655ba346",
      contractAddress: "0x9fcDB33CB3535a2a925dC9E7D8be03CF8aB464b1",
      socials: [
        {
          url: "https://github.com/wahyunf354",
          social: {
            id: "9702e31c-24ea-4123-9f95-2cd7a1454c6c",
            name: "Github",
            icon: "ri:github-fill",
          },
        },
      ],
      category: {
        id: "bc5b623d-a443-4edf-80f1-9ca1835ea14c",
        name: "Real Estate",
        icon: "fluent-emoji-high-contrast:houses",
      },
      chains: [
        {
          chain: {
            id: "8a4ef120-5ac5-4e45-9f6a-2426accd5a42",
            name: "BNB Smart Chain",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance.png",
            type: "Mainnet",
          },
        },
      ],
    },
    {
      id: "c6082ab8-7feb-4b8d-82b6-57a877d5a9b1",
      name: "Nasi Pecel Lele Mang Udi",
      slug: "1757853375877",
      logo: "https://maroon-delicate-coyote-528.mypinata.cloud/ipfs/bafybeie7flym2jsvm5sx3ypfcwsq32vnquqourl5q24b74bqqbdxhzhfky",
      banner:
        "https://maroon-delicate-coyote-528.mypinata.cloud/ipfs/bafybeicfxegdbvlkft5rfgcbavc6sbjr6z3jkbb4w7yk7p7ogkgnhitml4",
      ticker: "MU_D",
      decimals: 18,
      totalSupply: "10000",
      detail: "Coin pertama yang terinspirasi dari kekuatan kuliner rakyat!",
      status: "DEPLOYED",
      userId: "46953ad1-98c1-4603-9127-8c2c655ba346",
      contractAddress: "0x161f8B7aedc9DdD37e144FCFcEde407F4fCDC665",
      socials: [
        {
          url: "https://github.com/wahyunf354",
          social: {
            id: "9702e31c-24ea-4123-9f95-2cd7a1454c6c",
            name: "Github",
            icon: "ri:github-fill",
          },
        },
      ],
      category: {
        id: "c8c1d2ed-8498-4b1a-9a0c-23b07e6086a2",
        name: "Private Credit",
        icon: "fluent-emoji-high-contrast:bank",
      },
      chains: [
        {
          chain: {
            id: "8a4ef120-5ac5-4e45-9f6a-2426accd5a42",
            name: "BNB Smart Chain",
            logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance.png",
            type: "Mainnet",
          },
        },
      ],
    },
  ].map(createProjectData),
};

function OurProject() {
  // Menggunakan dummy data untuk preview
  const data = dummyData;
  const isLoading = false;

  console.log(data);
  return (
    <section className="py-12 md:py-24 bg-gradient-to-br from-[#D8E9FD]/20 via-[#E8F4FD]/10 to-[#F0F8FF]/20 dark:from-[#001123] dark:via-[#001A2E] dark:to-[#002244]">
      <div className="container">
        <div className="max-w-xl mb-12">
          <h2 className="text-2xl md:text-4xl font-bold max-w-xl">
            Our Project
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data &&
              data?.data?.map((item, index) => (
                <ContentItem data={item} key={index} />
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ContentItem({ data }: { data: TProject }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className="rounded-2xl hover:scale-105 duration-200 bg-white dark:bg-white/5 border shadow-md border-slate-300/20 overflow-hidden">
      <Link href={`/project-end-presale/${data.id}`}>
        <div className="aspect-[4/3] relative p-2 overflow-hidden rounded-xl">
          {!isLoaded && (
            <Skeleton className="absolute inset-0 flex items-center justify-center bg-neutral-400/20">
              <Icon name="ion:image" className="animate-pulse text-3xl" />
            </Skeleton>
          )}
          <Image
            width={300}
            height={300}
            className="w-full h-full object-cover rounded-lg"
            alt={data.name}
            src={data.banner}
            onLoadingComplete={() => setIsLoaded(true)}
          />
        </div>
        <div className="px-4">
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 shrink-0 relative border rounded-full overflow-hidden">
              <Image
                width={30}
                height={30}
                className="w-full h-full object-cover rounded-lg"
                alt={data.name}
                src={data.logo}
                onLoadingComplete={() => setIsLoaded(true)}
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <h2 className="font-semibold">{data.ticker}</h2>
              <div>-</div>
              <p className="text-sm md:text-base">{data.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-3">
            <div className="w-32">Total Supply</div>
            <div className="flex-1 text-end font-semibold">
              {NumberComma(Number(data.totalSupply))}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex gap-1 items-center">
              <Icon name={data.category.icon} />
              <h3 className="text-sm">{data.category.name}</h3>
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-4 p-4">
        <div className="flex justify-end items-center gap-2">
          {data.socials.map((item, index) => (
            <a
              className="border rounded-lg flex w-7 h-7 items-center justify-center"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
            >
              <Icon className="text-lg" name={item.social.icon} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OurProject;
