import express from 'express';
import roomController from '../../controllers/room_contoller.js';
const roomRoute = express.Router();
const controller = new roomController();

roomRoute.get('/room-list', controller.getRoomsList);
roomRoute.get('/get-room-chat', controller.getRoomsChats);
roomRoute.post('/create-room', controller.createRoom);
roomRoute.post('/creat-room', controller.createRoom); // keep old typo for compatibility
roomRoute.put('/update-room', controller.updateRoom);

export default roomRoute;
