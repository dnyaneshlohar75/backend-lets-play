import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: "match-service",
    brokers: ["localhost:9092"]
});

// async function init() {
//     const admin = kafka.admin();
    
//     try {
//         await admin.connect();
//         console.log("[INFO] Kafka admin connected");

//         const result = await admin.createTopics({
//             topics: [{ topic: "match-notification", numPartitions: 1, replicationFactor: 1 }]
//         });

//         if (result) {
//             console.log("[SUCCESS] Topic 'match-notification' created successfully!");
//         } else {
//             console.log("[INFO] Topic already exists or was not created.");
//         }

//     } catch (error) {
//         console.error("[ERROR] Failed to create topic:", error);
//     } finally {
//         await admin.disconnect();
//         console.log("[INFO] Kafka admin disconnected");
//     }
// };

// init();