import React from "react";
import clsx from "clsx"; // lightweight utility for merging class names

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  id: string;
  placeholder?: string;
  className?: string; // allow passing extra classes
}

export default function Input({
  name,
  id,
  placeholder,
  required,
  type = "text",
  className,
  ...props
}: InputProps) {
  return (
    <input
      name={name}
      id={id}
      type={type}
      placeholder={placeholder}
      required={required}
      className={clsx(
        "w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
        className // merge additional classes here
      )}
      {...props}
    />
  );
}
