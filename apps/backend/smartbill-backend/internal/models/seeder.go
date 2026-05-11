package models

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
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
		if err := DB.Where("name = ?", cat.Name).FirstOrCreate(&cat).Error; err != nil {
			log.Printf("Gagal seed kategori %s: %v", cat.Name, err)
		}
	}

	fmt.Println("🌱 Database Seeding Completed with Custom Categories!")
}

func SeedMockData() {
	DB.Unscoped().Where("email = ?", "syahrul.host@test.com").Delete(&User{})

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Gagal nge-hash password seeder: %v", err)
	}

	hostUser := User{
		Name:     "Syahrul",
		Username: "syahrul_host",
		Email:    "syahrul.host@test.com",
		Phone:    "08123456789",
		Password: string(hashedPassword),
	}

	DB.Where("email = ?", hostUser.Email).FirstOrCreate(&hostUser)

	var dummyCat Category
	DB.Where("name = ?", "Makan").FirstOrCreate(&dummyCat, Category{
		Name: "Makan",
		Type: "expense",
	})
	catID := dummyCat.ID

	bill1 := Transaction{
		HostID:        hostUser.ID,
		RoomCode:      "WSR01",
		MerchantName:  "Warung Bu Sri",
		GrandTotal:    97000,
		TaxAndService: 0,
		Status:        "splitting",
	}
	DB.Unscoped().Where("room_code = ?", "WSR01").Delete(&Transaction{})
	DB.Create(&bill1)

	m0 := TransactionMember{TransactionID: bill1.ID, Name: "Lisa", ColorCode: "#C9963A", IsHost: false, HasPaid: false}
	m1 := TransactionMember{TransactionID: bill1.ID, UserID: &hostUser.ID, Name: "Syahrul", ColorCode: "#3A7BD5", IsHost: true, HasPaid: false}
	m2 := TransactionMember{TransactionID: bill1.ID, Name: "Jonathan", ColorCode: "#2D6A4F", IsHost: false, HasPaid: false}
	DB.Create(&m0)
	DB.Create(&m1)
	DB.Create(&m2)

	i1 := TransactionItem{TransactionID: bill1.ID, CategoryID: &catID, ItemName: "Nasi Goreng Spesial", Qty: 1, Price: 25000}
	i2 := TransactionItem{TransactionID: bill1.ID, CategoryID: &catID, ItemName: "Ayam Bakar", Qty: 1, Price: 32000}
	i3 := TransactionItem{TransactionID: bill1.ID, CategoryID: &catID, ItemName: "Gado-Gado", Qty: 1, Price: 22000}
	i4 := TransactionItem{TransactionID: bill1.ID, CategoryID: &catID, ItemName: "Es Teh x 3", Qty: 3, Price: 18000}
	DB.Create(&i1)
	DB.Create(&i2)
	DB.Create(&i3)
	DB.Create(&i4)

	claims := []ItemSplit{
		{ItemID: i1.ID, MemberID: m0.ID},
		{ItemID: i2.ID, MemberID: m1.ID},
		{ItemID: i3.ID, MemberID: m2.ID},

		{ItemID: i4.ID, MemberID: m0.ID},
		{ItemID: i4.ID, MemberID: m1.ID},
		{ItemID: i4.ID, MemberID: m2.ID},
	}
	DB.Create(&claims)

	bill2 := Transaction{
		HostID:       hostUser.ID,
		RoomCode:     "KPK02",
		MerchantName: "Kopi Kenangan",
		GrandTotal:   85000,
		Status:       "settled",
	}
	DB.Unscoped().Where("room_code = ?", "KPK02").Delete(&Transaction{})
	DB.Create(&bill2)

	km0 := TransactionMember{TransactionID: bill2.ID, Name: "Lisa", ColorCode: "#C9963A", HasPaid: true}
	km1 := TransactionMember{TransactionID: bill2.ID, UserID: &hostUser.ID, Name: "Syahrul", ColorCode: "#3A7BD5", IsHost: true, HasPaid: true}
	DB.Create(&km0)
	DB.Create(&km1)

	ki5 := TransactionItem{TransactionID: bill2.ID, CategoryID: &catID, ItemName: "Kopi Susu", Qty: 1, Price: 32000}
	ki6 := TransactionItem{TransactionID: bill2.ID, CategoryID: &catID, ItemName: "Matcha Latte", Qty: 1, Price: 35000}
	ki7 := TransactionItem{TransactionID: bill2.ID, CategoryID: &catID, ItemName: "Croissant", Qty: 1, Price: 18000}
	DB.Create(&ki5)
	DB.Create(&ki6)
	DB.Create(&ki7)

	DB.Create(&[]ItemSplit{
		{ItemID: ki5.ID, MemberID: km0.ID},
		{ItemID: ki6.ID, MemberID: km1.ID},
		{ItemID: ki7.ID, MemberID: km0.ID},
		{ItemID: ki7.ID, MemberID: km1.ID},
	})

	fmt.Println("🎉 Database Seeding Mock Data Completed!")
}
