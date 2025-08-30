import React from "react";

export default function Ranking({ users }) {
  const enoughData = users.length >= 3;

  return enoughData ? (
    <>
      <h1 className="text-5xl font-semibold">Leaderboard</h1>
      <div className="mt-2 text-[#717171]">
        Your efforts, ranked and recognized.
      </div>
      <div className="w-full grow">
        <div className="h-1/2 flex justify-center">
          <div>
            <div className="w-40 h-3/4 flex flex-col justify-end">
              <div className="flex flex-col items-center aspect-square">
                <img
                  className={`h-3/4 w-3/4 rounded-full`}
                  src={users[1].image}
                ></img>
                <div className="mt-2">{users[1].name}</div>
              </div>
            </div>
            <div className="w-40 h-1/4 bg-[#30429A] rounded-t-2xl text-3xl text-center py-4">
              <div className="">#2</div>
            </div>
          </div>
          <div>
            <div className="w-40 h-1/2">
              <div className="flex flex-col items-center aspect-square">
                <img
                  className={`h-3/4 w-3/4 rounded-full`}
                  src={users[0].image}
                ></img>
                <div className="h-1/4 ">{users[0].name}</div>
              </div>
            </div>
            <div className="w-40 h-1/2 bg-[#24306D] rounded-t-2xl text-3xl text-center py-4">
              <div className="">#1</div>
            </div>
          </div>
          <div>
            <div className="w-40 h-7/8 flex flex-col justify-end">
              <div className="flex flex-col items-center aspect-square">
                <img
                  className={`h-3/4 w-3/4 rounded-full`}
                  src={users[2].image}
                ></img>
                <div className="mt-2">{users[2].name}</div>
              </div>
            </div>
            <div className="w-40 h-1/8 bg-[#5E77F5] rounded-t-2xl text-3xl text-center pt-1">
              <div className="">#3</div>
            </div>
          </div>
          <div></div>
          <div></div>
        </div>
        <div className="bg-black h-1/2 flex flex-col rounded-lg border border-[#515151] relative z-10">
          <div className="p-4 border-b border-b-[#515151] text-2xl font-semibold">
            All Time
          </div>
          <div className="overflow-y-auto scrollbar-hide">
            <table className="bg-black w-full">
              <tbody>
                {users.map((user, index) => (
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
      </div>
    </>
  ) : (
    <div>Not enough data</div>
  );
}
