"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePath } from "@/hooks/usePath";
import { createContext, useContext, useEffect, useState } from "react";
import {
  BarChart3, BedDouble, Building2, CalendarCheck, FileText, Landmark, LayoutDashboard, LogOut, Menu, PartyPopper,
  Percent, Settings, Wallet, X, Loader2,
} from "lucide-react";
import { adminApi } from "@/services/api";
import { routes } from "@/config/routes";
import type { SessionUser } from "@/types/api";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", Icon: CalendarCheck },
  { href: "/admin/invoices", label: "Invoices", Icon: FileText },
  { href: "/admin/payments", label: "Payments", Icon: Wallet },
  { href: "/admin/customers", label: "B2B Customers", Icon: Building2 },
  { href: "/admin/events", label: "Events & Enquiries", Icon: PartyPopper },
  { href: "/admin/rooms", label: "Rooms & Rates", Icon: BedDouble },
  { href: "/admin/tax", label: "Tax rules (GST)", Icon: Percent },
  { href: "/admin/reports", label: "Reports", Icon: BarChart3 },
  { href: "/admin/settings", label: "Settings & Staff", Icon: Settings },
];

const SessionCtx = createContext<SessionUser | null>(null);
export const useSession = () => useContext(SessionCtx)!;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePath();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    adminApi.me().then((r) => setUser(r.user)).catch(() => router.replace("/admin/login"));
  }, [isLogin, router]);
  useEffect(() => setOpen(false), [pathname]);

  if (isLogin) return <>{children}</>;
  if (!user) return <div className="grid min-h-screen place-items-center bg-[#f4f5f9]"><Loader2 className="size-7 animate-spin text-slate-400" aria-label="Loading" /></div>;

  const signOut = async () => { await adminApi.logout().catch(() => {}); router.push("/admin/login"); };

  const nav = (
    <nav aria-label="Admin" className="space-y-0.5 px-3">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href) || (href === "/admin/invoices" && pathname.startsWith("/admin/invoice"));
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={cn("flex min-h-11 items-center gap-3 rounded-xl px-4 text-[0.9rem] font-medium transition-colors", active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
            <Icon className="size-[1.05rem] shrink-0" aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-3 px-6 py-5">
      <LogoMark size={38} />
      <div className="leading-tight"><p className="font-display text-xl font-bold text-white">KP Hotel</p><p className="eyebrow text-[0.6rem] text-slate-500">Operations</p></div>
    </div>
  );

  return (
    <SessionCtx.Provider value={user}>
      <div className="min-h-screen bg-[#f4f5f9] font-sans text-slate-800 lg:grid lg:grid-cols-[16.5rem_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col bg-[#151a2c] lg:flex">
          {brand}
          <div className="flex-1 overflow-y-auto py-2">{nav}</div>
          <div className="border-t border-white/10 p-3">
            <p className="px-3 pb-2 text-xs text-slate-400">{user.name} · <span className="capitalize">{user.role}</span></p>
            <button onClick={signOut} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#151a2c]">
              <div className="flex items-center justify-between pr-3">{brand}<button onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-11 place-items-center text-slate-300"><X className="size-5" /></button></div>
              <div className="flex-1 overflow-y-auto py-2">{nav}</div>
              <button onClick={signOut} className="m-3 flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm text-slate-400"><LogOut className="size-4" /> Sign out</button>
            </aside>
          </div>
        )}

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-11 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"><Menu className="size-5" aria-hidden /></button>
            <p className="font-display text-2xl font-semibold text-slate-900">Good day, {user.name.split(" ")[0]}</p>
            <span className="ml-auto grid size-10 shrink-0 place-items-center rounded-full bg-[#4f6bff] text-sm font-bold text-white" aria-label={`Signed in as ${user.name}`}>{user.name[0]}</span>
          </header>
          <div className="p-4 sm:p-8">{children}</div>
        </div>
      </div>
    </SessionCtx.Provider>
  );
}
