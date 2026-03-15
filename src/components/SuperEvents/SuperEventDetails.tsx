import React from "react";
import BorderedDiv from "../BorderedDiv";
import { Calendar, Clock, Info, Trophy } from "lucide-react";
import EventGrid from "../Events/EventGrid";
import Image from "next/image";
import Link from "next/link";

export default function SuperEventDetails({
  superEvent,
  eventsInSuperEvent = [],
}) {
  const now = new Date();

  // Sort events chronologically
  const sortedEvents = [...eventsInSuperEvent].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Group events by day
  const groupedEvents: any[] = [];
  sortedEvents.forEach((event) => {
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toDateString();
    
    let group = groupedEvents.find((g) => g.dateStr === dateStr);
    if (!group) {
      group = {
        dateStr,
        eventDate,
        events: [],
      };
      groupedEvents.push(group);
    }
    group.events.push(event);
  });

  return (
    <div className="">
      {/* Hero */}
      <div className="relative h-[260px] sm:h-[320px] md:h-[450px] w-full rounded-3xl overflow-hidden mb-8 shadow-2xl">
        <img
          src={superEvent.image}
          className="w-full h-full object-cover"
          alt={superEvent.name}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-10 w-full flex flex-col gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight drop-shadow-lg">
            {superEvent.name}
          </h1>

          <div className="hidden md:flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur rounded-full border border-[#515151] text-sm">
              <img
                src={superEvent.organizingClub.logo}
                className="w-6 h-6 rounded-full"
                alt=""
              />
              <span className="font-medium">
                {superEvent.organizingClub.name}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/80 border border-[#515151] rounded-full text-sm font-semibold">
              <Calendar size={14} />
              {new Date(superEvent.startDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {groupedEvents.length > 0 && (
        <div className="mb-12 ">
          <div className="flex items-center gap-3 mb-6">
            {/* Minimalist Icon Container */}
            <div className="flex items-center justify-center w-10 h-10 border border-gray-800 rounded-lg text-gray-400">
              <Clock size={20} strokeWidth={1.5} />
            </div>

            {/* Clean Typography */}
            <h3 className="text-xl font-medium tracking-tight text-gray-200">
              Timeline
            </h3>
          </div>
          <div className="">
            <div className="relative ml-4 border-l-2 border-[#2a2a2a] pl-8 pb-4">
              {groupedEvents.map((group, groupIdx) => {
                const { dateStr, eventDate, events } = group;
                const nowDateStr = now.toDateString();
                const isLive = dateStr === nowDateStr;

                return (
                  <div key={groupIdx} className="mb-10 relative">
                    {/* Timeline Dot for the Day */}
                    <div
                      className={`absolute -left-[41px] mt-1.5 w-4 h-4 rounded-full border-4 border-black z-10 
                    ${isLive ? "bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" : "bg-[#5E77F5]"}`}
                    ></div>
                    
                    {/* Date Label */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
                      <span className="text-base font-bold text-white uppercase tracking-wider">
                        {eventDate.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {isLive && (
                        <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/20 w-fit uppercase tracking-wide">
                          Today
                        </span>
                      )}
                    </div>
                    
                    {/* Events list within the day */}
                    <div className="flex flex-col gap-4">
                      {events.map((event: any, idx: number) => {
                        const eventDateObj = new Date(event.date);
                        return (
                          <div key={idx} className="flex flex-row items-center gap-1 sm:gap-4 w-full">
                            {/* Time UI - Outside the link */}
                            <div className="flex-shrink-0 flex items-center justify-center min-w-[70px] sm:min-w-[84px] md:py-1.5 border border-indigo-500/20 rounded-lg bg-indigo-200/10 backdrop-blur-sm shadow-sm">
                              <span className="text-[13px] sm:text-[14px] font-semibold text-indigo-300 tracking-wider text-center tabular-nums">
                                {eventDateObj.toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Kolkata",
                                })}
                              </span>
                            </div>

                            <Link href={`/events/${event._id}`} className="flex-1 min-w-0">
                              <div className="group p-2 sm:p-3 flex items-center gap-4 sm:gap-6 rounded-xl hover:bg-white/5 bg-white/5 md:bg-transparent border border-transparent transition-all duration-200">
                                {/* Event Content */}
                                <div className="flex gap-3 sm:gap-4 items-center flex-1 w-full">
                                  {/* Image Preview */}
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 relative rounded-lg overflow-hidden border border-white/5">
                                    <Image
                                      src={event.image || "/placeholder.png"}
                                      alt={event.name}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                  {/* Event Text */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="text-base sm:text-lg font-medium text-white group-hover:underline transition-colors line-clamp-1">
                                      {event.name}
                                    </h4>
                                    {event.description && (
                                      <p className="hidden md:line-clamp-2 text-xs sm:text-sm text-gray-400 leading-relaxed mt-0.5 sm:mt-1">
                                        {event.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {superEvent?.description && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            {/* Minimalist Icon Container */}
            <div className="flex items-center justify-center w-10 h-10 border border-gray-800 rounded-lg text-gray-400">
              <Info size={20} strokeWidth={1.5} />
            </div>

            {/* Clean Typography */}
            <h3 className="text-xl font-medium tracking-tight text-gray-200">
              About {superEvent.name}
            </h3>
          </div>

          <div className="whitespace-pre-line text-[#bdbdbd] bg-[#121212] border border-[#2a2a2a] p-4 rounded-xl break-words">
            {superEvent.description}
          </div>
        </div>
      )}

      {/* Events */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          {/* Minimalist Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 border border-gray-800 rounded-lg text-gray-400">
            <Calendar size={20} strokeWidth={1.5} />
          </div>

          {/* Clean Typography */}
          <h3 className="text-xl font-medium tracking-tight text-gray-200">
            Events ({eventsInSuperEvent.length})
          </h3>
        </div>
        <EventGrid events={eventsInSuperEvent} detailed={false} />
      </div>

      {/* Rewards */}
      {eventsInSuperEvent.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            {/* Minimalist Icon Container */}
            <div className="flex items-center justify-center w-10 h-10 border border-gray-800 rounded-lg text-gray-400">
              <Trophy size={20} strokeWidth={1.5} />
            </div>

            {/* Clean Typography */}
            <h3 className="text-xl font-medium tracking-tight text-gray-200">
              Rewards & Prizes
            </h3>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {eventsInSuperEvent.map(
              (event) =>
                event.prize > 0 && (
                  <div
                    key={event._id}
                    className="flex items-center rounded-xl border border-[#2a2a2a] bg-black overflow-hidden w-full p"
                  >
                    {/* Prize */}
                    <div className="bg-gradient-to-b from-[#0a1b7a] to-[#020b3a] px-4 sm:px-6 py-8 min-w-[110px] sm:min-w-[140px] text-center">
                      <div className="text-white text-lg sm:text-xl font-semibold">
                        ₹{event.prize}
                      </div>
                      <div className="text-white text-sm sm:text-lg font-semibold tracking-wide"></div>
                    </div>

                    {/* Event name */}
                    <div className="flex-1 px-4 sm:px-6 text-white text-base sm:text-lg font-medium">
                      <div className="line-clamp-1">{event.name}</div>
                      <div className="hidden text-xs md:line-clamp-2 text-[#515151] break-words">
                        {event.description}
                      </div>
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
