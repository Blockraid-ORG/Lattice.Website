"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cutString } from "@/lib/utils";
import { useLogout } from "@/modules/auth/auth.query";
import { useWeb3AuthDisconnect } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { Icon } from "./icon";

export function WalletButtonConnected() {
  const { mutate: logout } = useLogout();
  const { disconnect, loading: disConnecting } = useWeb3AuthDisconnect();
  const { address } = useAccount();
  async function handleDisconnect() {
    await disconnect();
    await logout();
    window.location.href = "/";
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disConnecting} className="hidden md:flex">
          <Icon name="solar:wallet-2-bold" />
          <p>{cutString(address || "", 3)}</p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>GitHub</DropdownMenuItem>
        <DropdownMenuItem disabled>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          Disconnect
          <DropdownMenuShortcut>
            <Icon name="majesticons:logout-half-circle-line" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
