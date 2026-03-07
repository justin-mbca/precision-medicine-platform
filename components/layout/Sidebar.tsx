import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ClipboardDocumentListIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    name: "Patients",
    href: "/",
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />
  },
  {
    name: "Genomic insights",
    href: "/genomic",
    icon: <BeakerIcon className="h-5 w-5" />
  },
  {
    name: "Virtual Colleague",
    href: "/assistant",
    icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />
  }
];

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-slate-900 text-slate-100">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/" className="text-lg font-semibold">
          Precision<span className="text-brand-400">Med</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 text-xs text-slate-500">
        For demo use only — not clinical grade.
      </div>
    </aside>
  );
}

