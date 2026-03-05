"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SuccessIcon() {
  return (
    <div className="flex justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        <CheckCircle2 className="h-14 w-14 text-emerald-500 stroke-[1.5px]" />
      </motion.div>
    </div>
  );
}
