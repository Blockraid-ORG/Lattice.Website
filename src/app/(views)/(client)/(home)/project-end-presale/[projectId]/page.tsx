"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { NumberComma } from "@/lib/utils";
// Simple Badge component
const Badge = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

// Simple Card components
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

// Simple Tabs components
const Tabs = ({
  children,
}: {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}) => <div className="w-full">{children}</div>;

const TabsList = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
  >
    {children}
  </div>
);

const TabsTrigger = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const TabsContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) => (
  <div
    className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
  >
    {children}
  </div>
);

// Dummy data untuk project detail - mirip dengan gambar RWA.io
const projectData = {
  id: "ff0b1bcf-616b-44ae-a389-3de6dc2b356c",
  name: "Ondo Finance",
  logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreifyklo7t5wqzjh7blj2vfzycpszezwjutug3youffg2hebjmdigum",
  banner:
    "https://red-careful-koala-550.mypinata.cloud/ipfs/bafkreiejsngccrsst2wg4llrdl4coynkksyvlygzzo2loy4cnlder2ftyq",
  ticker: "ONDO",
  decimals: 18,
  totalSupply: "1000000000",
  detail: "Next generation of financial infrastructure.",
  status: "DEPLOYED",
  contractAddress: "0x471eD1736E857a8d3e3f74329304b657d4390F15",
  currentPrice: 0.88259,
  tvl: 1690000000, // $1.69B
  trustScore: 98.6,
  socials: [
    {
      url: "https://ondo.finance",
      social: {
        name: "Website",
        icon: "ri:global-line",
      },
    },
    {
      url: "https://twitter.com/OndoFinance",
      social: {
        name: "X Twitter",
        icon: "ri:twitter-x-line",
      },
    },
  ],
  category: {
    name: "Private Credit",
    icon: "fluent-emoji-high-contrast:bank",
  },
  tags: ["Tokenization", "Stocks", "Public Funds"],
  chains: [
    {
      chain: {
        name: "Ethereum",
        logo: "https://red-careful-koala-550.mypinata.cloud/ipfs/bafybeicluvxrd3rb273v664rjcbhspkpyfbgdqwt6xrkfslyup2i4teife/binance-tesnet.png",
        type: "Mainnet",
      },
    },
  ],
};

