import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Club, User } from "@/models";
import { sendMail } from "@/services/sendMail";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDb();

    const allEvents = await Event.find({})
      .populate("participants")
      .populate("registrations")
      .populate("organizingClub");
    return NextResponse.json(allEvents, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectToDb();
    const formData = await req.formData();

    const organizingClub = formData.get("organizingClub") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const eventType = formData.get("eventType") as string;
    const teamSize = formData.get("teamSize") as string | null;
    const prize = formData.get("prize") as string | null;
    const providesCertificate = formData.get("providesCertificate") === "true";
    const registrationFee = formData.get("registrationFee") as string | null;

    const file = formData.get("image") as unknown as File | null;
    let imageUrl = "";

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    // Create the event (default teamSize = 1 if not provided)
    const event = await Event.create({
      organizingClub,
      name,
      description,
      date,
      eventType,
      teamSize: teamSize ? Number(teamSize) : 1,
      prize: prize ? Number(prize) : undefined,
      providesCertificate,
      registrationFee: registrationFee ? Number(registrationFee) : 0,
      image: imageUrl,
    });

    // Update club's events array
    await Club.findByIdAndUpdate(organizingClub, {
      $push: { events: event._id },
    });

    //  Fetch all users
    const users = await User.find({}, "email");
    const emails = users.map((u) => u.email);

    //  Send announcement email
    if (emails.length > 0) {
      const subject = `🎉 New Event: ${event.name}`;
      const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; border:1px solid #eee; border-radius:10px; overflow:hidden;">
        <!-- Header -->
        <div style="background:#5E77F5; color:white; padding:20px; text-align:center;">
          <h1 style="margin:0; font-size:24px;">🎉 New Event Alert!</h1>
        </div>

        <!-- Event Image -->
        ${
          event.image
            ? `
          <img src="${event.image}" alt="${event.name}" style="width:100%; max-height:250px; object-fit:cover;">
        `
            : ""
        }

        <!-- Content -->
        <div style="padding:20px;">
          <h2 style="color:#5E77F5; margin-top:0;">${event.name}</h2>
          <p style="font-size:15px; color:#555;">${event.description}</p>

          <table style="width:100%; margin:20px 0; font-size:14px; color:#444;">
            <tr>
              <td><b>📅 Date:</b></td>
              <td>${event.date}</td>
            </tr>
            <tr>
              <td><b>🏛️ Organized by:</b></td>
              <td>${organizingClub}</td>
            </tr>
            <tr>
              <td><b>🏆 Prize:</b></td>
              <td>${event.prize ? `₹${event.prize}` : "—"}</td>
            </tr>
            <tr>
              <td><b>📜 Certificate:</b></td>
              <td>${event.providesCertificate ? "Yes ✅" : "No ❌"}</td>
            </tr>
            <tr>
              <td><b>💰 Fee:</b></td>
              <td>${
                event.registrationFee && event.registrationFee > 0
                  ? `₹${event.registrationFee}`
                  : "Free"
              }</td>
            </tr>
          </table>

          <div style="text-align:center; margin:30px 0;">
            <a href="https://clubly-vppcoe.vercel.app/events/${event._id}" 
              style="background:#5E77F5; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-size:16px; display:inline-block;">
              🔗 View Event & Register
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9f9f9; color:#777; font-size:12px; padding:15px; text-align:center;">
          <p style="margin:0;">You are receiving this email because you are a member of <b>Clubly</b>.</p>
          <p style="margin:5px 0 0;">© ${new Date().getFullYear()} Clubly. All rights reserved.</p>
        </div>
      </div>
`;
      await sendMail(emails, subject, html);
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
};
