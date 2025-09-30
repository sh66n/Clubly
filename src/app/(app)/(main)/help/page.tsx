"use client";
import React from "react";

const clubs = [
  {
    name: "CESA",
    email: "cesa@pvppcoe.ac.in",
    admin: "Shaan Edross",
    phone: "+91 9876543210",
    timing: "Mon-Fri: 10:00 AM - 5:00 PM",
  },
  {
    name: "CSI",
    email: "csi@pvppcoe.ac.in",
    admin: "Harsh Nikam",
    phone: "+91 9123456780",
    timing: "Mon-Fri: 11:00 AM - 4:00 PM",
  },
  {
    name: "ITSA",
    email: "itsa@pvppcoe.ac.in",
    admin: "Pradeep Mane",
    phone: "+91 9988776655",
    timing: "Mon-Fri: 9:30 AM - 3:30 PM",
  },
  {
    name: "WDC",
    email: "wdc@pvppcoe.ac.in",
    admin: "Dr. Gayatri Bachav",
    phone: "+91 9876501234",
    timing: "Mon-Fri: 10:30 AM - 5:30 PM",
  },
  {
    name: "NSS",
    email: "nss@pvppcoe.ac.in",
    admin: "Prof. Manish Parmar",
    phone: "+91 8899776655",
    timing: "Mon-Fri: 12:00 PM - 6:00 PM",
  },
  {
    name: "SPORTS",
    email: "sports@pvppcoe.ac.in",
    admin: "Siddharth Tiwari",
    phone: "+91 9001234567",
    timing: "Mon-Fri: 8:00 AM - 2:00 PM",
  },
  {
    name: "CULTURE",
    email: "culture@pvppcoe.ac.in",
    admin: "Sakshi Patil",
    phone: "+91 9765432109",
    timing: "Mon-Fri: 2:00 PM - 6:00 PM",
  },
  {
    name: "AISAC",
    email: "aisac@pvppcoe.ac.in",
    admin: "Prof. Vedant Kulkarni",
    phone: "+91 9098765432",
    timing: "Mon-Fri: 9:00 AM - 1:00 PM",
  },
  {
    name: "ECS",
    email: "ecs@pvppcoe.ac.in",
    admin: "Dr. Rajeshwari Patil",
    phone: "+91 9012345678",
    timing: "Mon-Fri: 11:00 AM - 5:00 PM",
  },
];

const HelpPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        Help & Support
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club, index) => (
          <div
            key={index}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-lg 
                       transition-all duration-300 hover:shadow-[0_0_20px_#00f7ff] hover:scale-105"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{club.name}</h2>
            <p className="text-gray-300">
              <span className="font-semibold text-white">Admin:</span>{" "}
              {club.admin}
            </p>
            <p className="text-gray-300">
              <span className="font-semibold text-white">Phone:</span>{" "}
              {club.phone}
            </p>
            <p className="text-gray-300">
              <span className="font-semibold text-white">Email:</span>{" "}
              {club.email}
            </p>
            <p className="text-gray-300 mt-2">{club.timing}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
