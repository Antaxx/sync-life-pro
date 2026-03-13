import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="ml-[240px] flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
