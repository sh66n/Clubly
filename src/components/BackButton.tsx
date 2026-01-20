"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  link?: string;
}

export default function BackButton({ link }: BackButtonProps) {
  const router = useRouter();

  return (
    <div className="flex gap-1">
      {link ? (
        <Link
          href={link}
          className="text-white mb-4 inline-flex items-center justify-center p-0 cursor-pointer"
        >
          <ChevronLeft />
        </Link>
      ) : (
        <button
          onClick={() => router.back()}
          className="text-white mb-4 cursor-pointer"
        >
          <ChevronLeft />
        </button>
      )}
      <button
        disabled
        className="text-white mb-4 cursor-not-allowed opacity-50"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
