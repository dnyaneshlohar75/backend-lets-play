import db from "../Configuration/db.config";
import { kafka } from "../Configuration/kafka.config";


const consumer = kafka.consumer({ groupId: "match-group" });

export const initKafkaConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topics: ["match-notification"] });

    console.log("[INFO] Kafka Consumer Connected & Listening...");
}

export const consumeNotification = async () => {
    try {
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    // Parse the received message
                    const msg = message.value ? JSON.parse(message.value.toString()) : null;

                    if (!msg) {
                        console.warn("[WARNING] Received empty message");
                        return;
                    }

                    console.log(`📩 Received Notification | Topic: ${topic} | Partition: ${partition}`);
                    console.log("[NOTIFICATION SEND TO HOST]:", msg);

                    // Example: Check if notification type is "REQUEST_TO_ADD_IN_TEAM"
                    if (msg?.type === "REQUEST_TO_ADD_IN_TEAM") {
                        console.log("[CONSUMER REQ]")
                        // const userPreferences = await db.userSettings.findMany({
                        //     where: { userId: msg.hostId }
                        // });

                        // userPreferences.forEach(pref => {
                        //     if (pref.name === "inapp" && pref.isEnable) {
                        //         // Send to client (e.g., Redis notification or email)
                        //         console.log(`📢 Sending in-app notification to User ID: ${msg.hostId}`);
                        //     }
                        // });
                    }
                } catch (error) {
                    console.error("[ERROR] Message processing failed:", error);
                }
            }
        });
    } catch (error) {
        console.error("[ERROR] Kafka Consumer Connection Failed:", error);
        setTimeout(consumeNotification, 5000); // Retry after 5 seconds
    }
};

// Handle proper shutdown on SIGINT (Ctrl + C)
process.on("SIGINT", async () => {
    console.log("⚠️ Closing Kafka Consumer...");
    await consumer.disconnect();
    process.exit(0);
});