function ProjectDetailRWAPage() {
  const [activeTab, setActiveTab] = useState("project-token");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-lg text-gray-900">RWA.io</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Icon name="ri:arrow-left-line" className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Icon name="ri:sun-line" className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-green-800">
                VERIFIED PROJECT
              </span>
              <Icon name="ri:check-line" className="w-4 h-4 text-green-600" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Icon name="ri:download-line" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Icon name="ri:share-line" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Icon name="ri:settings-3-line" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header Card */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 p-2 border-2 border-gray-200">
                    <Image
                      width={80}
                      height={80}
                      src={projectData.logo}
                      alt={projectData.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">
                      {projectData.name}
                    </h1>
                    <p className="text-gray-600 text-lg mb-6">
                      {projectData.detail}
                    </p>

                    {/* External Links */}
                    <div className="flex gap-3 mb-6">
                      {projectData.socials.map((social, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-4 py-2"
                          asChild
                        >
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon
                              name={social.social.icon}
                              className="w-4 h-4 mr-2"
                            />
                            {social.social.name}
                          </a>
                        </Button>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap">
                      {projectData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                        >
                          <Icon
                            name="ri:bar-chart-line"
                            className="w-3 h-3 mr-1"
                          />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Tabs */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-6 bg-transparent border-b border-gray-200 rounded-none">
                    <TabsTrigger
                      value="project-token"
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "project-token"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Project Token
                    </TabsTrigger>
                    <TabsTrigger
                      value="asset-tokens"
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "asset-tokens"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Asset Tokens
                    </TabsTrigger>
                    <TabsTrigger
                      value="unlocks"
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "unlocks"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Unlocks
                    </TabsTrigger>
                    <TabsTrigger
                      value="community"
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "community"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Community
                    </TabsTrigger>
                    <TabsTrigger
                      value="social-volume"
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "social-volume"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Social Volume
                    </TabsTrigger>
                    <TabsTrigger
                      value="holders"
                      className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "holders"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Holders
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="project-token" className="p-8">
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Project Token Information
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Ticker</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {projectData.ticker}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Current Price
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            ${projectData.currentPrice.toFixed(6)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Total Supply
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {NumberComma(+projectData.totalSupply)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Contract Address
                          </p>
                          <p className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {projectData.contractAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="asset-tokens" className="p-6">
                    <div className="text-center py-8 text-gray-400">
                      Asset tokens information coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="unlocks" className="p-6">
                    <div className="text-center py-8 text-gray-400">
                      Unlock schedule coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="community" className="p-6">
                    <div className="text-center py-8 text-gray-400">
                      Community metrics coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="social-volume" className="p-6">
                    <div className="text-center py-8 text-gray-400">
                      Social volume data coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="holders" className="p-6">
                    <div className="text-center py-8 text-gray-400">
                      Holder information coming soon...
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Trust Score */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  Trust Score
                  <Icon
                    name="ri:information-line"
                    className="w-4 h-4 text-gray-500"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="relative w-32 h-16 mx-auto mb-4">
                    {/* Trust Score Gauge */}
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      {/* Background Arc */}
                      <path
                        d="M 20 40 A 30 30 0 0 1 80 40"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      {/* Low Risk Arc */}
                      <path
                        d="M 20 40 A 30 30 0 0 1 50 20"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="8"
                      />
                      {/* Medium Risk Arc */}
                      <path
                        d="M 50 20 A 30 30 0 0 1 65 30"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="8"
                      />
                      {/* High Trust Arc */}
                      <path
                        d="M 65 30 A 30 30 0 0 1 80 40"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                      />
                      {/* Needle */}
                      <line
                        x1="50"
                        y1="40"
                        x2="75"
                        y2="35"
                        stroke="#1f2937"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold mb-2 text-gray-900">
                    Trust Score {projectData.trustScore}
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">
                    High
                  </Badge>
                  <p className="text-sm text-gray-600">
                    The contract code has been analyzed and found to have a
                    low-level risk of vulnerabilities.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Token Info */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  Token Info
                  <Icon
                    name="ri:arrow-down-s-line"
                    className="w-4 h-4 text-gray-500"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Ticker</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {projectData.ticker}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${projectData.currentPrice.toFixed(6)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Value Locked */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  Total Value Locked
                  <Icon
                    name="ri:arrow-down-s-line"
                    className="w-4 h-4 text-gray-500"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">TICKER</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {projectData.ticker}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">TVL</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${(projectData.tvl / 1000000000).toFixed(2)}b
                  </p>
                </div>

                {/* Timeframe Selector */}
                <div className="flex gap-2">
                  {["7D", "30D", "1Y", "ALL"].map((period) => (
                    <Button
                      key={period}
                      variant={period === "ALL" ? "default" : "outline"}
                      size="sm"
                      className={
                        period === "ALL"
                          ? "bg-blue-600 text-white"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }
                    >
                      {period}
                    </Button>
                  ))}
                </div>

                {/* TVL Chart Placeholder */}
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <div className="text-center text-gray-500">
                    <Icon
                      name="ri:bar-chart-line"
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <p className="text-sm">TVL Chart</p>
                    <p className="text-xs">Coming Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              © 2025 RWA.io. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Terms & Conditions
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                AML Policy
              </a>
            </div>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-900"
              >
                <Icon name="ri:telegram-line" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-900"
              >
                <Icon name="ri:twitter-x-line" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-900"
              >
                <Icon name="ri:linkedin-line" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-900"
              >
                <Icon name="ri:youtube-line" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ProjectDetailRWAPage;
