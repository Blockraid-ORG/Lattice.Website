import Image from 'next/image'
import React from 'react'

export default function TermAndConditionPage() {
  return (
    <div>
      <div className='h-[30vh] relative'>
        <div className="absolute z-10 left-0 right-0 top-0 bottom-0 container flex items-center justify-center text-center">
          <h3 className='text-3xl md:text-5xl font-bold'>Terms and Conditions</h3>
        </div>
        <div className='absolute left-0 top-0 right-0 bottom-0 z-0'>
          <Image className='h-full w-full md:object-cover opacity-20 dark:opacity-100 object-top dark:hidden' alt='star hero' src={'/ills/bg-hero-light.png'} width={1440} height={712} />
          <Image className='h-full w-full md:object-cover opacity-20 dark:opacity-100 object-top hidden dark:block' alt='star hero' src={'/ills/bg-hero.png'} width={1440} height={712} />
        </div>
      </div>
      <div className="max-w-4xl px-4 mx-auto py-6 md:py-12">
        <h1 className="text-xl md:text-2xl font-bold mb-8">
          Terravest Launchpad Presale - Terms and Conditions
        </h1>
        <p className="text-sm md:text-base mb-6">
          These Terms and Conditions govern participation in the presale of the Terravest Launchpad and the associated
          offering of Terravest Tokens By participating in the Presale, each participant acknowledges and agrees to be bound
          by these Terms. Please read carefully before making any purchase, as these Terms contain important information
          regarding rights, obligations, and risk factors.
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">1. Eligibility</h2>
        <p className="text-sm md:text-base mb-4">
          Participation is limited to individuals who are <span className="font-bold">at least 18 years of age</span> at the time of purchase.
          Participants are solely responsible for ensuring that their participation in the Presale complies with the laws and
          regulations of their jurisdiction.
          By participating, you represent and warrant that you meet these eligibility requirements and have full authority to
          enter into this agreement.
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">2. Nature of the Tokens</h2>
        <p className="text-sm md:text-base mb-4">
          Terravest Tokens may represent different classes of tokenized financial instruments within the Terravest
          ecosystem, including <span className="font-bold italic">utility, debt, and equity structures</span> as defined in respective offering documents.
          Tokens <span className="font-bold">do not automatically grant equity ownership, dividends, or voting rights</span> in Terravest or any affiliated entity,
          unless explicitly provided in the relevant offering terms.
          The rights and obligations attached to each class of Tokens will be described in their specific offering
          documentation.
          The Tokens are intended for use within the Terravest platform and may provide access to features, services, or
          participation in financial instruments.
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">3. Presale Participation</h2>
        <p className="text-sm md:text-base mb-4">
          All purchases of Tokens are <strong>FINAL AND NON-REFUNDABLE</strong>.
          Participants must ensure that <span className="font-bold">payments are made to the official wallet addresses provided by Terravest.</span> The
          Company will not be liable for funds sent to incorrect or unofficial addresses.
          Terravest reserves the right to <span className="font-bold">reject any participation at its sole discretion,</span> including but not limited to cases of
          suspected fraudulent activity or failure to comply with these Terms.
          The Company may, at its discretion, modify, suspend, or cancel the Presale due to <span className="italic">technical, legal, or
            market-related reasons.</span>
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">4. Token Allocation and Distribution</h2>
        <p className="text-sm md:text-base mb-4">
          Tokens will be allocated in accordance with the Presale structure and pricing tiers announced by Terravest.
          Distribution of Tokens will occur after the completion of the Presale, <span className="font-bold">subject to successful completion of necessary
            technical and compliance checks.</span>
          Terravest may adjust the distribution timeline in the event of unforeseen technical issues, <span className="italic">force majeure</span>, or
          regulatory requirements.
          Participants will be notified of distribution timelines through official communication channels.
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">5. Pricing and Payment</h2>
        <p className="text-sm md:text-base mb-4">
          The price of Tokens during the Presale will be determined based on the phases and tiers announced by
          Terravest.
          <span className="font-bold">Accepted payment methods include cryptocurrencies such as ETH, USDT, USDC</span> or others as specified by the
          Company.
          Participants are <span className="font-bold">responsible for ensuring sufficient gas fees and transaction costs</span> are covered in their payment
          transactions.
          The Company shall not be held responsible for delays or losses caused by network congestion or third-party
          wallet malfunctions.
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">6. Risk Factors</h2>
        <ol className="risk-factors text-sm md:text-base space-y-2 mb-4">
          <li><span className="font-bold">Extreme volatility</span> in the value of Tokens.</li>
          <li><span className="font-bold">Potential total loss of funds.</span></li>
          <li>Risks of <strong>technological failure,</strong> <strong>exploits,</strong> or <strong>vulnerabilities</strong> in smart contracts.</li>
          <li><span className="font-bold">Cybersecurity threats</span> including hacks, phishing, or theft.</li>
          <li><span className="font-bold">Evolving regulatory frameworks</span> which may adversely impact the Token or restrict its usage.</li>
          <li>Token Status: Participants acknowledge and agree that <span className="font-bold">The Terravest Token has NOT yet been issued</span> at the
            time of this Presale. The Token is not available on any centralized or decentralized exchange, marketplace, or
            <span className="font-bold italic">secondary market.</span> Any representation or assumption that the Token is already tradable shall be considered invalid
            and not endorsed by Terravest.</li>
          <li><span className="font-bold">Investor Responsibility (DYOR)</span>: Each Participant is required to conduct their own due diligence and research
            (DYOR) prior to participating in the Presale. Participants should carefully review the Whitepaper, offering
            documents, and independent sources of information before making any decision. Participation in the Presale shall
            be deemed as an acknowledgement that the Participant fully understands the <span className="font-bold">speculative and high-risk nature</span> of
            digital tokens.</li>
          <li><span className="font-bold">No Guarantee of Financial Return:</span> Terravest makes no representation, warranty, or guarantee regarding (a)
            any future increase in the value of the Tokens, (b) the liquidity or tradability of the Tokens on any exchange, or (c)
            the ability of the Participant to sell or convert Tokens for profit.</li>
          <li><span className="font-bold">Limitation of Liability for Losses:</span> Terravest shall not be held liable for any financial loss, whether direct, indirect,
            incidental, or consequential, incurred by Participants as a result of (a) purchasing Tokens during the Presale, (b)
            holding Tokens after distribution, or (c) attempting to trade or exchange Tokens in any form. All financial risks,
            including the potential total loss of funds, shall be borne solely by the Participant.</li>
        </ol>


        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">7. Compliance and KYC</h2>
        <p className="text-sm md:text-base mb-4">
          Terravest reserves the right to conduct <span className="font-bold">Know Your Customer (KYC) and Anti-Money Laundering (AML) checks</span>
          prior to or after the Presale.
          Participants may be required to provide accurate and complete identification documents and information for
          verification purposes.
          <span className="font-bold">Failure to comply with KYC/AML requests may result in disqualification from the Presale and forfeiture of Tokens
            without refund.</span>
          By participating, you agree that Terravest may share your information with relevant authorities where legally
          required.
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">8. Limitation of Liability</h2>
        <p className="text-sm md:text-base mb-4">
          To the fullest extent permitted by applicable law, <span className="font-bold">Terravest, its affiliates, officers, employees, and partners shall not
            be liable for any direct, indirect, incidental, or consequential damages</span> arising from participation in the Presale. This
          includes, but is not limited to, losses caused by market fluctuations, network failures, incorrect wallet usage, or
          regulatory actions.
          Participation in the Presale is
          <span className="font-bold">entirely at the Participant&lsquo;s own risk.</span>
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">9. Amendments</h2>
        <p className="text-sm md:text-base mb-4">
          Terravest reserves the right to amend, revise, or update these Terms at any time <span className="font-bold">without prior notice.</span>
          Amended Terms will be published through official Terravest communication channels, including the website,
          Discord, and X/Twitter.
          <span className="font-bold">Continued participation after any amendments constitutes acceptance</span> of the revised Terms.
        </p>

        <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">10. Governing Law</h2>
        <p className="text-sm md:text-base mb-4">
          These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
          Terravest is incorporated.
          Any disputes arising from or in connection with the Presale shall be subject to the <span className="font-bold">exclusive jurisdiction of the
            competent courts</span> in said jurisdiction.
        </p>
      </div>
    </div>
  )
}
