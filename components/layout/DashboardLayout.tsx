import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface Props {
  children: ReactNode;
  /** Use wider max-width for dashboard grids (e.g. synoptic view) */
  wide?: boolean;
}

export function DashboardLayout({ children, wide }: Props) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div
            className={`mx-auto ${wide ? "max-w-7xl" : "max-w-6xl"}`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

