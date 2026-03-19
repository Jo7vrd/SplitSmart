package handlers

import (
	"log"
	"smartbill-backend/internal/services"
	"smartbill-backend/internal/websocket"

	fiberws "github.com/gofiber/contrib/websocket"
)

func LiveSplitHandler(c *fiberws.Conn) {
	roomCode := c.Params("roomCode")

	websocket.WsHub.Register(roomCode, c)
	defer websocket.WsHub.Unregister(roomCode, c)

	for {
		var msg websocket.WSMessage

		if err := c.ReadJSON(&msg); err != nil {
			log.Println("Koneksi terputus:", err)
			break
		}
		err := services.ProcessLiveAction(msg)
		if err != nil {
			continue
		}

		websocket.WsHub.BroadcastToRoom(roomCode, msg)
	}
}
