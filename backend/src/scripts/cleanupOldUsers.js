import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import dotenv from "dotenv";

dotenv.config();

const cleanupInactiveUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const allUsers = await User.find({ createdAt: { $lt: twoMonthsAgo } });
    let deletedCount = 0;

    for (const user of allUsers) {
      const hasSentMessages = await Message.exists({ senderId: user._id });
      const hasReceivedMessages = await Message.exists({ receiverId: user._id });
      
      if (!hasSentMessages && !hasReceivedMessages) {
        await User.deleteOne({ _id: user._id });
        deletedCount++;
        console.log(`Deleted inactive user: ${user.email}`);
      }
    }

    console.log(`\nTotal deleted: ${deletedCount} inactive users older than 2 months`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

cleanupInactiveUsers();
