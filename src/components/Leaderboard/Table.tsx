import React from "react";

export default function Table({ topUsers }) {
  return (
    <div className="bg-black h-[40%] flex flex-col rounded-lg border border-[#515151] relative z-10">
      <div className="p-4 border-b border-b-[#515151] text-2xl font-semibold">
        All Time
      </div>
      <div className="overflow-y-auto scrollbar-hide">
        <table className="bg-black w-full">
          <tbody>
            {topUsers.map((user, index) => (
              <tr
                key={user._id}
                className="border-b border-[#515151] flex items-center"
              >
                <td className="p-2">#{index + 1}</td>
                <td className="p-2">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                </td>
                <td className="p-2">{user.name}</td>
                <td className="p-2 font-semibold ml-auto mr-20">
                  {user.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent z-20 rounded-b-lg" />
    </div>
  );
}
