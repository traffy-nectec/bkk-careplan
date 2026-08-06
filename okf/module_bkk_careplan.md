# Operational Knowledge Folder (OKF): BKK Careplan Module

## 📌 Module Overview
* **Module Name:** `bkk_careplan_diaper_form`
* **Domain:** BKK Public Health Care Plan & Adult Diapers Support
* **Target Users:** Citizen (ผู้ป่วย / ผู้ดูแลผู้ป่วย)
* **Integration Points:** Traffy Fondue System, Public Health Centers (ศบส.), สพธ.

---

## 🏗️ Technical Specification

### 1. Form Step Pipeline & Logic Flow
| Step | Field Code | Label (ภาษาไทย) | Type | Required | Validation / UX Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `applicant_type` | สถานะผู้กรอกข้อมูล | Select Radio | Required | **Auto-advance** ไปยังข้อถัดไปทันทีเมื่อเลือก |
| 2 | `patient_fullname` | ชื่อ-นามสกุล ผู้ป่วย | Text Input | Required | ไม่เป็นค่าว่าง (Disable ปุ่มถัดไปจนกว่าจะกรอก) |
| 3 | `patient_id_card` | เลขบัตรประจำตัวประชาชน 13 หลัก | Number Input | Required | 13 หลัก ตัวเลขเท่านั้น (Thai ID Checksum Check) |
| 4 | `health_coverage` | สิทธิการรักษาพยาบาลหลัก | Select Radio | Required | **Auto-advance** ไปยังข้อถัดไปทันทีเมื่อเลือก |
| 5 | `contact_phone` | เบอร์โทรศัพท์ที่ติดต่อได้ | Tel Input | Required | 9-10 หลัก |
| 6 | `address_details` | ที่อยู่ปัจจุบันใน กทม. | Text Area | Required | บ้านเลขที่, ถนน, แขวง, เขต |
| 7 | `location_coords` | พิกัดสถานที่พักอาศัย | **Leaflet Interactive Map** | Required | **ลากหมุดบนแผนที่ได้** หรือดึง GPS ปัจจุบัน |
| 8 | `health_condition` | สภาวะความต้องการผ้าอ้อม | Checkbox Multi | Required | เลือกอย่างน้อย 1 ข้อ |
| 9 | `diaper_size` | ขนาดไซส์ผ้าอ้อมที่ระบุ (ถ้าทราบ) | Select Radio | Optional | **Auto-advance** เมื่อเลือก |
| 10 | `self_care_status` | การดูแลตัวเองของผู้ป่วย | Select Radio | Required | **Auto-advance**; หากเลือก "ดูแลตัวเองได้" ระบบข้าม Step 11 |
| 11 | `caregiver_info` | ข้อมูลญาติ/ผู้ดูแล | Text Input | Conditional | ปรากฏเฉพาะเมื่อ `self_care_status == 'need_caregiver'` |
| 12 | `attachments` | รูปถ่ายผู้ป่วย/สถานที่/ใบรับรองแพทย์ | File Upload | Optional | รองรับรูปภาพ JPG, PNG |
| 13 | `review_summary` | ตรวจสอบสรุปข้อมูล UX Structured | Review Grid | - | แบ่ง 4 การ์ดหมวดหมู่ พร้อมปุ่มกดแก้ไขเฉพาะส่วน |

---

## 🔌 JSON Output Payload Schema (`POST /api/careplan/diaper-requests`)

```json
{
  "request_timestamp": "2026-08-06T14:04:00+07:00",
  "source": "bkk_careplan_traffy_fondue_webview",
  "applicant_type": "caregiver",
  "patient_info": {
    "fullname": "สมชาย ใจดี",
    "id_card": "1100200345678",
    "health_coverage": "บัตรทอง"
  },
  "contact_info": {
    "phone": "0812345678",
    "address": "99/1 ถนนวิภาวดีรังสิต แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร",
    "coordinates": {
      "latitude": 13.8821,
      "longitude": 100.5632
    }
  },
  "medical_conditions": {
    "is_bedridden": true,
    "has_incontinence": true,
    "preferred_diaper_size": "L"
  },
  "caregiver_info": {
    "is_self_care": false,
    "fullname": "สมหญิง ใจดี",
    "phone": "0898765432"
  },
  "attachments_count": 1
}
```
