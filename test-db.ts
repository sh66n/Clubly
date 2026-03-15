import mongoose from "mongoose";

const uri = "mongodb+srv://shaanedroos85:bY0HuveHYKBT0znA@cluster0.hxlohpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Define schemas inline to avoid dependency issues in the script
const paymentSchema = new mongoose.Schema({
  razorpayOrderId: String,
  userId: mongoose.Types.ObjectId,
  eventId: mongoose.Types.ObjectId,
  groupId: mongoose.Types.ObjectId,
  status: String,
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  name: String,
  groupRegistrations: [mongoose.Types.ObjectId],
  participantGroups: [mongoose.Types.ObjectId],
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

async function main() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  
  const recentPayments = await Payment.find({ 
    groupId: { $exists: true, $ne: null }, 
    status: "paid" 
  }).sort({ createdAt: -1 });

  console.log(`Checking ${recentPayments.length} paid team payments for all events...`);

  let bugsFound = 0;
  for (const p of recentPayments) {
    const event = await Event.findById(p.eventId);
    if (!event) {
        // console.log(`Payment ${p._id}: Event ${p.eventId} not found`);
        continue;
    }

    const isRegistered = event.groupRegistrations.some((id: any) => id.toString() === p.groupId.toString());
    
    if (!isRegistered) {
      bugsFound++;
      console.log(`\nBUG FOUND!`);
      console.log(`Payment ID: ${p._id}`);
      console.log(`Event: ${event.name} (${event._id})`);
      console.log(`Group ID: ${p.groupId}`);
      console.log(`Created At: ${p.createdAt}`);
      
      const isParticipant = event.participantGroups?.some((id: any) => id.toString() === p.groupId.toString());
      console.log(`Is in participantGroups? ${isParticipant}`);
    }
  }
  
  console.log(`\nScan complete. ${bugsFound} issues found.`);
  process.exit(0);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
