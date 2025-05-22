import { getDistance } from "geolib";
import db from "../Configuration/db.config";
import { Request, Response } from "express";
import razorpay from '../Configuration/razorpay.config';


export class Ground {
    static async getAllGrounds(request: Request, response: Response) {
        const { skip, take, latitude, longitude } = request.params;

        try {
            const grounds = await db.ground.findMany({
                skip: parseInt(skip) || 0, take: parseInt(take) || 10
            });

            const nearbyGrounds = grounds
                .map(ground => ({
                    ...ground,
                    distance: getDistance(
                        { latitude: ground.latitude, longitude: ground.longitude },
                        { latitude, longitude }
                    )
                }))
                .filter(ground => ground.distance <= 1000)
                .sort((a, b) => a.distance - b.distance);


            if (nearbyGrounds.length == 0) {
                response.json({
                    message: "No ground founds near to the location",
                    grounds: nearbyGrounds
                })
                return;
            }

            response.json({
                message: "Grounds fetched",
                grounds: nearbyGrounds
            })
        } catch (error) {
            console.error('Error fetching nearby grounds:', error);
            response.json({ error: 'Internal Server Error' });
        }
    }

    static async getGroundById(request: Request, response: Response) {
        const { groundId } = request.params;

        if (!groundId) {
            response.json({ message: "ground id required" })
            return;
        }

        try {
            const groundById = await db.ground.findFirst({
                where: { groundId },
                include: { groundRating: true, groundCourts: true }
            });

            response.json({
                message: "Ground fetched",
                ground: groundById
            })
        } catch (error) {
            console.error('Error fetching ground by id:', error);
            response.json({ error: 'Internal Server Error' });
        }
    }

    static async getGroundBySportType(request: Request, response: Response) {
        const { sportType, latitude, longitude } = request.params;

        if (!sportType) {
            response.json({ message: "sport type required" })
            return;
        }

        try {
            const grounds = await db.ground.findMany({
                include: { groundRating: true, groundCourts: true }
            });

            const nearbyGrounds = grounds
                .map(ground => ({
                    ...ground,
                    distance: getDistance(
                        { latitude: ground.latitude, longitude: ground.longitude },
                        { latitude, longitude }
                    )
                }))
                .filter(ground => ground.distance <= 1000)
                // .filter(ground => ground.groundCourts.filter((court) => court.sportType == sportType).length > 0)
                .sort((a, b) => a.distance - b.distance);

            response.json({
                message: "Grounds fetched",
                grounds: nearbyGrounds
            })
        } catch (error) {
            console.error('Error fetching ground by sport type:', error);
            response.json({ error: 'Internal Server Error' });
        }
    }

    static async getCourtAvailability(request: Request, response: Response) {
        const { date, courtId } = request.body;

        if (!date || !courtId) {
            response.json({ message: "court id and date required", isAvailable: false });
            return;
        }

        try {
            const court = await db.groundBooking.findFirst({
                where: {
                    courtId,
                    dateForPlay: new Date(date)
                }
            });

            if (court) {
                response.json({
                    message: "Court is not available",
                    isAvailable: false
                })
                return;
            }

            response.json({
                message: "Court is available",
                isAvailable: true
            });

        } catch (error) {
            console.error('Error fetching ground by sport type:', error);
            response.json({ error: 'Internal Server Error' });
        }
    }

    static async bookCourt(request: Request, response: Response) {
        const { userId, groundId, groundCourtId, date, startTime, endTime, duration, price } = request.body;

        try {
            razorpay.orders.create({
                amount: price * 100,
                currency: "INR",
                receipt: `receipt#${groundId}`,
                notes: {
                    groundId,
                    groundCourtId,
                    date,
                    startTime,
                    endTime
                }
            }).then(async (order: any) => {
                response.json({
                    message: "Court booked successfully",
                    order
                });
            }).catch((error) => {
                console.error('Error creating Razorpay order:', error);
                response.json({ error: 'Internal Server Error' });
            });

        } catch (error) {
            console.error('Error booking court:', error);
            response.json({ error: 'Internal Server Error' });
            return;
        }
    }

    static async savePaymentDetailsInDB(request: Request, response: Response) {
        const { paymentId, orderId, signature, userId, groundId, groundCourtId, noOfPlayers, date, startTime, endTime, duration, price } = request.body;

        if (!paymentId || !orderId || !signature) {
            response.json({ message: "payment id, order id and signature required" });
            return;
        }

        try {
            const payment = await db.groundBooking.create({
                data: {
                    bookBy: userId,
                    groundId,
                    courtId: groundCourtId,
                    dateForPlay: new Date(date),
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    bookingCost: price,
                    numberOfPlayers: parseInt(noOfPlayers),
                    duration,
                    razorpay_order_id: orderId,
                    razorpay_payment_id: paymentId,
                    razorpay_signature: signature
                }
            });

            response.json({
                success: true,
                message: "Payment details saved successfully",
                payment,
            });

        } catch (error) {
            console.error('Error saving payment details:', error);
            response.json({ error: 'Internal Server Error' });
        }
    }

}