import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6 pb-24 md:pb-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
