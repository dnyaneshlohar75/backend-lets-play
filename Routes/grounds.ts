import { Router } from "express";
import { Ground } from "../Controllers/Ground.controller";
import { authenticateUser } from "../Middlewares/auth.middleware";

const groundRoutes = Router();

groundRoutes.get('/all/:latitude/:longitude/:skip?/:take?', Ground.getAllGrounds);
groundRoutes.get('/:groundId', Ground.getGroundById);
groundRoutes.get('/sport/:sportType/:latitude/:longitude', Ground.getGroundBySportType);

groundRoutes.post('/court/availability', Ground.getCourtAvailability);
groundRoutes.post('/court/book', authenticateUser, Ground.bookCourt);
groundRoutes.post('/court/book/save', authenticateUser, Ground.savePaymentDetailsInDB);

export default groundRoutes;

