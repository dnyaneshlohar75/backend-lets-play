import { Partitioners } from "kafkajs";
import { kafka } from "../Configuration/kafka.config";
import { Notification } from "../types/types";

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});

export const initializeProducer = async () => {
    try {
        await producer.connect();
        console.log("[INFO] Kafka Producer Connected");
    } catch (error) {
        console.error("[ERROR] Failed to connect Kafka Producer:", error);
    }
};

export const sendNotification = async (topic: string, notification: Notification) => {
    try {
        if (!producer) throw new Error("Producer is not initialized");

        await producer.send({
            topic,
            messages: [{ key: notification.id.toString(), value: JSON.stringify(notification) }],
        });

        console.log(`[INFO] Message sent to topic "${topic}":`, notification.id);
    } catch (error) {
        console.error("[ERROR] Kafka Producer error:", error);
    }
};

process.on("SIGINT", async () => {
    await producer.disconnect();
    console.log("⚠️ Kafka Producer Disconnected");
    process.exit(0);
});

initializeProducer();
