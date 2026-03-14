"use client";

import { ChevronRight, House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const isMongoId = (segment: string) => /^[a-f0-9]{24}$/i.test(segment);

export default function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-400 flex items-center mb-8 gap-2">
      <Link href="/dashboard" className="hover:bg-white/5 p-2 rounded-sm">
        <House size={16} />
      </Link>

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        const label = isMongoId(segment)
          ? "Details"
          : segment.replace(/-/g, " ");

        return (
          <span key={href} className="flex items-center">
            <ChevronRight size={16} />

            {isLast ? (
              <span className="text-white capitalize py-1 px-2 rounded-sm bg-white/5 hover:cursor-pointer">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="capitalize py-1 px-2 rounded-sm hover:bg-white/5"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
