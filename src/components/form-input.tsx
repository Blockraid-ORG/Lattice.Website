'use client'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Textarea } from './ui/textarea'

type FormInputProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
  type?: string,
  rows?: number
  disabled?: boolean
  onPaste?: React.ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>
  min?: string
} & { isLongText?: boolean }

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  isLongText,
  rows,
  disabled,
  onPaste,
  min
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {
              isLongText ? (
                <Textarea
                  disabled={disabled}
                  rows={rows ?? 5}
                  className={cn(
                    'focus-visible:ring-blue-200/50 focus-visible:border-blue-200/50',
                    fieldState.error ? 'bg-red-200/10 ring-1 ring-red-300' : 'bg-blue-100/30 dark:bg-primary-foreground'
                  )}
                  placeholder={placeholder} {...field}
                  onPaste={onPaste}
                />
              ) : (

                <Input
                  disabled={disabled}
                  className={cn(
                    'focus-visible:ring-blue-200/50 focus-visible:border-blue-200/50',
                    fieldState.error ? 'bg-red-200/10 ring-1 ring-red-300' : 'bg-blue-100/30 dark:bg-primary-foreground'
                  )}
                  placeholder={placeholder}
                  onPaste={onPaste}
                  type={type}
                  min={type=== 'number' ? min :''}
                  {...field}
                />
              )
            }
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}