import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import client, { db } from '../config/db.js';

const JWT_SECRET = 'your_jwt_secret';

function convertObjectId(obj) {
    if (obj instanceof ObjectId) return obj.toString();
    if (Array.isArray(obj)) return obj.map(convertObjectId);
    if (obj && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) newObj[key] = convertObjectId(obj[key]);
        return newObj;
    }
    return obj;
}

class roomController {

    /**
     * 
     * @param {*} req get userId from query params
     * @param {*} res send room list as response of specific user
     * @returns 
     */
    async getRoomsList(req, res) {
        try {
            const userId = req.query.userId;
            const room_details = await db.collection('rooms').find({ user_id: new ObjectId(userId) }).toArray();
            // console.log('sssssssssssssssssssss', room_details)
            res.json({
                message: "Room list fetched successfully",
                code: 200,
                data: room_details
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // /**
    //  * 
    //  * @param {*} req get room details from body  to create new room 
    //  * @param {*} res send newly created room details as response
    //  */
    // async createRoom(req, res) {
    //     try {
    //         const { userId, roomName, roomType, roomImgIcon } = req.body; 

    //         const createRoon = await db.collection('rooms').insertOne({
    //             user_id: userId, 
    //             room_name: roomName,
    //             room_type: roomType,
    //             image: roomImgIcon
    //         }); 

    //         const roomDetails = await db.collection('rooms').find({ _id: createRoon.insertedId });
    //         res.json({ message: "Room created successfully", code: 200, data: roomDetails });
    //     } catch (err) {
    //         res.status(500).json({ error: err.message });
    //     }
    // }


    /**
 * @param {*} req get room details from body to create new room 
 * @param {*} res send newly created room details as response
 */
    async createRoom(req, res) {
        try {
            const { userId, roomName, roomType, roomImgIcon } = req.body;

            if (!userId || !roomName || !roomType) {
                return res.status(400).json({ error: "userId, roomName, and roomType are required" });
            }

            // Convert to ObjectId if needed
            let objectUserId;
            try {
                objectUserId = new ObjectId(userId);
            } catch (e) {
                return res.status(400).json({ error: "Invalid userId format" });
            }

            let existingRoom;

            if (roomType === 1) {
                // ✅ Private room → check if same user already has private room with same name
                existingRoom = await db.collection("rooms").findOne({
                    user_id: objectUserId,
                    room_name: roomName,
                    room_type: 1,
                });

                if (existingRoom) {
                    return res.json({code : 400, error: "You already have a created room with this name" });
                }
            } else if (roomType === 2) {
                // ✅ Public room → check globally if same name already exists in public
                existingRoom = await db.collection("rooms").findOne({
                    room_name: roomName,
                    room_type: 2,
                });

                if (existingRoom) {
                    return res.status(400).json({ error: "A public room with this name already exists" });
                }
            }

            // ✅ If passes checks → create room
            const createRoom = await db.collection("rooms").insertOne({
                user_id: objectUserId,
                room_name: roomName,
                room_type: roomType,
                image: roomImgIcon,
                created_at: new Date(),
            });

            const roomDetails = await db
                .collection("rooms")
                .findOne({ _id: createRoom.insertedId });

            return res.json({
                message: "Room created successfully",
                code: 200,
                data: roomDetails,
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }


    // GET /get-room-chat
    async getRoomsChats(req, res) {
        res.send('its working');
    }

    // PUT /update-room
    async updateRoom(req, res) {
        try {
            const { roomId, roomName, roomImgIcon } = req.body;
            const updateFields = {};
            if (roomName) updateFields.room_name = roomName;
            if (roomImgIcon) updateFields.image = roomImgIcon;

            if (!Object.keys(updateFields).length) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            const result = await db.collection('rooms').updateOne(
                { _id: new ObjectId(roomId) },
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Room not found' });
            }

            const room = await db.collection('rooms').findOne({ _id: new ObjectId(roomId) });
            res.json({ message: 'Room updated successfully', code: 200, data: convertObjectId(room) });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

}

export default roomController;