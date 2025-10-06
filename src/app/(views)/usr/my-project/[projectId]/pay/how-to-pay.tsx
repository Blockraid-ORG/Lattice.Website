import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function HowToPay() {
  return (
    <div className="bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg">
      <div>
        <h2 className="text-lg font-semibold">How to pay?</h2>
      </div>
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={["item-1", "item-2", "item-3"]}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Select Payment Method</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              Choose a payment method from the option, it will be retrive billing info
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Process Payment</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              Click on button Payment Process.
            </p>
            <p>
              It will be open confirmation dialog and click <b>Pay Now</b> to continue
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Token Approval</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              Your wallet will open to request approval for token transfer for payment.
            </p>
            <p>
              then please agree to transfer the listing fee payment.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
