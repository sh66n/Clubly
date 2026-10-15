import { connectToDb } from "@/lib/connectToDb";
import { Club, User } from "@/models";
import mongoose from "mongoose";

export interface StudentSocialStats {
  followersCount: number;
  followingCount: number;
  followingClubsCount: number;
  isFollowingByViewer: boolean;
  followingClubs: {
    _id: string;
    name: string;
    fullName?: string;
    logo?: string;
    department?: string;
  }[];
  followersList: {
    _id: string;
    name: string;
    image?: string;
    department?: string;
  }[];
  followingList: {
    _id: string;
    name: string;
    image?: string;
    department?: string;
  }[];
}

export async function getUserSocialNetwork(
  targetUserId: string,
  viewerUserId?: string,
): Promise<StudentSocialStats> {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return {
      followersCount: 0,
      followingCount: 0,
      followingClubsCount: 0,
      isFollowingByViewer: false,
      followingClubs: [],
      followersList: [],
      followingList: [],
    };
  }

  await connectToDb();
  const targetObjId = new mongoose.Types.ObjectId(targetUserId);

  let userDoc: any = null;
  let followedClubs: any[] = [];

  try {
    [userDoc, followedClubs] = await Promise.all([
      User.findById(targetObjId)
        .populate({ path: "followers", select: "_id name image department", strictPopulate: false })
        .populate({ path: "following", select: "_id name image department", strictPopulate: false })
        .populate({ path: "followingClubs", select: "_id name fullName logo department", strictPopulate: false })
        .lean(),
      Club.find({ followers: targetObjId }, "_id name fullName logo department").lean(),
    ]);
  } catch (queryErr) {
    console.error("Error querying social network, falling back to base user:", queryErr);
    userDoc = await User.findById(targetObjId).lean();
    followedClubs = await Club.find({ followers: targetObjId }, "_id name fullName logo department").lean();
  }

  if (!userDoc) {
    return {
      followersCount: 0,
      followingCount: 0,
      followingClubsCount: 0,
      isFollowingByViewer: false,
      followingClubs: [],
      followersList: [],
      followingList: [],
    };
  }

  // Merge direct followingClubs array and Club.followers reverse lookup
  const clubMap = new Map<string, any>();
  if (Array.isArray(userDoc.followingClubs)) {
    userDoc.followingClubs.forEach((c: any) => {
      if (c && c._id) clubMap.set(c._id.toString(), c);
    });
  }
  if (Array.isArray(followedClubs)) {
    followedClubs.forEach((c: any) => {
      if (c && c._id) clubMap.set(c._id.toString(), c);
    });
  }

  const followingClubs = Array.from(clubMap.values()).map((c) => ({
    _id: c._id.toString(),
    name: c.name || "Club",
    fullName: c.fullName,
    logo: c.logo,
    department: c.department,
  }));

  const followersList = ((userDoc.followers as any[]) || []).map((u) => ({
    _id: u._id.toString(),
    name: u.name || "Student",
    image: u.image,
    department: u.department,
  }));

  const followingList = ((userDoc.following as any[]) || []).map((u) => ({
    _id: u._id.toString(),
    name: u.name || "Student",
    image: u.image,
    department: u.department,
  }));

  const isFollowingByViewer = viewerUserId
    ? followersList.some((f) => f._id === viewerUserId)
    : false;

  return {
    followersCount: followersList.length,
    followingCount: followingList.length,
    followingClubsCount: followingClubs.length,
    isFollowingByViewer,
    followingClubs,
    followersList,
    followingList,
  };
}
