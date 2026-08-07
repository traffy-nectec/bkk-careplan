# Operational Knowledge Folder (OKF): BKK Careplan Module

## 📌 Module Overview
* **Module Name:** `bkk_careplan_diaper_form`
* **Domain:** BKK Public Health Care Plan & Adult Diapers Support
* **Target Users:** Citizen (ผู้ป่วย / ญาติผู้ดูแลผู้ป่วย) & Public Health Nurses (พยาบาล ศบส.)
* **Integration Points:** Traffy Fondue Webview, BKK Public Health Centers (ศบส. 69 แห่ง), สปสช., PostgreSQL Database

---

## 🔁 1. End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as ประชาชน / ผู้ดูแล
    participant Webview as BKK Careplan Webview
    participant API as Traffy Fondue Gateway
    participant DB as PostgreSQL Database
    participant Nurse as พยาบาลวิชาชีพ ศบส.

    User->>Webview: 1. ปักหมุด GPS พิกัดที่พักอาศัย (Step 6)
    Webview-->>User: 2. Reverse Geocoding เติม แขวง/เขต ให้อัตโนมัติ (Step 7)
    User->>Webview: 3. กรอกข้อมูล 10 ข้อ และกดส่งเรื่อง (Step 11)
    Webview->>API: 4. POST /api/careplan/diaper-requests (JSON Payload)
    API->>DB: 5. INSERT into diaper_requests & patients
    API->>Nurse: 6. กระจาย Ticket คำร้องเข้า Queue ของ ศบส. 69 แห่ง
    Nurse->>User: 7. โทรนัดหมายและลงพื้นที่เยี่ยมบ้าน (Stage 2)
    Nurse->>DB: 8. ประเมิน ADL 10 ข้อ, สิทธิหลัก, บัตรคนพิการ ➔ INSERT into in_home_assessments
    Nurse->>DB: 9. อนุมัติโควตาผ้าอ้อม/เดือน ➔ INSERT into diaper_approvals
    Nurse->>User: 10. ส่งมอบผ้าอ้อมผู้ใหญ่ประจำเดือน
