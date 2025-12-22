"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "📊 Overview", icon: "📊" },
    { href: "/users/1", label: "👥 Users", icon: "👥" },
    { href: "/complaints", label: "📝 Complaints", icon: "📝" },
    { href: "/departments", label: "🏢 Departments", icon: "🏢" },
    { href: "/contact", label: "📧 Contact", icon: "📧" },
  ];

  return (
    <aside className="w-64 h-full bg-gray-100 border-r border-gray-200 p-4">
      <h2 className="text-lg font-bold mb-6 text-gray-800">Navigation</h2>
      <ul className="space-y-2">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-200 hover:text-indigo-600"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label.replace(/^.+ /, "")}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 p-4 bg-indigo-50 rounded-md">
        <p className="text-xs text-gray-600 mb-2">Quick Stats</p>
        <p className="text-sm font-semibold text-gray-800">
          12 Active Complaints
        </p>
        <p className="text-sm font-semibold text-gray-800">5 Departments</p>
      </div>
    </aside>
  );
}
