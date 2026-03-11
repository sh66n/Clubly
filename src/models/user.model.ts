import mongoose, { Schema, model } from "mongoose";
import { IUser } from "./user.schema";

export enum Department {
  COMPUTER_ENGINEERING = "Computer Engineering",
  ARTIFICIAL_INTELLIGENCE = "Artificial Intelligence",
  ELECTRONICS_AND_COMPUTER_SCIENCE = "Electronics and Computer Science",
  INFORMATION_TECHNOLOGY = "Information Technology",
  MECHATRONICS = "Mechatronics",
}

export enum Year {
  FE = 1,
  SE = 2,
  TE = 3,
  BE = 4,
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "club-admin"],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    points: [
      {
        clubId: { type: Schema.Types.ObjectId, ref: "Club" },
        points: { type: Number, default: 0 },
      },
    ],
    adminClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    phoneNumber: {
      type: String,
    },
    department: {
      type: String,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true },
);

function inferStudentInfo(email: string) {
  if (!email || !email.endsWith("@pvppcoe.ac.in")) return {};

  const prefix4 = email.substring(0, 4).toLowerCase();
  const prefix3 = email.substring(0, 3).toLowerCase();

  const deptMap: Record<string, Department> = {
    vu1: Department.COMPUTER_ENGINEERING,
    vu2: Department.ARTIFICIAL_INTELLIGENCE,
    vu3: Department.ELECTRONICS_AND_COMPUTER_SCIENCE,
    vu4: Department.INFORMATION_TECHNOLOGY,
    vu7: Department.MECHATRONICS,
  };

  const department = deptMap[prefix3];

  const isDSE = prefix4.endsWith("s");

  const match = email.match(/\d{4}/);
  if (!match) return { department };

  const startYearShort = parseInt(match[0].substring(0, 2));
  const currentYearShort = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth();

  const adjustedCurrentYear =
    currentMonth < 6 ? currentYearShort - 1 : currentYearShort;

  let diff = adjustedCurrentYear - startYearShort + 1;

  if (isDSE) diff += 1;

  const yearMap: Record<number, Year> = {
    1: Year.FE,
    2: Year.SE,
    3: Year.TE,
    4: Year.BE,
  };

  return {
    department,
    year: yearMap[diff],
  };
}

userSchema.pre("validate", function (next) {
  const user = this as any;

  if (user.email) {
    const { department, year } = inferStudentInfo(user.email);

    if (department) user.department = department;
    if (year) user.year = year;
  }

  next();
});

export const User =
  mongoose.models?.User || mongoose.model<IUser>("User", userSchema);
