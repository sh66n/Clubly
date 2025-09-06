import ClubCard from "./ClubCard";

interface Club {
  _id: string;
  name: string;
  department: string;
  logo: string;
  events?: string[];
  coreMembers?: string[];
  volunteers?: string[];
}

export default function ClubGrid({ clubs }: { clubs: Club[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6">
      {clubs.map((club) => (
        <ClubCard key={club._id} club={club} />
      ))}
    </div>
  );
}
