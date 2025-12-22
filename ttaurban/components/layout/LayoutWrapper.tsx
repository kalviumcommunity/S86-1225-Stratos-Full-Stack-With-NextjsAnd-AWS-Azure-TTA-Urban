import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function LayoutWrapper({
  children,
  showSidebar = true,
}: LayoutWrapperProps) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}
        <main className="flex-1 bg-white p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
