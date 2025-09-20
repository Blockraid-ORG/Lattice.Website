import { cn } from '@/lib/utils'
export default function BadgeScStatus(props: { status: boolean }) {
  return (
    <div className={cn(
      'max-w-max px-2 py-0.5 text-xs font-semibold rounded',
      props.status ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500',
    )} />
  )
}
