package main

import (
	"net/http"
	"net/http/httputil"
	"fmt"
	"log"
)

func helloHandler(w http.ResponseWriter, r *http.Request){
	dump, err := httputil.DumpRequest(r, true)
	if err != nil {
		http.Error(w, fmt.Sprint(err), http.StatusInternalServerError)
		return
	}
	log.Println(string(dump))
	fmt.Fprint(w, "<html><body>Saffron API Mock</body></html>")
}

func main() {
	var mock http.Server

	http.HandleFunc("/", helloHandler)

	log.Println("start api mock: http://localhost:3000")
	mock.Addr = ":3000"
	log.Println(mock.ListenAndServe())
}
