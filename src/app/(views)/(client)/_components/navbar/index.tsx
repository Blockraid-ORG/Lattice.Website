import MainLogo from '@/components/logo'
import { ModeToggle } from '@/components/mode-toggle'
import WalletButton from '@/components/wallet-button'
// import NavMenu from './menu'
import { SheetMenu } from './sheet-menu'

export default function MainNavbar() {
  return (
    <nav className='fixed left-0 top-0 right-0 z-40'>
      <div className="container">
        <div className="flex h-[60px] md:h-[80px] items-center">
          <div className='flex-1 w-auto md:w-1/4 shrink-0'>
            <MainLogo />
          </div>
          <SheetMenu />
          {/* <div className="flex-1 hidden md:flex items-center justify-center border py-3 rounded-lg backdrop-blur-lg">
            <NavMenu />
          </div> */}
          <div className='w-full md:w-1/4 shrink-0 hidden md:flex justify-end gap-2'>
            <WalletButton />
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
