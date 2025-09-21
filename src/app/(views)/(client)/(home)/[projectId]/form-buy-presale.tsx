// 'use client'
// import { FormInput } from "@/components/form-input"
// import { Icon } from "@/components/icon"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger
// } from "@/components/ui/dialog"
// import { Form } from "@/components/ui/form"
// import { useContribute } from "@/modules/contribute/contribute.hook"
// import { formBuyPresale } from "@/modules/project/project.schema"
// import { TFormBuyPresale, TProject } from "@/types/project"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useState } from "react"
// import { useForm } from "react-hook-form"

// export function FormBuyPresale({ data }: { data: TProject }) {
//   const [open, setOpen] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const { contributePresale } = useContribute()
//   const form = useForm<TFormBuyPresale>({
//     resolver: zodResolver(formBuyPresale(Number(data.presales.maxContribution))),
//     defaultValues: {
//       amount: 0.001
//     }
//   })
//   async function onSubmit(values: TFormBuyPresale) {
//     setLoading(true)
//     await contributePresale(data, values.amount)
//     setOpen(false)
//     setLoading(false)
//   }

//   return (
//     <Dialog open={open} onOpenChange={()=>setOpen(!open)}>
//       <DialogTrigger asChild>
//         <Button size={'lg'} className='w-full md:w-max'>
//           <Icon name="lucide-lab:copy-down" /> Contribute
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Form Contribute</DialogTitle>
//           <DialogDescription>
//             Maximum Contribution: {data.presales.maxContribution}
//           </DialogDescription>
//         </DialogHeader>
//         <div>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//               <FormInput
//                 control={form.control}
//                 label="Amount"
//                 name={'amount'}
//                 placeholder="input amount"
//               />
//               <div className="mt-5 flex justify-end">
//                 <Button className="flex gap-2" disabled={loading} type="submit">
//                   {loading && <Icon name="icon-park-outline:loading" className="animate-spin" />}
//                   Submit
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

import { TProject } from "@/types/project";
import React from "react";

export default function FormBuyPresale({ data }: { data: TProject }) {
  console.log(data);
  return <div>FormBuyPresale</div>;
}
