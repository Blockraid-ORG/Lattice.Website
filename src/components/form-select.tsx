'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Control, FieldPath, FieldValues } from 'react-hook-form'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type Option = {
  label: string
  value: string
  iconUrl?: string
  iconName?: string
  disabled?: boolean
}

type Group = {
  label: string
  options: Option[]
}

type SelectInputProps<T extends FieldValues> = {
  name: FieldPath<T>
  label?: string
  placeholder?: string
  groups: Group[]
  className?: string,
  control: Control<T>,
  onChangeValue?: (value: string) => void,
  disabled?: boolean
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  placeholder = 'Select an option',
  groups,
  className,
  control,
  onChangeValue
}: SelectInputProps<T>) {
  // const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Select
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val)
                onChangeValue?.(val)
              }}
            >
              <SelectTrigger className={cn(
                'w-full',
                'focus-visible:ring-blue-200/50 focus-visible:border-blue-200/50',
                fieldState.error ? 'bg-red-200/10 ring-1 ring-red-300' : 'bg-blue-100/30 dark:bg-primary-foreground',
                className
              )}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="max-h-64 overflow-y-auto">
                {groups.map((group, i) => (
                  <SelectGroup key={i}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.options.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled}
                      >
                        <div className="flex items-center gap-2">
                          {opt.iconUrl ? (
                            <Image
                              src={opt.iconUrl}
                              alt={opt.label}
                              width={20}
                              height={20}
                              className="rounded-sm"
                            />
                          ) : opt.iconName ? (
                            <Icon name={opt.iconName} className="text-lg" />
                          ) : null}
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
