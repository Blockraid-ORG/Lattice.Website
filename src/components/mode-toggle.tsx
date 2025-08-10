'use client'

import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button size="icon" className='shrink-0' onClick={toggleTheme}>
      <Icon className='dark:block hidden text-xl' name='ri:sun-fill' />
      <Icon className='block dark:hidden text-xl' name='material-symbols-light:clear-night' />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
