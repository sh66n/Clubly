import React from "react";
import BorderedDiv from "../BorderedDiv";
import { Calendar, Clock, Info, Trophy } from "lucide-react";
import EventGrid from "../Events/EventGrid";

export default function SuperEventDetails({
  superEvent,
  eventsInSuperEvent = [],
}) {
  const now = new Date();

  // Sort events chronologically
  const sortedEvents = [...eventsInSuperEvent].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  return (
    <div className="">
      {/* Hero */}
      <div className="relative h-[260px] sm:h-[320px] md:h-[450px] w-full rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
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
      {sortedEvents.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
              <Clock />
            </div>
            <h3 className="text-2xl">Timeline</h3>
          </div>

          <div className="relative ml-4 border-l-2 border-[#2a2a2a] pl-8 pb-4">
            {sortedEvents.map((event, idx) => {
              const eventDate = new Date(event.date);

              // Create "Date Only" strings to compare (YYYY-MM-DD)
              const eventDateStr = eventDate.toDateString(); // e.g., "Tue Jan 20 2026"
              const nowDateStr = now.toDateString();

              // Logic: Is it happening today?
              const isLive = eventDateStr === nowDateStr;

              // Logic: Has the day already passed?
              // We compare the start of the days in milliseconds
              const eventStartOfDay = new Date(
                eventDate.setHours(0, 0, 0, 0),
              ).getTime();
              const nowStartOfDay = new Date(
                now.setHours(0, 0, 0, 0),
              ).getTime();

              return (
                <div key={idx} className="mb-10 relative">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[41px] mt-1.5 w-4 h-4 rounded-full border-4 border-black z-10 
                    ${isLive ? "bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" : "bg-blue-600"}`}
                  ></div>

                  {/* Date/Time Label */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                      {eventDate.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="hidden md:block text-[#515151]">•</span>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock size={14} />
                      {eventDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isLive && (
                      <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/20 w-fit ml-2 uppercase">
                        Live Now
                      </span>
                    )}
                  </div>

                  {/* Event Content */}
                  <BorderedDiv className="bg-[#121212] border border-[#2a2a2a] p-4 rounded-xl hover:border-[#4a4a4a] transition-colors">
                    <h4 className="text-lg font-medium text-white">
                      {event.name}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </BorderedDiv>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Description */}
      {superEvent?.description && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
              <Info />
            </div>
            <h3 className="text-2xl">About {superEvent.name}</h3>
          </div>

          <BorderedDiv className="whitespace-pre-line text-[#bdbdbd]">
            {superEvent.description}
          </BorderedDiv>
        </div>
      )}

      {/* Events */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
            <Calendar />
          </div>
          <h3 className="text-2xl">Events ({eventsInSuperEvent.length})</h3>
        </div>

        <EventGrid events={eventsInSuperEvent} detailed={false} />
      </div>

      {/* Rewards */}
      {eventsInSuperEvent.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center p-2 bg-gray-900 rounded-lg">
              <Trophy />
            </div>
            <h3 className="text-2xl">Rewards & Prizes</h3>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsInSuperEvent.map((event) => (
              <div
                key={event._id}
                className="flex items-center rounded-xl border border-[#2a2a2a] bg-black overflow-hidden w-full"
              >
                {/* Prize */}
                <div className="bg-gradient-to-b from-[#0a1b7a] to-[#020b3a] px-4 sm:px-6 py-4 min-w-[110px] sm:min-w-[140px] text-center">
                  <div className="text-white text-lg sm:text-xl font-semibold">
                    ₹{event.prize}
                  </div>
                  <div className="text-white text-sm sm:text-lg font-semibold tracking-wide">
                    CASH
                  </div>
                </div>

                {/* Event name */}
                <div className="flex-1 px-4 sm:px-6 text-white text-base sm:text-lg font-medium">
                  <div className="line-clamp-1">{event.name}</div>
                  <div className="text-xs line-clamp-2 text-[#515151]">
                    {event.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
