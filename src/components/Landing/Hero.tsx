import React from "react";

export default function Hero() {
  return (
    <div
      id="home"
      className="min-h-screen bg-[url(/images/landing-hero.png)] bg-cover bg-center bg-no-repeat flex justify-center items-center font-light"
    >
      <div className="flex flex-col mb-32 items-center justify-center">
        <div className="heading text-[#5E77F5] text-xs md:text-base">
          {"{ Gamifying the college club experience }"}
        </div>
        <div className="xs:text-xl sm:text-2xl md:text-3xl xl:text-4xl mt-2">
          College clubs do <span className="italic text-[#5E77F5]">a lot.</span>
        </div>
        <div className="xs:text-xl sm:text-2xl md:text-3xl xl:text-4xl flex gap-2">
          {/* <div className="font-bold flex items-center gap-2">
              <div className="h-8 w-8 bg-[url(/images/logo-without-text.png)] bg-contain bg-no-repeat bg-center "></div>
              Clubly
            </div> */}
          <span>Clubly</span>
          makes it easier.
        </div>
      </div>
    </div>
  );
}
