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

// Standard JSON Response structure
type APIResponse struct {
	Success   bool   `json:"success"`
	MessageID string `json:"message_id,omitempty"`
	FormID    string `json:"form_id,omitempty"`
	Timestamp string `json:"timestamp"`
	Error     string `json:"error,omitempty"`
}

func main() {
	projectID = getEnv("GCP_PROJECT_ID", defaultProjectID)
	topicName = getEnv("PUBSUB_TOPIC", defaultTopicName)
	port := getEnv("PORT", "8080")

	ctx := context.Background()
	var err error
	pubsubClient, err = pubsub.NewClient(ctx, projectID)
	if err != nil {
		log.Printf("⚠️ Warning: Failed to initialize GCP PubSub client: %v (running in mock mode if local)", err)
	} else {
		defer pubsubClient.Close()
	}

	http.HandleFunc("/", handleCORS(handleRoute))
	http.HandleFunc("/health", handleCORS(handleHealthCheck))

	log.Printf("🚀 LIFF Form Gateway Service active on port %s (Project: %s, Topic: %s)", port, projectID, topicName)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("HTTP server failed: %v", err)
	}
}

func handleRoute(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		handleHealthCheck(w, r)
		return
	}

	if r.Method == http.MethodPost {
		handleLiffFormSubmit(w, r)
		return
	}

	writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

func handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "healthy",
		"service":   "liff-form-gateway",
		"project":   projectID,
		"topic":     topicName,
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func handleLiffFormSubmit(w http.ResponseWriter, r *http.Request) {
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSONError(w, http.StatusBadRequest, fmt.Sprintf("Invalid JSON payload: %v", err))
		return
	}

	// Extract metadata
	formID, _ := payload["form_id"].(string)
	orgID, _ := payload["org_id"].(string)
	liffID, _ := payload["liff_id"].(string)
	source, _ := payload["source"].(string)

	if formID == "" {
		formID = "bkk_careplan_diaper_v1"
	}
	if source == "" {
		source = "bkk_careplan_traffy_fondue_webview"
	}

	log.Printf("📥 Received submission - FormID: %s, OrgID: %s, LIFFID: %s", formID, orgID, liffID)

	dataBytes, err := json.Marshal(payload)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to encode JSON payload")
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
				"form_id":   formID,
				"org_id":    orgID,
				"liff_id":   liffID,
				"source":    source,
				"timestamp": time.Now().Format(time.RFC3339),
			},
		})

		msgID, err = result.Get(ctx)
		if err != nil {
			log.Printf("❌ PubSub Publish error: %v", err)
			writeJSONError(w, http.StatusInternalServerError, fmt.Sprintf("PubSub publish failed: %v", err))
			return
		}
		log.Printf("✅ Published to PubSub successfully! MessageID: %s", msgID)
	} else {
		log.Printf("ℹ️ PubSub client inactive. Mock mode payload size: %d bytes", len(dataBytes))
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(APIResponse{
		Success:   true,
		MessageID: msgID,
		FormID:    formID,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

func writeJSONError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(APIResponse{
		Success:   false,
		Error:     message,
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

func handleCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

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
