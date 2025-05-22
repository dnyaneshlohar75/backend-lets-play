import { Request, Response } from "express";
import db from "../Configuration/db.config";
import { $Enums } from "@prisma/client";

import { getDistance } from "geolib";
import { redis } from "../Configuration/redis.config";

function findNearbyMatches(matches: any[], latitude: number, longitude: number) {
  const nearbyMatches = matches
    .map((matches: any) => ({
      ...matches,
      distance: getDistance(
        { latitude: matches.latitude, longitude: matches.longitude },
        { latitude, longitude }
      ),
    }))
    .filter((matches: any) => matches.distance <= 1000)
    .sort((a, b) => a.distance - b.distance);

  return nearbyMatches;
}

const RADIUS_METERS = 1000;

export class Matches {
  static async getAllMatches(request: Request, response: Response) {
    try {
      const userLat = parseFloat(request.params.latitude);
      const userLng = parseFloat(request.params.longitude);
      const category = request.params.category;

      if (isNaN(userLat) || isNaN(userLng)) {
        response.status(400).json({ error: "Invalid latitude or longitude" });
        return;
      }

      const matches = await db.matches.findMany({
        include: {
          ground: true,
        },
        where: {
          ground: {
            latitude: { not: userLat.toString() },
            longitude: { not: userLng.toString() },
          },
          sportType: category as $Enums.sports,
        },
      });

      const nearbyMatches = matches.filter((match) => {
        const lat = parseFloat(match.ground.latitude);
        const lng = parseFloat(match.ground.longitude);

        if (isNaN(lat) || isNaN(lng)) return false;

        const distance = getDistance(
          { latitude: userLat, longitude: userLng },
          { latitude: lat, longitude: lng }
        );

        return distance <= RADIUS_METERS;
      });

      response.json({
        total: nearbyMatches.length,
        matches: nearbyMatches,
      });
    } catch (error) {
      console.error("Error fetching nearby matches:", error);
      response.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async getMatchesByFilter(request: Request, response: Response) {

    const { date, distance, searchQuery, sports, location } = request.body;

    try {
      const filters: any = { date: { gte: new Date() } };

      if (date) filters.date = { gte: new Date(date as string) };

      // if (searchQuery && typeof searchQuery === "string") {
      //   filters.OR = [
      //     { address: { contains: searchQuery, mode: "insensitive" } },
      //     { city: { contains: searchQuery, mode: "insensitive" } },
      //   ];
      // }

      if (sports && sports.length > 0) {
        filters.sportType = { in: sports };
      }

      let matches = await db.matches.findMany({ where: filters, include: { ground: true, teamMembers: true } });

      const finalMatches = matches
        .map((matches) => ({
          ...matches,
          distance: getDistance(
            { latitude: matches.ground.latitude, longitude: matches.ground.longitude },
            { latitude: location?.latitude, longitude: location?.longitude }
          ),
        }))
        .filter((matches) => matches.distance >= distance[0] && matches.distance <= distance[1])
        .sort((a, b) => a.distance - b.distance);

      const sportsGroup = Array.from(new Set(finalMatches.map((m) => m.sportType)));


      response.status(200).json({
        success: true,
        matches: finalMatches,
        sportsGroup,
      });
    } catch (error) {
      console.error("Match filtering error:", error);
      response.status(500).json({
        success: false,
        message: "Server error while fetching matches.",
      });
    }
  }

  static async getMatchesByUserId(request: Request, response: Response) {
    const { userId } = request.params;

    try {
      const matches = await db.matches.findMany({
        include: {
          ground: true,
          user: true,
          teamMembers: {
            include: {
              user: true,
            },
          },
          pendingRequests: true,
        },
        where: {
          hostId: userId,
        },
      });

      const enrichedMatches = await Promise.all(
        matches.map(async (match) => {
          const teamUsers = match.teamMembers.map((member) => member.user);

          const pendingUserIds = match.pendingRequests.map((req) => req.userId);

          const pendingUsers = await db.user.findMany({
            where: {
              userId: {
                in: pendingUserIds,
              },
            },
          });

          const groundBookingDetails = await db.groundBooking.findFirst({
            where: {
              groundId: match?.groundId,
              matchId: match?.matchId,
            },
          });

          return {
            ...match,
            teamMembers: teamUsers,
            pendingRequests: pendingUsers,
            groundBookingDetails,
          };
        })
      );

      response.status(200).json({
        success: true,
        matches: enrichedMatches,
      });
    } catch (error) {
      console.error("Error retrieving matches", error);
      response
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  }

  static async getMatchById(request: Request, response: Response) {
    const { matchId } = request.params;

    try {
      const match = await db.matches.findUnique({
        where: { matchId },
        include: {
          ground: true,
          user: true,
          teamMembers: {
            include: {
              user: true,
            },
          },
          pendingRequests: true,
        },
      });

      const groundBookingDetails = await db.groundBooking.findFirst({
        where: {
          groundId: match?.groundId,
          matchId: match?.matchId,
        },
      });

      const teamMembers = match?.teamMembers.map((member) => member.user);
      const requestedUsers = match?.pendingRequests.map((req) => req.userId);

      if (!match) {
        response.status(404).json({ success: false, error: "Match not found" });
      }

      response.status(200).json({
        success: true,
        match: {
          ...match,
          teamMembers: teamMembers,
          pendingRequests: requestedUsers,
          groundBookingDetails: groundBookingDetails,
        },
      });
    } catch (error) {
      console.error("Get match error", error);
      response
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  }

  static async createNewMatch(request: Request, response: Response) {
    const { name, description, sportType, date, groundId, hostId, bookingId } =
      request.body;

    try {
      const createdMatch = await db.matches.create({
        data: {
          name,
          description,
          sportType,
          date: new Date(date),
          groundId,
          hostId,
          teamMembers: { create: { userId: hostId, isHost: true } },
        },
        include: {
          ground: true,
          user: true,
          teamMembers: true,
        },
      });

      const updateGroundBookingTableStatus = await db.groundBooking.update({
        where: {
          bookingId,
        },
        data: {
          matchId: createdMatch.matchId,
        },
      });

      // await redis.set(`match:${createdMatch.matchId}`, JSON.stringify(createdMatch));
      // await redis.del(`match:${createdMatch.matchId}:pendingRequests`);
      // await redis.del(`match:${createdMatch.matchId}:teamMembers`);
      // await redis.sadd(`match:${createdMatch.matchId}:pendingRequests`, JSON.stringify([]));
      // await redis.sadd(`match:${createdMatch.matchId}:teamMembers`, JSON.stringify([]));

      response.status(201).json({ success: true, match: createdMatch });
    } catch (error) {
      console.error("Create match error", error);
      response
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  }

  static async deleteMatch(request: Request, response: Response) {
    const { matchId } = request.params;

    try {
      const deletedMatch = await db.matches.delete({
        where: { matchId },
      });

      if (!deletedMatch) {
        response.status(404).json({ success: false, error: "Match not found" });
      }

      response
        .status(200)
        .json({ success: true, message: "Match deleted successfully" });
    } catch (error) {
      console.error("Delete match error", error);
      response
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  }

  static async requestToJoinMatch(request: Request, response: Response) {
    const { matchId, userId } = request.body;

    try {
      const existingRequest = await db.pendingRequests.findFirst({
        where: {
          matchId,
          userId,
        },
      });

      if (existingRequest) {
        response
          .status(400)
          .json({
            success: false,
            message: "Already requested to join this match",
          });
        return;
      }

      const newRequest = await db.pendingRequests.create({
        data: { matchId, userId },
      });

      // await redis.sadd(`match:${matchId}:pendingRequests`, JSON.stringify(newRequest));

      response.status(201).json({ success: true });
    } catch (error) {
      console.error("Request to join match error", error);
      response
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  }

  static async acceptMemberInTeam(request: Request, response: Response) {
    const { matchId, userId } = request.body;

    try {
      const existingRequest = await db.pendingRequests.findFirst({
        where: {
          AND: [{ userId }, { matchId }],
        },
      });

      if (!existingRequest) {
        response
          .status(400)
          .json({ success: false, message: "No request found to accept" });
        return;
      }

      await db.pendingRequests.delete({
        where: {
          matchId_userId: {
            matchId,
            userId,
          },
        },
      });

      const newMember = await db.teamMembers.create({
        data: { matchId, userId },
      });

      // await redis.srem(`match:${matchId}:pendingRequests`, JSON.stringify(existingRequest));
      // await redis.sadd(`match:${matchId}:teamMembers`, JSON.stringify(newMember));

      response.status(200).json({ success: true });
    } catch (error) {
      console.error("Accept member error", error);
      response
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  }

  static async rejectMemberInTeam(request: Request, response: Response) {
    const { matchId, userId } = request.body;

    try {
      const existingRequest = await db.pendingRequests.findFirst({
        where: {
          matchId,
          userId,
        },
      });

      if (!existingRequest) {
        response
          .status(400)
          .json({ success: false, message: "No request found to reject" });
        return;
      }

      await db.pendingRequests.delete({
        where: {
          matchId_userId: {
            matchId,
            userId,
          },
        },
      });

      // await redis.srem(`match:${matchId}:pendingRequests`, JSON.stringify(existingRequest));

      response.status(200).json({ success: true });
    } catch (error) {
      console.error("Reject member error", error);
      response
        .status(500)
        .json({ success: false, error: "Something went wrong" });
    }
  }

  static async removeMatch(request: Request, response: Response) { }
  static async addTeamMember(request: Request, response: Response) { }
  static async removeTeamMember(request: Request, response: Response) { }
}
