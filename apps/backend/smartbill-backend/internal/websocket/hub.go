package websocket

import (
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type WSMessage struct {
	Action   string `json:"action"`
	ItemID   string `json:"item_id,omitempty"`
	MemberID string `json:"member_id,omitempty"`
	Name     string `json:"name,omitempty"`
}
type Hub struct {
	sync.RWMutex
	Rooms map[string]map[*websocket.Conn]bool
}

var WsHub = &Hub{
	Rooms: make(map[string]map[*websocket.Conn]bool),
}

func (h *Hub) Register(roomCode string, conn *websocket.Conn) {
	h.Lock()
	defer h.Unlock()

	if h.Rooms[roomCode] == nil {
		h.Rooms[roomCode] = make(map[*websocket.Conn]bool)
	}
	h.Rooms[roomCode][conn] = true
	log.Printf("User joined room %s. Total users: %d", roomCode, len(h.Rooms[roomCode]))
}

func (h *Hub) Unregister(roomCode string, conn *websocket.Conn) {
	h.Lock()
	defer h.Unlock()

	if _, ok := h.Rooms[roomCode][conn]; ok {
		delete(h.Rooms[roomCode], conn)
		conn.Close()
		log.Printf("User left room %s", roomCode)

		if len(h.Rooms[roomCode]) == 0 {
			delete(h.Rooms, roomCode)
		}
	}
}

func (h *Hub) BroadcastToRoom(roomCode string, message WSMessage) {
	h.RLock()
	defer h.RUnlock()

	if connections, ok := h.Rooms[roomCode]; ok {
		for conn := range connections {
			if err := conn.WriteJSON(message); err != nil {
				log.Printf("Error nyebar pesan: %v", err)
				conn.Close()
				delete(h.Rooms[roomCode], conn)
			}
		}
	}
}
