import mongoose, { Schema, model } from "mongoose";
import { IUser } from "./user.schema";
import { tenantPlugin } from "@/lib/tenantPlugin";

export enum Department {
  COMPUTER_ENGINEERING = "Computer Engineering",
  INFORMATION_TECHNOLOGY = "Information Technology",
  COMPUTER_SCIENCE_AND_ENGINEERING_AIML = "Computer Science and Engineering (AI & ML)",
  ELECTRONICS_AND_COMPUTER_SCIENCE_ECS = "Electronics and Computer Science (ECS)",
  MECHATRONICS = "Mechatronics",
  ELECTRONICS_AND_TELECOMMUNICATIONS = "Electronics & Telecommunications",
}

export enum Year {
  FE = 1,
  SE = 2,
  TE = 3,
  BE = 4,
}

const userSchema = new Schema<IUser>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: false, // Optional for platform-admin, required for tenant users
      index: true,
    },
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
      enum: ["user", "club-admin", "faculty-coordinator", "super-admin", "platform-admin"],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    adminClub: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    phoneNumber: {
      type: String,
    },
    college: {
      type: String,
      required: false,
    },
    department: {
      type: String,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followingClubs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Club",
      },
    ],
  },
  { timestamps: true },
);

// Apply tenant isolation plugin
userSchema.plugin(tenantPlugin, { required: false });

function inferStudentInfo(email: string) {
  if (!email || !email.endsWith("@pvppcoe.ac.in")) return {};

  const prefix4 = email.substring(0, 4).toLowerCase();
  const prefix3 = email.substring(0, 3).toLowerCase();

  const deptMap: Record<string, Department> = {
    vu1: Department.COMPUTER_ENGINEERING,
    vu2: Department.COMPUTER_SCIENCE_AND_ENGINEERING_AIML,
    vu3: Department.ELECTRONICS_AND_COMPUTER_SCIENCE_ECS,
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

  if (user.email && user.email.endsWith("@pvppcoe.ac.in")) {
    const { department, year } = inferStudentInfo(user.email);

    if (department && (user.department === undefined || user.department === null || user.department === "Not Assigned")) {
      user.department = department;
    }
    if (year && (user.year === undefined || user.year === null)) {
      user.year = year;
    }
    if (!user.college) {
      user.college = "PVPPCOE";
    }
  }

  next();
});

const updateDynamicYear = (doc: any) => {
  if (doc && doc.email && doc.email.endsWith("@pvppcoe.ac.in")) {
    const { year } = inferStudentInfo(doc.email);
    if (year && (doc.year === undefined || doc.year === null)) {
      doc.year = year;
    }
  }
};

userSchema.post(['find', 'findOne', 'findOneAndUpdate'], function (res) {
  if (!res) return;
  if (Array.isArray(res)) {
    res.forEach(updateDynamicYear);
  } else {
    updateDynamicYear(res);
  }
});

userSchema.post('aggregate', function (res) {
  if (!res || !Array.isArray(res)) return;
  res.forEach(updateDynamicYear);
});

// Indexes: email unique per tenant (and globally for users with no tenantId)
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User =
  mongoose.models?.User || mongoose.model<IUser>("User", userSchema);
