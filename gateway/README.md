# 🚀 LIFF Form Gateway Service (Golang for Google Cloud Run)

บริการ Middleware API เขียนด้วยภาษา Golang ทำหน้าที่รับ JSON Payload จากหน้าเว็บ LINE LIFF บน GitHub Pages แล้วส่งต่อข้อความ (Publish) เข้าสู่ Google Cloud Pub/Sub ท็อปปิก `line_2019_to_fondue` (หรือท็อปปิกที่กำหนด)

---

## 📋 Checklist สรุปสิ่งที่ Middleware ต้องทำ (Middleware Requirements Checklist)

- [x] **1. รองรับ HTTP Options (CORS Preflight):** ตั้งค่า Headers `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, OPTIONS` เพื่อให้ยิงผ่าน `fetch()` จาก GitHub Pages และ LINE LIFF ได้
- [x] **2. รับและแกะ JSON Payload:** ตรวจสอบฟิลด์สำคัญ `form_id`, `org_id`, `liff_id`, `source`, `patient_info`, `contact_info`
- [x] **3. จัดการรูปถ่ายแบบ Base64 (Image Processing):** รับอาเรย์รูปภาพ `images.medical_certs` และ `images.attachments` จาก Payload (บีบอัดมาจากฝั่ง Frontend แล้ว) เพื่อส่งต่อเข้า Pub/Sub หรือ Decode อัปโหลดลง Cloud Storage
- [x] **4. แนบ Metadata Attributes ให้ Pub/Sub Message:** ใส่ `form_id`, `org_id`, `liff_id`, `source`, `timestamp` เข้าใน Attributes ของ Message เพื่อให้ Worker ดึงไปสวิตช์ประมวลผลได้ถูกต้อง
- [x] **5. Publish เข้า Google Cloud Pub/Sub:** ยิงข้อความเข้า Topic `line_2019_to_fondue` บน GCP Project `traffy-cloud`
- [x] **6. คืนค่า JSON Response ชัดเจน:** คืนค่า `HTTP 200 OK` พร้อม `success: true` และ `message_id` ให้ฝั่ง LIFF แสดงป๊อปอัปสำเร็จ
- [x] **7. มี Endpoint เช็กสุขภาพระบบ (Health Check):** มีพาร์ท `GET /health` สำหรับตรวจสอบสถานะคอนเทนเนอร์บน Cloud Run

---

## 🏗️ คุณสมบัติหลัก (Key Features)

1. **Multi-Form Gateway Routing:** รองรับการรับข้อมูลจากหลากหลายแบบฟอร์ม (`form_id`, `org_id`, `liff_id`)
2. **CORS Enabled:** รองรับ Cross-Origin Resource Sharing สำหรับการเรียกผ่าน `fetch()` จาก Frontend บน GitHub Pages / LIFF Webview
3. **No Key File Needed on Cloud Run:** เมื่อ Deploy บน Google Cloud Run ระบบจะใช้ IAM Service Account Role ของ Cloud Run คุยกับ Pub/Sub โดยอัตโนมัติ (ไม่ต้องเก็บไฟล์ `storage.json`)
4. **Lightweight & High Performance:** ปริมาณการใช้ RAM น้อยมาก (Container Image < 15MB) สเกลตอบสนองเร็วสูง

---

## 🛠️ วิธีการรันและทดสอบเครื่องตนเอง (Local Development)

```bash
# 1. เข้าไปยังโฟลเดอร์ gateway
cd gateway

# 2. ติดตั้ง Dependencies
go mod tidy

# 3. สั่งรันโลคอลแอปพลิเคชัน (พอร์ต 8080)
go run main.go
```

ทดสอบยิง `POST` จาก Terminal:

```bash
curl -X POST http://localhost:8080/ \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": "bkk_careplan_diaper_v1",
    "org_id": "BKK.HEALTH_CENTER.01",
    "patient_info": { "fullname": "ทดสอบ สุขภาพ" }
  }'
```

---

## ☁️ วิธีการ Deploy ขึ้น Google Cloud Run (Production Deployment)

สั่งรันด้วย `gcloud CLI` สองบรรทัดดังนี้:

```bash
# 1. Build และ Push Container Image ไปยัง Artifact Registry / Container Registry
gcloud builds submit --tag gcr.io/traffy-cloud/liff-form-gateway .

# 2. Deploy ขึ้น Google Cloud Run
gcloud run deploy liff-form-gateway \
  --image gcr.io/traffy-cloud/liff-form-gateway \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=traffy-cloud,PUBSUB_TOPIC=line_2019_to_fondue
```

---

## 🔐 การกำหนดสิทธิ์สิทธิบน GCP (IAM Permissions)

ต้องตรวจสอบให้แน่ใจว่า **Service Account** ที่ใช้ใน Cloud Run มีสิทธิ์ในการ Publish เข้า Pub/Sub:
* **IAM Role:** `Pub/Sub Publisher` (`roles/pubsub.publisher`) บน Project `traffy-cloud`