```

---

## 🗄️ 2. PostgreSQL Relational Database ER Diagram (Phase 2 Backend Schema)

```mermaid
erDiagram
    PATIENTS ||--o{ DIAPER_REQUESTS : "files"
    PATIENTS ||--o| CAREGIVERS : "cared by"
    DIAPER_REQUESTS ||--o{ IN_HOME_ASSESSMENTS : "evaluated by"
    IN_HOME_ASSESSMENTS ||--o| DIAPER_APPROVALS : "approves"
    DIAPER_REQUESTS ||--o{ REQUEST_ATTACHMENTS : "includes"

    PATIENTS {
        uuid id PK
        string national_id UK "เลขบัตรประชาชน 13 หลัก"
        string fullname "ชื่อ-นามสกุล ผู้ป่วย"
        string contact_phone "เบอร์โทรศัพท์"
        timestamp created_at
    }

    DIAPER_REQUESTS {
        uuid id PK
        string ticket_code UK "รหัสคำร้อง Traffy Fondue"
        uuid patient_id FK
        string applicant_type "patient / caregiver"
        string subdistrict "แขวง"
        string district "เขต"
        string zipcode "รหัสไปรษณีย์"
        text address_detail "บ้านเลขที่/ซอย/ถนน"
        string landmark "จุดสังเกตใกล้บ้าน"
        text full_address
        float latitude
        float longitude
        boolean is_bedridden
        boolean has_incontinence
        string status "pending / visiting / approved / rejected"
        timestamp created_at
    }

    CAREGIVERS {
        uuid id PK
        uuid patient_id FK
        string fullname
        string phone
    }

    IN_HOME_ASSESSMENTS {
        uuid id PK
        uuid request_id FK
        string nurse_id "รหัสพยาบาลผู้ประเมิน ศบส."
        string health_center_code "รหัส ศบส. 69 แห่ง"
        string disability_card_id "เลขบัตรคนพิการ"
        string health_coverage "สิทธิการรักษาหลัก"
        string preferred_diaper_size "ขนาดผ้าอ้อม"
        int adl_score "คะแนน ADL (0-20)"
        text medical_conditions_detail "โรคประจำตัว/แผลกดทับ"
        text care_precautions "ข้อระวัง สายอาหาร/สายปัสสาวะ"
        timestamp visited_at
    }

    DIAPER_APPROVALS {
        uuid id PK
        uuid assessment_id FK
        int approved_pieces_per_day "จำนวนชิ้น/วัน"
        int approved_pieces_per_month "จำนวนชิ้น/เดือน"
        date start_date
        date end_date
        string approved_by "หัวหน้า ศบส. ผู้อนุมัติ"
        timestamp approved_at
    }

    REQUEST_ATTACHMENTS {
        uuid id PK
        uuid request_id FK
        string file_path
        string file_type "patient_photo / medical_cert / house_photo"
        timestamp uploaded_at
    }
```

---

## 🏗️ Technical Specification

### 3. Form Step Pipeline & UX Architecture (11 Steps)
| Step | Field Code | Label (ภาษาไทย) | Input Type | Required | UX & Processing Logic |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `applicant_type` | สถานะผู้กรอกข้อมูล | Radio Card | Required | เลือก "ผู้ป่วย" หรือ "ญาติ/ผู้ดูแล" |
| 2 | `patient_fullname` | ชื่อ-นามสกุล ผู้ป่วย | Text Input | Required | ชื่อและนามสกุลจริงตามบัตรประชาชน (ย้ายต่อท้ายข้อ 1) |
| 3 | `patient_id_card` | เลขบัตรประชาชน 13 หลัก | Tel Input | Required | Auto-format `X-XXXX-XXXXX-XX-X` + Checksum Validation |
| 4 | `health_condition` | ภาวะความจำเป็น | Checkbox Card | Required | เลือก "ผู้ป่วยติดเตียง" และ/หรือ "กลั้นไม่ได้" |
| 5 | `medical_cert` | รูปถ่ายใบรับรองแพทย์ | File Upload | Conditional | **Conditional Step:** ปรากฏเฉพาะเมื่อ `has_incontinence == true` |
| 6 | `location_coords` | พิกัดสถานที่พักอาศัย | Leaflet Map | Required | **Location-First:** ปักหมุด GPS ยิง Reverse Geocoding ส่งค่าไป Step 7 |
| 7 | `patient_address` | ที่อยู่ กทม. + จุดสังเกต | Autocomplete & Text | Required | **BKK Address Autocomplete** (แขวง/เขต/รหัสไปรษณีย์) + ช่องจุดสังเกต |
| 8 | `contact_phone` | เบอร์โทรศัพท์ติดต่อนัดหมาย | Tel Input | Required | ตัวเลข 9-10 หลัก |
| 9 | `caregiver_info` | ข้อมูลญาติ/ผู้ดูแล | Text & Tel Input | Conditional | Required หาก `applicant_type == 'caregiver'` / Optional หากยื่นเอง |
| 10 | `attachments` | รูปถ่ายแนบประกอบ | File Upload | Optional | อัปโหลดรูปภาพผู้ป่วย/สถานที่พักอาศัย |
| 11 | `review_summary` | สรุปข้อมูลการยื่นเรื่อง | Review Grid | - | แสดงการ์ดสรุป 5 หมวดหมู่ พร้อมปุ่มแก้ไขเฉพาะส่วน |

---

## 🔌 JSON Output Payload Schema (`POST /api/careplan/diaper-requests`)

```json
{
  "request_timestamp": "2026-08-07T09:15:00+07:00",
  "source": "bkk_careplan_traffy_fondue_webview",
  "applicant_type": "caregiver",
  "patient_info": {
    "fullname": "นายสมชาย ใจดี",
    "id_card": "1100200345670"
  },
  "contact_info": {
    "phone": "0812345678",
    "district": "หลักสี่",
    "subdistrict": "ทุ่งสองห้อง",
    "zipcode": "10210",
    "address_detail": "99/1 ซอยวิภาวดี 16 ถนนวิภาวดีรังสิต อาคาร A ชั้น 2",
    "landmark": "ตรงข้ามวัดบางนาใน",
    "full_address": "99/1 ซอยวิภาวดี 16 ถนนวิภาวดีรังสิต อาคาร A ชั้น 2 (จุดสังเกต: ตรงข้ามวัดบางนาใน) แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210",
    "coordinates": {
      "latitude": 13.8821,
      "longitude": 100.5632
    }
  },
  "medical_conditions": {
    "is_bedridden": true,
    "has_incontinence": true,
    "medical_cert_count": 1
  },
  "caregiver_info": {
    "fullname": "นางสาวสมหญิง ใจดี (บุตรสาว)",
    "phone": "0898765432"
  },
  "attachments_count": 1
}
```
