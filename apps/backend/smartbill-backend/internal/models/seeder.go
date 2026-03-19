package models

import (
	"fmt"
	"log"
)

func SeedDatabase() {
	categories := []Category{
		{Name: "Makan", Type: "expense"},
		{Name: "Belanja", Type: "expense"},
		{Name: "Kebersihan", Type: "expense"},
		{Name: "Tagihan", Type: "expense"},
		{Name: "Kesehatan", Type: "expense"},
		{Name: "Hiburan", Type: "expense"},
		{Name: "Pendidikan", Type: "expense"},
		{Name: "Transportasi", Type: "expense"},
		{Name: "Lain-lain", Type: "expense"},
	}

	for _, cat := range categories {
		var count int64
		DB.Model(&Category{}).Where("name = ?", cat.Name).Count(&count)

		if count == 0 {
			if err := DB.Create(&cat).Error; err != nil {
				log.Printf("Gagal seed kategori %s: %v", cat.Name, err)
			}
		}
	}

	fmt.Println("🌱 Database Seeding Completed with Custom Categories!")
}

// Endpoint khusus buat testing/development
func SeedMockData() {
	// 1. Bikin Akun Host (Syahrul) dulu di tabel Users
	hostUser := User{
		Name:     "Syahrul",
		Email:    "syahrul.host@test.com",
		Password: "hashed_password_dummy", // Cuma mock
	}
	// Pakai FirstOrCreate biar kalau di-klik berkali-kali nggak error email duplicate
	DB.Where("email = ?", hostUser.Email).FirstOrCreate(&hostUser)

	var dummyCat Category
	DB.Where("name = ?", "Makan").FirstOrCreate(&dummyCat, Category{
		Name: "Makan",
		Type: "expense",
	})
	catID := dummyCat.ID

	// ==========================================
	// BILL 1: WARUNG BU SRI (Status: Splitting)
	// ==========================================
	bill1 := Transaction{
		HostID:        hostUser.ID,
		RoomCode:      "WSR01",
		MerchantName:  "Warung Bu Sri",
		GrandTotal:    97000,
		TaxAndService: 0,
		Status:        "splitting",
	}
	// Hapus data lama (kalau ada) biar bersih pas testing ulang
	DB.Unscoped().Where("room_code = ?", "WSR01").Delete(&Transaction{})
	DB.Create(&bill1)

	// Bikin Members buat Warung Bu Sri
	m0 := TransactionMember{TransactionID: bill1.ID, Name: "Lisa", ColorCode: "#C9963A", IsHost: false, HasPaid: false}
	m1 := TransactionMember{TransactionID: bill1.ID, UserID: &hostUser.ID, Name: "Syahrul", ColorCode: "#3A7BD5", IsHost: true, HasPaid: false}
	m2 := TransactionMember{TransactionID: bill1.ID, Name: "Jonathan", ColorCode: "#2D6A4F", IsHost: false, HasPaid: false}
	DB.Create(&m0)
	DB.Create(&m1)
	DB.Create(&m2)

	// Bikin Items

	i1 := TransactionItem{TransactionID: bill1.ID, CategoryID: catID, ItemName: "Nasi Goreng Spesial", Qty: 1, Price: 25000}
	i2 := TransactionItem{TransactionID: bill1.ID, CategoryID: catID, ItemName: "Ayam Bakar", Qty: 1, Price: 32000}
	i3 := TransactionItem{TransactionID: bill1.ID, CategoryID: catID, ItemName: "Gado-Gado", Qty: 1, Price: 22000}
	i4 := TransactionItem{TransactionID: bill1.ID, CategoryID: catID, ItemName: "Es Teh x 3", Qty: 3, Price: 18000}
	DB.Create(&i1)
	DB.Create(&i2)
	DB.Create(&i3)
	DB.Create(&i4)

	// Bikin Claims (Rebutan)
	claims := []ItemSplit{
		{ItemID: i1.ID, MemberID: m0.ID}, // Lisa -> Nasi Goreng
		{ItemID: i2.ID, MemberID: m1.ID}, // Syahrul -> Ayam Bakar
		{ItemID: i3.ID, MemberID: m2.ID}, // Jon -> Gado-Gado
		// Es Teh dibagi 3:
		{ItemID: i4.ID, MemberID: m0.ID},
		{ItemID: i4.ID, MemberID: m1.ID},
		{ItemID: i4.ID, MemberID: m2.ID},
	}
	DB.Create(&claims)

	// ==========================================
	// BILL 2: KOPI KENANGAN (Status: Settled)
	// ==========================================
	bill2 := Transaction{
		HostID:       hostUser.ID,
		RoomCode:     "KPK02",
		MerchantName: "Kopi Kenangan",
		GrandTotal:   85000,
		Status:       "settled",
	}
	DB.Unscoped().Where("room_code = ?", "KPK02").Delete(&Transaction{})
	DB.Create(&bill2)

	// Kopi Kenangan cuma berdua
	km0 := TransactionMember{TransactionID: bill2.ID, Name: "Lisa", ColorCode: "#C9963A", HasPaid: true}
	km1 := TransactionMember{TransactionID: bill2.ID, UserID: &hostUser.ID, Name: "Syahrul", ColorCode: "#3A7BD5", IsHost: true, HasPaid: true}
	DB.Create(&km0)
	DB.Create(&km1)

	// Items & Claims Kopi Kenangan
	ki5 := TransactionItem{TransactionID: bill2.ID, CategoryID: catID, ItemName: "Kopi Susu", Qty: 1, Price: 32000}
	ki6 := TransactionItem{TransactionID: bill2.ID, CategoryID: catID, ItemName: "Matcha Latte", Qty: 1, Price: 35000}
	ki7 := TransactionItem{TransactionID: bill2.ID, CategoryID: catID, ItemName: "Croissant", Qty: 1, Price: 18000}
	DB.Create(&ki5)
	DB.Create(&ki6)
	DB.Create(&ki7)

	DB.Create(&[]ItemSplit{
		{ItemID: ki5.ID, MemberID: km0.ID},
		{ItemID: ki6.ID, MemberID: km1.ID},
		{ItemID: ki7.ID, MemberID: km0.ID},
		{ItemID: ki7.ID, MemberID: km1.ID}, // Croissant bagi 2
	})
}
