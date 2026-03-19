package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Base struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (base *Base) BeforeCreate(tx *gorm.DB) error {
	base.ID = uuid.New()
	return nil
}

type User struct {
	Base
	Name         string              `json:"name"`
	Email        string              `gorm:"uniqueIndex" json:"email"`
	Password     string              `json:"-"`
	Transactions []Transaction       `gorm:"foreignKey:HostID"`
	Memberships  []TransactionMember `gorm:"foreignKey:UserID"`
}

type Category struct {
	Base
	Name             string            `json:"name"`
	Type             string            `json:"type"`
	TransactionItems []TransactionItem `gorm:"foreignKey:CategoryID"`
}

type Transaction struct {
	Base
	HostID        uuid.UUID `gorm:"type:uuid" json:"host_id"`
	RoomCode      string    `gorm:"type:varchar(10);uniqueIndex" json:"room_code"`
	MerchantName  string    `json:"merchant_name"`
	TaxAndService float64   `gorm:"type:decimal(10,2)" json:"tax_and_service"`
	GrandTotal    float64   `gorm:"type:decimal(10,2)" json:"grand_total"`
	ReceiptURL    string    `json:"receipt_url"`
	Status        string    `gorm:"default:'splitting'" json:"status"`

	Members []TransactionMember `gorm:"foreignKey:TransactionID;constraint:OnDelete:CASCADE;" json:"members"`
	Items   []TransactionItem   `gorm:"foreignKey:TransactionID;constraint:OnDelete:CASCADE;" json:"items"`
}

type TransactionMember struct {
	Base
	TransactionID uuid.UUID  `gorm:"type:uuid" json:"transaction_id"`
	UserID        *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Name          string     `json:"name"`
	ColorCode     string     `json:"color_code"`
	IsHost        bool       `gorm:"default:false" json:"is_host"`
	HasPaid       bool       `gorm:"default:false" json:"has_paid"`

	Splits []ItemSplit `gorm:"foreignKey:MemberID;constraint:OnDelete:CASCADE;" json:"splits"`
}

type TransactionItem struct {
	Base
	TransactionID uuid.UUID   `gorm:"type:uuid" json:"transaction_id"`
	CategoryID    uuid.UUID   `gorm:"type:uuid" json:"category_id"`
	ItemName      string      `json:"item_name"`
	Qty           int         `gorm:"default:1" json:"qty"`
	Price         float64     `gorm:"type:decimal(10,2)" json:"price"`
	Splits        []ItemSplit `gorm:"foreignKey:ItemID;constraint:OnDelete:CASCADE;" json:"splits"`
}

type ItemSplit struct {
	Base
	ItemID     uuid.UUID `gorm:"type:uuid" json:"item_id"`
	MemberID   uuid.UUID `gorm:"type:uuid" json:"member_id"`
	AmountOwed float64   `gorm:"type:decimal(10,2)" json:"amount_owed"`
}
