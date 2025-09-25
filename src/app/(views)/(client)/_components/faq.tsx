import { Icon } from "@/components/icon"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"

export default function FaqSection() {
  return (
    <section className='py-12 relative'>
      <div className="max-w-4xl mx-auto px-4">
        <div className='text-center max-w-xl mx-auto mb-12'>
          <h2 className='text-2xl md:text-4xl font-bold max-w-xl'>Frequently Asked Questions</h2>
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              What is Terravest?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <p>Terravest is a multi-chain RWA launchpad for tokenized fundraising.</p>
                <div className='mt-4 space-y-3'>
                  <div className='flex gap-2 items-start'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <b>Debt or Equity</b>: choose Debt (coupon + principal, no dilution) or Equity (ownership with dividend/exit upside).
                    </div>
                  </div>
                  <div className='flex gap-2 items-start'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <b>Straightforward flow</b>: sign in (wallet or email), KYC via zkMe, subscribe in native coins, claim at TGE/vesting, claim airdrop (optional).
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <b>Live networks: Ethereum, Polygon, Base, BNB</b> (Testnet: Sepolia, BSC Testnet).
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              What can I find on Terravest?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <p>Projects in Debt/Private Credit and Equity, each with its own terms, risks, timelines, and eligibility.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Equity vs Debt in one line?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>
                      <b>Equity</b> : sell ownership <b>{("dilution")}</b>, no fixed coupon, upside via <b>dividends/exit</b> and possible governance.
                    </p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>
                      <b>Debt</b> : borrow capital with coupon + principal schedule, no dilution, may require <b>collateral/covenants</b>.
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              When is Equity more suitable?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Early/growth stage with volatile or negative cash flow.</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Funding R&D or expansion.</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Willing to share control for upside.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              When is Debt more suitable?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Predictable/contracted cash flows.</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Assets/receivables to support payments.</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Prefer to avoid dilution and can meet covenants/reporting.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              How do returns/payments work?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>
                      <b>Equity</b> : periodic <b>coupons</b> (e.g., monthly/quarterly) plus <b>principal</b> (bullet or amortizing).
                    </p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>
                      <b>Debt</b> : <b>dividends</b> if declared and profitable; otherwise returns at <b>exit/buyback/listing</b>.
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              What terms & documents matter most?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <h3 className="font-semibold">Equity</h3>
                <div>
                  <div className='flex gap-2'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <p>Deck, cap table, valuation method, shareholder/SPV agreements.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm md:text-lg">
                <h3 className="font-semibold">Debt</h3>
                <div>
                  <div className='flex gap-2'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <p>Coupon %, tenor, bullet/amortizing, secured vs unsecured.</p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <p>Key covenants (DSCR/leverage), cash flow model, contracts/collateral.</p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <p>Administrator/custodian details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Top risks to consider?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <h3 className="font-semibold">Equity</h3>
                <div>
                  <div className='flex gap-2'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <p>Valuation, illiquidity, and governance risks; dividends not guaranteed.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm md:text-lg">
                <h3 className="font-semibold">Debt</h3>
                <div>
                  <div className='flex gap-2'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <p>Default/interest-rate risk and collateral enforcement risk.</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              How does participation generally work?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="space-y-3 text-sm md:text-lg">
                <div className='flex gap-2'>
                  <div className='font-bold'>
                    <h3>1.</h3>
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Connect Wallet → complete KYC with zkMe (required).</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='font-bold'>
                    <h3>2.</h3>
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Review the project page.</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='font-bold'>
                    <h3>3.</h3>
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Make an on-chain transaction.</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='font-bold'>
                    <h3>4.</h3>
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Claim per TGE/vesting.</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='font-bold'>-</div>
                  <div className='flex-1 w-full'>
                    <p>Founders/issuers must also complete zkMe profile verification before launching a project.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-10">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              How do I sign in?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="space-y-3 text-sm md:text-lg">
                Choose <b>Connect Wallet</b> (supports ~415 wallets via All Wallets, across EVM & Solana). Login uses <b>message signature</b> no gas and not a transfer approval.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-11">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Which networks are supported?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="space-y-3 text-sm md:text-lg">
                <b>Ethereum, Polygon, Base, and BNB Smart Chain</b>. Use <b>ETH</b> for gas on Ethereum/Base, <b>POL</b> on Polygon, and <b>BNB</b> on BNB Smart Chain. Testnet is also available on Ethereum Sepolia and BSC Testnet.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-12">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Which currencies are accepted?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="space-y-3 text-sm md:text-lg">
                <b>Native Coins (ETH/BNB/POL)</b> are the primary subscription currency across supported networks. USDT/USDC will be available soon.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-13">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Are there minimum or maximum purchase limits?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="space-y-3 text-sm md:text-lg">
                No platform-wide defaults; any limits are defined per project and shown on the offer page.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-14">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              What is TGE?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="space-y-3 text-sm md:text-lg">
                <b>Token Generation Event</b>—the token is issued on-chain; this is not an exchange listing announcement.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-15">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Can I get a refund for presale purchases?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <div className='mt-4 space-y-3'>
                  <div className='flex gap-2 items-start'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <p>No—presale purchases are final and non-refundable per T&C.</p>
                    </div>
                  </div>
                  <div className='flex gap-2 items-start'>
                    <div className='mt-0.5'>
                      <Icon name="codicon:circle-filled" className="text-sm" />
                    </div>
                    <div className='flex-1 w-full'>
                      <p>Exception: Yes—if the presale hardcap target is not achieved.</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-16">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Do I need KYC and who handles it?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <p>Yes. KYC supports AML/CFT and eligibility checks; it is performed by zkMe.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-17">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              What information does KYC collect?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg space-y-3">
                <div className='flex gap-2 items-start'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>Country, full name as on ID.</p>
                  </div>
                </div>
                <div className='flex gap-2 items-start'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>ID/passport photos and selfie/liveness.</p>
                  </div>
                </div>
                <div className='flex gap-2 items-start'>
                  <div className='mt-0.5'>
                    <Icon name="codicon:circle-filled" className="text-sm" />
                  </div>
                  <div className='flex-1 w-full'>
                    <p>In some cases, proof of address/funds.</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-18">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Are there geo restrictions?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <p>No platform-wide geo blocking currently; individual offerings may restrict certain jurisdictions or investor types—always check the project page and legal notices.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-19">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Are smart contracts audited and keys secured?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <p>
                  Audit status is disclosed per project; sensitive functions may use multisig; some projects may run bug bounty programs.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-20">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Where can I find the official token/contract address?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <p>
                  On the project page and official announcements—use only the exact address listed there.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-21">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Further Information
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="w-44 shrink-0">Email</div>
                  <div className="hidden md:block">:</div>
                  <div className="flex-1">
                    <Link target="_blank" rel="noopener noreferrer" className="link text-blue-500 hover:text-blue-600" href="mailto:invest@terravest.capital">invest@terravest.capital</Link>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="w-44 shrink-0">Discord</div>
                  <div className="hidden md:block">:</div>
                  <div className="flex-1">
                    <Link target="_blank" rel="noopener noreferrer" className="link text-blue-500 hover:text-blue-600" href="https://discord.gg/zB2uwhzytj">https://discord.gg/zB2uwhzytj</Link>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="w-44 shrink-0">Telegram</div>
                  <div className="hidden md:block">:</div>
                  <div className="flex-1">
                    <Link target="_blank" rel="noopener noreferrer" className="link text-blue-500 hover:text-blue-600" href="https://t.me/terravestcapital">https://t.me/terravestcapital</Link>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="w-44 shrink-0">X (Twitter)</div>
                  <div className="hidden md:block">:</div>
                  <div className="flex-1">
                    <Link target="_blank" rel="noopener noreferrer" className="link text-blue-500 hover:text-blue-600" href="https://x.com/Terravest_">https://x.com/Terravest_</Link>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="w-44 shrink-0">Docs (GitBook)</div>
                  <div className="hidden md:block">:</div>
                  <div className="flex-1">
                    <Link target="_blank" rel="noopener noreferrer" className="link text-blue-500 hover:text-blue-600" href="https://terravest-1.gitbook.io/terravest">https://terravest-1.gitbook.io/terravest</Link>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="w-44 shrink-0">Terms & Conditions</div>
                  <div className="hidden md:block">:</div>
                  <div className="flex-1">
                    <Link target="_blank" rel="noopener noreferrer" className="link text-blue-500 hover:text-blue-600" href="https://terravest-1.gitbook.io/terravest">https://terravest-1.gitbook.io/terravest</Link>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-22">
            <AccordionTrigger className='text-lg md:text-xl font-semibold'>
              Important notice
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="text-sm md:text-lg">
                <p>
                  This FAQ is informational only and not investment advice; always review each project&apos;s term sheet, risk factors, and legal notices.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}

