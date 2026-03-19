package routes

import (
	"smartbill-backend/internal/handlers"
	"smartbill-backend/internal/middleware"

	fiberws "github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api/v1")

	// Public Routes (Gak butuh login)
	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)

	// Endpoint Scan Struk
	api.Post("/scan", middleware.Protected(), handlers.ProcessReceipt)

	// Health Check
	api.Get("/health", middleware.Protected(), func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// Rute untuk Room Management
	api.Get("/rooms/:roomCode", handlers.GetRoomByCode)
	api.Post("/rooms", handlers.CreateRoom)
	api.Post("/rooms/:roomCode/join", handlers.JoinRoom)

	app.Use("/ws", func(c *fiber.Ctx) error {
		if fiberws.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/room/:roomCode", fiberws.New(handlers.LiveSplitHandler))
}
