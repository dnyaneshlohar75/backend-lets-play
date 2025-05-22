import { Request, Response } from "express";
import db from "../Configuration/db.config";

export class User {
    static async getUserDetailsById(request: Request, response: Response) {
        const { userId } = request.params;

        try {
            let user = await db.user.findFirst({
                where: { userId },
                include: { userSettings: true, matches: true }
            });

            response.json({ error: "", message: "getUserById route", user }).status(200);
        } catch (error) {
            response.json({ error: error, message: "Something went wrong" }).status(500);
            return;
        }
    }

    static async uploadProfileImage(request: Request, response: Response) {
        const { imageUrl } = request.body;
        const { userId } = request.params;

        try {
            const imageEntry = await db.user.update({
                data: { profileImageUrl: imageUrl },
                where: { userId }
            });

            response.status(201).json({ message: "Image uploaded successfully", imageEntry });
            return;
        } catch (error) {
            console.error("Upload error:", error);
            response.status(500).json({ error: "Internal Server Error" });
            return;
        }
    }

    static async updateUserDetails(request: Request, response: Response) {
        const { userId } = request.params;
        const { firstName, lastName, emailAddress, mobileNumber, gender } = request.body;

        try {
            let isExist = await db.user.findFirst({
                where: { userId },
                include: { userSettings: true, matches: true }
            });

            if(!isExist) {
                response.json({ error: "User not found", isUpadate: false, message: "getUserById route" }).status(404);
                return;    
            }

            const user = await db.user.update({
                where: { userId },
                data: {
                    name: firstName+" "+lastName,
                    emailAddress,
                    mobileNumber,
                    gender
                }
            });

            response.json({isUpdate: true, message: "upadteUserById route", user }).status(200);
        } catch (error) {
            response.json({ error: error, isUpdate: false, message: "Something went wrong" }).status(500);
            console.log("[ERROR]:", error);
            return;
        }
    }

    static async getUserSettings(request: Request, response: Response) {
        const { userId } = request.params;

        try {
            let userSettings = await db.userSettings.findFirst({
                where: { userId },
                include: { user: true }
            });

            response.json({message: "getUserSettings route", userSettings }).status(200);
        } catch (error) {
            response.json({ error: error, message: "Something went wrong" }).status(500);
            return;
        }
    }

    static async updateUserSettings(request: Request, response: Response) {
        const { userId } = request.params;
        const { isEmailService, isLocationService, isNotificationService } = request.body;

        try {
            let isExist = await db.user.findFirst({
                where: { userId },
                include: { userSettings: true, matches: true }
            });

            if(!isExist) {
                response.json({ error: "User not found", isUpadate: false, message: "getUserById route" }).status(404);
                return;    
            }

            const userSettings = await db.userSettings.update({
                where: { userId },
                data: {
                    emailService: isEmailService,
                    locationService: isLocationService,
                    notificationService: isNotificationService
                }
            });

            response.json({isUpdate: true, message: "upadteUserById route", userSettings }).status(200);
        } catch (error) {
            response.json({ error: error, isUpdate: false, message: "Something went wrong" }).status(500);
            console.log("[ERROR]:", error);
            return;
        }
    }
}