import React from "react";
import BorderedDiv from "../BorderedDiv";
import { Building } from "lucide-react";

export default function SuperEventDetails({ superEvent, eventsInSuperEvent }) {
  return (
    <div>
      <BorderedDiv className="p-4 mb-8">
        <div>
          <img
            src={superEvent.organizingClub.logo}
            className="h-20 w-20 rounded-full border border-[#717171]"
            alt=""
          />
          <h1 className="text-3xl font-semibold my-4">{superEvent.name}</h1>
          <div className="flex ml-auto items-center gap-2 text-[#717171] my-2">
            <Building />
            {superEvent.organizingClub.name}
          </div>
        </div>
      </BorderedDiv>
    </div>
  );
}
