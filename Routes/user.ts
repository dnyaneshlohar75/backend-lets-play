import { Router } from "express";
import { login, createNewAccount } from "../Controllers/Auth.controller";
import { User } from "../Controllers/User.controller";
import { authenticateUser } from "../Middlewares/auth.middleware";

const userRoutes = Router();

/* AUTH ROUTES */
userRoutes.post("/auth/login", login);
userRoutes.post("/auth/register", createNewAccount);

/* USER ROUTES */
userRoutes.get('/:userId', authenticateUser, User.getUserDetailsById);
userRoutes.get('/:userId/settings', authenticateUser, User.getUserSettings);
userRoutes.put('/:userId/settings', authenticateUser, User.updateUserSettings);

userRoutes.post('/:userId/upload/profile_img', authenticateUser, User.uploadProfileImage);
userRoutes.put('/:userId/update', authenticateUser, User.updateUserDetails);

export default userRoutes;