package main

import (
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	"os"
)

func loginHandler(c *gin.Context){
	email := c.PostForm("email")
	password := c.PostForm("password")

	if email == os.Getenv("EMAIL") && password == os.Getenv("PASSWORD") {
		c.JSON(200, gin.H{
			"success": true,
			"message": "login success",
		})
	}else{
		c.JSON(401, gin.H{
			"success": false,
			"message": "Authentication failed. Wrong password.",
		})
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	router := gin.Default()
	router.GET("/", func(c *gin.Context){
		c.JSON(200, gin.H{
			"message": "Saffron API Mock",
		})
	})
	router.POST("/login", loginHandler)
	router.Run(":3000")
}
