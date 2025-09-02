import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { FormInput } from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TProject } from "@/types/project";
import { Plus } from "lucide-react";
import Link from "next/link";

const itemSchema = z.object({
  address: z.string(),
  amount: z.coerce.number().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: "Amount must be a positive number",
  }),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "At least one recipient is required"),
});

export type MultipleRecipientsFormValues = z.infer<typeof formSchema>;

const defaultRow = { address: "", amount: 0 };

export default function FormAddressAmount({ data }: { data: TProject }) {
  const form = useForm<MultipleRecipientsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: [defaultRow] },
    mode: "onChange",
  });

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text");
    const rows = text
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);
    const parsed = rows.map((r) => {
      const [address, amount] = r.split(/\t|,/); // bisa tab atau koma
      return {
        address: address?.trim() ?? "",
        amount: Number(amount?.trim() ?? 0),
      };
    });

    if (parsed.length > 0) {
      let existing = form.getValues("items") ?? [];
      if (
        existing.length === 1 &&
        !existing[0].address &&
        !existing[0].amount
      ) {
        existing = [];
      }
      form.setValue("items", [...existing, ...parsed], {
        shouldValidate: true,
      });
    }
  }
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function handleSubmit(values: MultipleRecipientsFormValues) {
    ({ data, values });
  }

  return (
    <Form {...form}>
      <div className="mb-3">
        <Textarea
          rows={6}
          placeholder="Paste from Excel (address, amount)"
          onPaste={handlePaste}
          className="w-full border rounded-md p-2 text-sm"
        />
        <div className="flex justify-end">
          <Link
            className="text-blue-500 font-semibold underline text-sm"
            href="https://terravest-storage.s3.ap-southeast-1.amazonaws.com/templates/template_reward.xlsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Template
          </Link>
        </div>
      </div>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-1">
          {fields.map((field, idx) => (
            <div key={field.id}>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name={`items.${idx}.address`}
                    label=""
                    placeholder="0x..."
                    type="text"
                  />
                </div>
                <div className="flex-1">
                  <FormInput
                    control={form.control}
                    name={`items.${idx}.amount`}
                    label=""
                    placeholder="e.g. 1000"
                    type="number"
                  />
                </div>
                {/* <Button type="button" variant="destructive" size="icon" onClick={() => remove(idx)} disabled={fields.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button> */}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end">
          <Button
            className="py-3"
            type="button"
            size={"xs"}
            onClick={() => append(defaultRow)}
          >
            <Plus className="h-4 w-4" /> Add row
          </Button>
        </div>
        <Separator />

        <div className="flex gap-2 justify-end sticky bottom-0 py-4 backdrop-blur-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset({ items: [defaultRow] })}
          >
            Reset
          </Button>
          <Button type="submit">
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
