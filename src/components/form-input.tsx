"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Textarea } from "./ui/textarea";

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  type?: string;
  rows?: number;
  disabled?: boolean;
  onPaste?: React.ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  min?: string;
  formatNumber?: boolean;
} & { isLongText?: boolean };

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  isLongText,
  rows,
  disabled,
  onPaste,
  min,
  formatNumber = false,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (formatNumber) {
            const rawValue = parseFormattedNumber(e.target.value);
            field.onChange(rawValue);
          } else {
            field.onChange(e.target.value);
          }
        };

        const handleBlur = () => {
          field.onBlur();
        };

        const displayValue = formatNumber
          ? formatNumberWithCommas(field.value)
          : field.value;

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {isLongText ? (
                <Textarea
                  disabled={disabled}
                  rows={rows ?? 5}
                  className={cn(
                    "focus-visible:ring-blue-200/50 focus-visible:border-blue-200/50",
                    fieldState.error
                      ? "bg-red-200/10 ring-1 ring-red-300"
                      : "bg-blue-100/30 dark:bg-primary-foreground"
                  )}
                  placeholder={placeholder}
                  {...field}
                  onPaste={onPaste}
                />
              ) : (
                <Input
                  disabled={disabled}
                  className={cn(
                    "focus-visible:ring-blue-200/50 focus-visible:border-blue-200/50",
                    fieldState.error
                      ? "bg-red-200/10 ring-1 ring-red-300"
                      : "bg-blue-100/30 dark:bg-primary-foreground"
                  )}
                  placeholder={placeholder}
                  onPaste={onPaste}
                  type={formatNumber ? "text" : type}
                  min={type === "number" ? min : ""}
                  value={displayValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
