const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/rooms-chat.controller")


router.get("/", controller.index);

router.get("/create", controller.createRoom);

router.post("/create", controller.createRoomPost);


module.exports = router;