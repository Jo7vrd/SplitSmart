package handlers

import (
	"math/rand"
	"smartbill-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

var AvatarColors = []string{
	"#C9963A", // amber
	"#3A7BD5", // blue
	"#2D6A4F", // green
	"#A0522D", // sienna/brown
	"#7B5EA7", // purple
	"#C0392B", // red
	"#1A7A7A", // teal
	"#D4627A", // rose
}

func assignColor(memberCount int) string {
	return AvatarColors[memberCount%len(AvatarColors)]
}

func generateRoomCode() string {
	var letters = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	b := make([]rune, 6)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func CreateRoom(c *fiber.Ctx) error {
	userIDVal := c.Locals("user_id")
	if userIDVal == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	hostIDString := userIDVal.(string)
	hostUUID, err := uuid.Parse(hostIDString)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Format User ID di token salah"})
	}

	var hostUser models.User
	if err := models.DB.Select("name").Where("id = ?", hostUUID).First(&hostUser).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Akun host tidak ditemukan"})
	}

	type CreateRoomReq struct {
		MerchantName string  `json:"merchant_name"`
		TotalAmount  float64 `json:"total_amount"`
		TaxAmount    float64 `json:"tax_amount"`
	}
	var req CreateRoomReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Format data salah"})
	}

	roomCode := generateRoomCode()

	newRoom := models.Transaction{
		HostID:        hostUUID,
		RoomCode:      roomCode,
		MerchantName:  req.MerchantName,
		GrandTotal:    req.TotalAmount,
		TaxAndService: req.TaxAmount,
		Status:        "splitting",
	}

	if err := models.DB.Create(&newRoom).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Gagal membuat lobi"})
	}

	hostMember := models.TransactionMember{
		TransactionID: newRoom.ID,
		UserID:        &hostUUID,
		Name:          hostUser.Name,
		IsHost:        true,
		ColorCode:     assignColor(0),
	}
	models.DB.Create(&hostMember)

	return c.Status(201).JSON(fiber.Map{
		"message":   "Room berhasil dibuat!",
		"room_code": roomCode,
		"room_id":   newRoom.ID,
	})
}

func JoinRoom(c *fiber.Ctx) error {
	roomCode := c.Params("roomCode")

	type JoinReq struct {
		Name string `json:"name"`
	}
	var req JoinReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Nama tidak boleh kosong"})
	}

	var room models.Transaction
	if err := models.DB.Where("room_code = ?", roomCode).First(&room).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Room tidak ditemukan atau sudah kadaluarsa"})
	}

	if room.Status != "splitting" {
		return c.Status(400).JSON(fiber.Map{"error": "Sesi split bill ini sudah dikunci/selesai"})
	}

	var currentMemberCount int64
	models.DB.Model(&models.TransactionMember{}).Where("transaction_id = ?", room.ID).Count(&currentMemberCount)

	newMember := models.TransactionMember{
		TransactionID: room.ID,
		Name:          req.Name,
		IsHost:        false,
		ColorCode:     assignColor(int(currentMemberCount)),
	}

	if err := models.DB.Create(&newMember).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Gagal bergabung ke room"})
	}

	return c.Status(200).JSON(fiber.Map{
		"message":   "Berhasil join!",
		"member_id": newMember.ID,
		"room": fiber.Map{
			"merchant": room.MerchantName,
			"total":    room.GrandTotal,
		},
	})
}

// --- GET ROOM DETAIL ---
func GetRoomByCode(c *fiber.Ctx) error {
	roomCode := c.Params("roomCode")
	var room models.Transaction

	err := models.DB.
		Preload("Members").
		Preload("Items").
		Preload("Items.Splits").
		Where("room_code = ?", roomCode).
		First(&room).Error

	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Lobi tidak ditemukan"})
	}

	return c.Status(200).JSON(room)
}
