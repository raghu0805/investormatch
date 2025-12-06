import cron from "node-cron";
import Message from "../models/Message.js";

// Runs once every midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Deleting old messages...");

  await Message.deleteMany({
    createdAt: { 
      $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
    }
  });

  console.log("Old messages deleted");
});
