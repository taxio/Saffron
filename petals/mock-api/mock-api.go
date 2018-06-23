package main

import (
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	"os"
	"regexp"
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

func signupHandler(c *gin.Context){
	email := c.PostForm("email")
	//password := c.PostForm("password")

	var emailPattern = `^(?i:[^ @"<>]+|".*")@(?i:[a-z1-9.])+.(?i:[a-z])+$`
	var re = regexp.MustCompile(emailPattern)
	if len(re.FindAllString(email, -1)) != 0 {
		c.JSON(200, gin.H{
			"success": true,
			"message": "signup success",
		})
	}else {
		c.JSON(400, gin.H{
			"success": false,
			"message": "validation error of email",
		})
	}
}

type Lab struct {
	Name		string	`json:"name"`
	Capacity	int		`json:"capacity"`
	CourceId	int		`json:"course_id"`
}
type Labs []Lab
var labs = Labs{
	Lab{Name:"lab1", Capacity:4, CourceId:1},
	Lab{Name:"lab2", Capacity:3, CourceId:2},
	Lab{Name:"lab3", Capacity:4, CourceId:3},
	Lab{Name:"lab4", Capacity:2, CourceId:4},
}
func labsHandler(c *gin.Context){
	c.JSON(200, labs)
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
	router.POST("/signup", signupHandler)
	router.GET("/labs", labsHandler)

	router.Run(os.Getenv("PORT"))
}
