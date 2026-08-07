package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/pubsub"
)

const (
	defaultProjectID = "traffy-cloud"
	defaultTopicName = "line_2019_to_fondue"
)

var (
	pubsubClient *pubsub.Client
	projectID    string
	topicName    string
)

func main() {
	projectID = getEnv("GCP_PROJECT_ID", defaultProjectID)
	topicName = getEnv("PUBSUB_TOPIC", defaultTopicName)
	port := getEnv("PORT", "8080")

	ctx := context.Background()
	var err error
	pubsubClient, err = pubsub.NewClient(ctx, projectID)
	if err != nil {
		log.Printf("⚠️ Warning: Failed to create PubSub client (normal if running locally without credentials): %v", err)
	} else {
		defer pubsubClient.Close()
	}

	http.HandleFunc("/", handleCORS(handleLiffFormSubmit))

	log.Printf("🚀 LIFF Form Gateway Service starting on port %s (Project: %s, Topic: %s)", port, projectID, topicName)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("HTTP server failed: %v", err)
	}
}

func handleLiffFormSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON payload: %v", err), http.StatusBadRequest)
		return
	}

	formID, _ := payload["form_id"].(string)
	orgID, _ := payload["org_id"].(string)
	log.Printf("📥 Received submission - FormID: %s, OrgID: %s", formID, orgID)

	dataBytes, err := json.Marshal(payload)
	if err != nil {
		http.Error(w, "Failed to marshal payload", http.StatusInternalServerError)
		return
	}

	msgID := "mock-msg-id-local"
	if pubsubClient != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()

		topic := pubsubClient.Topic(topicName)
		result := topic.Publish(ctx, &pubsub.Message{
			Data: dataBytes,
			Attributes: map[string]string{
				"form_id": formID,
				"org_id":  orgID,
				"source":  "liff_gateway_golang",
			},
		})

		msgID, err = result.Get(ctx)
		if err != nil {
			log.Printf("❌ PubSub Publish error: %v", err)
			http.Error(w, fmt.Sprintf("PubSub publish failed: %v", err), http.StatusInternalServerError)
			return
		}
		log.Printf("✅ Published to PubSub successfully! MessageID: %s", msgID)
	} else {
		log.Printf("ℹ️ PubSub client disabled in local mode. Received %d bytes", len(dataBytes))
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"message_id": msgID,
		"form_id":    formID,
		"timestamp":  time.Now().Format(time.RFC3339),
	})
}

func handleCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
