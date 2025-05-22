import { Router } from "express";
import { Matches } from "../Controllers/Matches.controller";
import { authenticateUser } from "../Middlewares/auth.middleware";

const matchesRoutes = Router();

matchesRoutes.get('/nearby/:latitude/:longitude/:category', Matches.getAllMatches);
matchesRoutes.post('/all', Matches.getMatchesByFilter);
matchesRoutes.get('/get/:matchId', Matches.getMatchById);
matchesRoutes.get('/user/:userId', authenticateUser, Matches.getMatchesByUserId);

matchesRoutes.post('/create', authenticateUser, Matches.createNewMatch);
matchesRoutes.post('/request', authenticateUser, Matches.requestToJoinMatch);
matchesRoutes.post('/request/accept', authenticateUser, Matches.acceptMemberInTeam);
matchesRoutes.post('/request/reject', authenticateUser, Matches.rejectMemberInTeam);

matchesRoutes.delete('/delete/:matchId', authenticateUser, Matches.deleteMatch);

export default matchesRoutes;

