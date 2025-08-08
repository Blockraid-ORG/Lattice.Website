import { ScrollArea } from "@/components/ui/scroll-area";
import NavbarAdmin from "./_components/navbar";
import Sidebar from "./_components/sidebar";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // "flex h-screen relative bg-slate-50 dark:bg-[#4057F7]/10"
    <div className={cn(
      'flex h-screen relative',
      'bg-gradient-to-t from-transparent via-transparent to-[#4057F7]/5 dark:to-[#4057F7]/20'
    )}>
      <Sidebar />
      <main className="flex-1 w-full z-10">
        <ScrollArea className="h-screen">
          <NavbarAdmin />
          <div className="container md:px-4">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
