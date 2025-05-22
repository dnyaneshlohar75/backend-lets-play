import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { redis } from "../Configuration/redis.config";
import db from "../Configuration/db.config";

export function setupSocketIO(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    path: "/match",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const connectedUsers = new Map<string, string>();

  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("request-to-join", async ({ matchId, userId, hostId }) => {
      const timestamp = Date.now();
      const user = await db.user.findFirst({ where: { userId } });
      const match = await db.matches.findFirst({ where: { matchId } });

      const existingRequest = await db.pendingRequests.findFirst({
        where: { matchId, userId }
      });

      if (existingRequest) {
        socket.emit("info", { message: "Already requested to join.", isInMatch: true });
        return;
      }

      await db.pendingRequests.create({ data: { matchId, userId } });

      const notification = {
        id: `notif_${timestamp}`,
        match,
        user,
        type: "REQUEST_TO_JOIN",
        message: `${user?.name} requested to join match ${match?.name}`,
        timestamp,
        read: false,
      };

      console.log(`${user?.name} requested to join match ${match?.name}`);

      await redis.zadd(`notifications:${hostId}`, timestamp, JSON.stringify(notification));

      const hostSocketId = connectedUsers.get(hostId);

      if (hostSocketId) {
        io.to(hostSocketId).emit("match-join-request", notification);
      }
    });

    socket.on("accept-request", async ({ matchId, userId, hostId }) => {
      try {
        const user = await db.user.findFirst({ where: { userId } });
        const match = await db.matches.findFirst({ where: { matchId } });

        const existingRequest = await db.pendingRequests.findFirst({
          where: {
            AND: [{ userId }, { matchId }],
          },
        });

        if (!existingRequest) {
          socket.emit("info", { message: "Request not found.", isInMatch: false });
          return;
        }

        await db.pendingRequests.delete({
          where: {
            matchId_userId: { matchId, userId }
          },
        });

        await db.teamMembers.create({
          data: { matchId, userId },
        });

        const notification = {
          id: `notif_${Date.now()}`,
          match,
          user,
          type: "REQUEST_ACCEPTED",
          message: `You have been accepted in match ${match?.name}`,
          timestamp: Date.now(),
          read: false,
        };

        await redis.zadd(`notifications:${userId}`, notification.timestamp, JSON.stringify(notification));
        socket.emit("info", { message: "Request accepted.", isInMatch: true });

        // socket.to()
        const hostSocketId = connectedUsers.get(hostId);

        if (hostSocketId) {
          io.to(hostSocketId).emit("new_team_data", notification);
        }

      } catch (error) {
        console.error("Error accepting request:", error);
        socket.emit("info", { message: "Error accepting request.", isInMatch: false });
        return;
      }
    });

    socket.on("reject-request", async ({ matchId, userId, hostId }) => {
      const user = await db.user.findFirst({ where: { userId } });
      const match = await db.matches.findFirst({ where: { matchId } });

      try {
        const existingRequest = await db.pendingRequests.findFirst({
          where: {
            AND: [{ userId }, { matchId }],
          },
        });

        if (!existingRequest) {
          socket.emit("info", { message: "Request not found.", isInMatch: false });
          return;
        }

        await db.pendingRequests.delete({
          where: {
            matchId_userId: { matchId, userId }
          },
        });

        const notification = {
          id: `notif_${Date.now()}`,
          match,
          user,
          type: "REQUEST_REJECTED",
          message: `You have been rejected from match ${match?.name}`,
          timestamp: Date.now(),
          read: false,
        };

        await redis.zadd(`notifications:${userId}`, notification.timestamp, JSON.stringify(notification));
        socket.emit("info", { message: "Request rejected.", isInMatch: false });

        console.log("Request rejected:", notification);

      } catch (error) {
        console.error("Error rejecting request:", error);
        socket.emit("info", { message: "Error rejecting request.", isInMatch: false });
        return;
      }
    });

    socket.on("get-notifications", async ({ userId, limit = 10 }) => {
      const results = await redis.zrevrange(`notifications:${userId}`, 0, limit - 1);

      const notifications = results?.map((item) => JSON.parse(item));
      socket.emit("notifications", notifications);
    });

    socket.on("notfication_all_read", async ({ userId }) => {
      const results = await redis.zrevrange(`notifications:${userId}`, 0, -1);

      const notifications = results?.map((item) => JSON.parse(item));
      socket.emit("notifications", notifications);

      await redis.del(`notifications:${userId}`);
    });

    socket.on("disconnect", () => {
      for (const [key, value] of connectedUsers.entries()) {
        if (value === socket.id) connectedUsers.delete(key);
      }

    });

    return io;
  })
};
