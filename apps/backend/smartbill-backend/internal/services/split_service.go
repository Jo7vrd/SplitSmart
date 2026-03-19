package services

import (
	"smartbill-backend/internal/models"
	"smartbill-backend/internal/websocket"

	"github.com/google/uuid"
)

func ProcessLiveAction(msg websocket.WSMessage) error {
	if msg.Action == "refresh" {
		return nil
	}

	switch msg.Action {
	case "claim":
		return models.DB.FirstOrCreate(&models.ItemSplit{
			ItemID:   uuid.MustParse(msg.ItemID),
			MemberID: uuid.MustParse(msg.MemberID),
		}, models.ItemSplit{
			ItemID:   uuid.MustParse(msg.ItemID),
			MemberID: uuid.MustParse(msg.MemberID),
		}).Error

	case "unclaim":
		return models.DB.Where("item_id = ? AND member_id = ?", msg.ItemID, msg.MemberID).
			Delete(&models.ItemSplit{}).Error

	case "toggle_paid":
		return models.DB.Exec("UPDATE transaction_members SET has_paid = NOT has_paid WHERE id = ?", msg.MemberID).Error

	case "edit_member":
		return models.DB.Model(&models.TransactionMember{}).Where("id = ?", msg.MemberID).Update("name", msg.Name).Error

	case "delete_member":
		return models.DB.Where("id = ?", msg.MemberID).Delete(&models.TransactionMember{}).Error
	}

	return nil
}
