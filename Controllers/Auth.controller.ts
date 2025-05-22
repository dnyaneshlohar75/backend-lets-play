import { Request, Response } from "express";
import db from "../Configuration/db.config";

import bcrypt from 'bcrypt'
import { generateToken } from "../utils/auth";

export async function login(req: Request, res: Response) {
    try {
        const { username, password } = req.body;

        const isUserExist = await db.user.findFirst({
            where: {
                OR: [{ emailAddress: username }, { username }],
            }
        });


        if (isUserExist && bcrypt.compareSync(password, isUserExist?.password as string)) {
            const token = generateToken(username);
            res.json({ message: "User logged in", token, user: isUserExist }).status(200);
            return;
        }

        res.json({ message: "User is not registeted" }).status(200);
    } catch (error) {
        res.json({ message: "Something went wrong", error: (error instanceof Error) && error?.message }).status(500);
    }
}

export async function createNewAccount(req: Request, res: Response) {
    try {
        const { name, username, emailId, password } = req.body;

        const isUserExist = await db.user.findFirst({
            where: { emailAddress: emailId }
        });

        console.log(isUserExist);

        if (isUserExist) {
            res.json({ message: "User is already registered.." }).status(200);
            return;
        }

        const encryptedPassword = bcrypt.hashSync(password, 18);

        await db.user.create({
            data: {
                username,
                emailAddress: emailId,
                password: encryptedPassword,
                name,
                profileImageUrl: ""
            }
        })

        res.json({ message: "User is created" }).status(200);
    } catch (error) {
        res.json({ message: "Something went wrong", error: (error instanceof Error) && error?.message }).status(500);
    }
}