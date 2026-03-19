package models

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := os.Getenv("DB_URL")

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Gagal koneksi ke database: ", err)
	}

	fmt.Println("✅ Database connected!")

	err = database.AutoMigrate(
		&User{},
		&Category{},
		&Transaction{},
		&TransactionMember{},
		&TransactionItem{},
		&ItemSplit{},
	)

	if err != nil {
		log.Fatal("Gagal menjalankan migrasi: ", err)
	}

	fmt.Println("🚀 Database Migration Successful!")
	DB = database

	SeedDatabase()
	SeedMockData()
}
