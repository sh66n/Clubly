import React from "react";

export default function loading() {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="h-20 w-20 bg-[url(/icons/loading.png)] bg-cover bg-center bg-no-repeat animate-spin"></div>
    </div>
  );
}
