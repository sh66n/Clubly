"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface AcademicYearContextType {
  academicYear: string;
  setAcademicYear: (year: string) => void;
  availableYears: string[];
  setAvailableYears: (years: string[]) => void;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Compute default academic year based on today's date
  const getDefaultAcademicYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // July is index 6
    return currentMonth >= 6 
      ? `${currentYear}-${currentYear + 1}` 
      : `${currentYear - 1}-${currentYear}`;
  };

  const defaultYear = getDefaultAcademicYear();
  const urlYear = searchParams.get("academicYear");

  const [academicYear, setAcademicYearState] = useState<string>(urlYear || defaultYear);
  const [availableYears, setAvailableYears] = useState<string[]>([defaultYear]);

  // Keep state in sync with URL parameter if present
  useEffect(() => {
    if (urlYear && urlYear !== academicYear) {
      setAcademicYearState(urlYear);
    }
  }, [urlYear]);

  const setAcademicYear = (newYear: string) => {
    setAcademicYearState(newYear);
    const params = new URLSearchParams(searchParams.toString());
    params.set("academicYear", newYear);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <AcademicYearContext.Provider
      value={{
        academicYear,
        setAcademicYear,
        availableYears,
        setAvailableYears,
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error("useAcademicYear must be used within an AcademicYearProvider");
  }
  return context;
}
