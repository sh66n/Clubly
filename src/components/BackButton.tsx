"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  link?: string;
}

export default function BackButton({ link }: BackButtonProps) {
  console.log(link);
  const router = useRouter();

  if (link) {
    return (
      <Link
        href={link}
        className="text-black bg-white rounded-full mb-4 inline-flex items-center justify-center p-0"
      >
        <ChevronLeft />
      </Link>
    );
  } else {
    return (
      <button
        onClick={() => router.back()}
        className="text-black bg-white rounded-full mb-4"
      >
        <ChevronLeft />
      </button>
    );
  }
}
