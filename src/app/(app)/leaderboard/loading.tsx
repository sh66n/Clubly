import { LoaderCircle } from "lucide-react";
import React from "react";

export default function loading() {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <LoaderCircle className="h-20 w-20 animate-spin" />
      {/* <div className="h-20 w-20 bg-[url(/icons/loading.png)] bg-cover bg-center bg-no-repeat animate-spin"></div> */}
    </div>
  );
}
