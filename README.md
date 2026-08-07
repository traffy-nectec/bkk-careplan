# ระบบยื่นเรื่องขอรับการสนับสนุนผ้าอ้อมผู้ใหญ่ กรุงเทพมหานคร (BKK Careplan - Traffy Fondue)

ระบบเว็บฟอร์มยื่นเรื่องขอรับการสนับสนุนผ้าอ้อมผู้ใหญ่และแผ่นรองซับการขับถ่าย สำหรับประชาชนและผู้ดูแลในพื้นที่กรุงเทพมหานคร โดยเชื่อมต่อข้อมูลเข้ากับระบบ **Traffy Fondue** และศูนย์บริการสาธารณสุข (ศบส.) กรุงเทพมหานคร

🌐 **ทดลองใช้งานระบบ (Live Demo):** [https://traffy-nectec.github.io/bkk-careplan/](https://traffy-nectec.github.io/bkk-careplan/)  
📚 **คู่มือการสั่งงาน AI (Prompt Engineering Guide):** [docs/ai_prompting_guide.md](docs/ai_prompting_guide.md)

---

## 🔁 แผนผังลำดับการส่งรับข้อมูล (End-to-End Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor User as ประชาชน / ผู้ดูแล
    participant Webview as BKK Careplan Webview
    participant API as Traffy Fondue Gateway
    participant DB as PostgreSQL Database
    participant Nurse as พยาบาลวิชาชีพ ศบส.

    User->>Webview: 1. ปักหมุด GPS พิกัดที่พักอาศัย (Step 4)
    Webview-->>User: 2. Reverse Geocoding เติม แขวง/เขต ให้อัตโนมัติ (Step 5)
    User->>Webview: 3. กรอกข้อมูล 12 ข้อ และกดส่งเรื่อง (Step 13)
    Webview->>API: 4. POST /api/careplan/diaper-requests (JSON Payload)
    API->>DB: 5. INSERT into diaper_requests & patients
    API->>Nurse: 6. กระจาย Ticket คำร้องเข้า Queue ของ ศบส. 69 แห่ง
    Nurse->>User: 7. โทรนัดหมายและลงพื้นที่เยี่ยมบ้าน (Stage 2)
    Nurse->>DB: 8. ประเมิน ADL 10 ข้อ, บัตรคนพิการ ➔ INSERT into in_home_assessments
    Nurse->>DB: 9. อนุมัติโควตาผ้าอ้อม/เดือน ➔ INSERT into diaper_approvals
    Nurse->>User: 10. ส่งมอบผ้าอ้อมผู้ใหญ่ประจำเดือน
```

---

## 🗄️ โครงสร้างฐานข้อมูล PostgreSQL สำหรับระยะถัดไป (Phase 2 Backend Relational DB Schema)

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
        string health_coverage "สิทธิการรักษาพยาบาลหลัก"
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
        string preferred_diaper_size
        string status "pending / visiting / approved / rejected"
        timestamp created_at
    }

    CAREGIVERS {
        uuid id PK
        uuid patient_id FK
        string fullname
        string phone
        string relationship
    }

    IN_HOME_ASSESSMENTS {
        uuid id PK
        uuid request_id FK
        string nurse_id "รหัสพยาบาลผู้ประเมิน ศบส."
        string health_center_code "รหัส ศบส. 69 แห่ง"
        string disability_card_id "เลขบัตรคนพิการ"
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
        string file_type
        timestamp uploaded_at
    }
```

---

## 📱 ภาพถ่ายตัวอย่างหน้าจอแอปพลิเคชัน (Mobile UI Screen Captures)

<div align="center">
  <img src="docs/screenshots/step_01_applicant.png" width="30%" alt="Step 1: สถานะผู้กรอก" />
  <img src="docs/screenshots/step_05_medical_cert.png" width="30%" alt="Step 5: แนบใบรับรองแพทย์" />
  <img src="docs/screenshots/step_06_map_location.png" width="30%" alt="Step 6: ปักหมุดแผนที่" />
</div>
<br>
<div align="center">
  <img src="docs/screenshots/step_07_address.png" width="30%" alt="Step 7: ที่อยู่ กทม." />
  <img src="docs/screenshots/step_09_caregiver_info.png" width="30%" alt="Step 9: ข้อมูลผู้ดูแล" />
  <img src="docs/screenshots/step_11_review_summary.png" width="30%" alt="Step 11: สรุปข้อมูล UX Cards" />
</div>

---

## 🏥 สถาปัตยกรรมเก็บข้อมูล 2 ระยะ (2-Stage Data Collection Model)

ข้อคำถามในแบบประเมิน `Diapers 01-2` ถูกแบ่งออกเป็น 2 ระยะ เพื่อประสิทธิภาพสูงสุดในการให้บริการประชาชน:

```
[ Stage 1: Citizen Intake Form ]       ➔       [ Stage 2: Clinical In-Home Visit ]
(ยื่นคำร้องผ่านมือถือ 12 ข้อคำถาม)                (พยาบาลวิชาชีพ ศบส. ประเมินเมื่อเยี่ยมบ้าน)
  • ปักหมุดพิกัด GPS & ที่อยู่ กทม.                   • ตรวจสอบบัตรคนพิการ & สิทธิสวัสดิการ
  • สภาวะติดเตียง / กลั้นไม่ได้                        • ประเมินคะแนน ADL 10 ข้อรายละเอียด
  • เลขบัตร 13 หลัก & เบอร์ติดต่อ                    • บันทึกโรคประจำตัว, แผลกดทับ & ข้อระวัง
  • ไซส์ผ้าอ้อม & ผู้ดูแล                            • อนุมัติโควตาผ้าอ้อม/เดือน & Care Plan
```

### คำถามในแบบ 01-2 ที่อยู่ใน Stage 2 (เมื่อพยาบาล ศบส. ลงเยี่ยมบ้าน):
* **บัตรคนพิการ & สิทธิคนพิการ:** เลขบัตรคนพิการ / สิทธิสวัสดิการ พม.
* **สถานะสุขภาพ & ประวัติโรคประจำตัว:** โรคสโตรก, สมองเสื่อม, อัมพฤกษ์/อัมพาต, แผลกดทับ (Stage 1-4)
* **ข้อระวังและคำแนะนำในการดูแล:** สายอาหาร (NG Tube), สายปัสสาวะ (Foley Cath), ภาวะติดเชื้อ, การแพ้วัสดุ
* **การประเมินคะแนน ADL (10 ข้อ):** ประเมินทักษะการดำเนินชีวิตประจำวันอย่างเป็นทางการ เพื่อตั้งเบิกงบประมาณ กองทุนหลักประกันสุขภาพ กทม.

---

## 📊 สรุปการจัดลำดับและการตัด/รวมข้อคำถามใน Stage 1 (Question Mapping)

จากการวิเคราะห์เอกสารแบบประเมินทางการแพทย์ของ สปสช. / กทม. (`แบบ 01, 02`) และกระบวนการรับเรื่องผ่าน Traffy Fondue ระบบได้ทำการปรับปรุงโครงสร้างคำถามให้อยู่ในรูปแบบ **10 ข้อคำถามย่อย (11 ขั้นตอน)** ตามตารางเปรียบเทียบดังนี้:

### 1. คำถามที่ปรับไปไว้ Stage 2 (Omitted from Stage 1) และเหตุผลทาง UX/UI
| คำถามในเอกสารเดิม | ย้ายไปอยู่ที่ไหน | เหตุผลทางตรรกะและหลักการ UX/UI (Rationale) |
| :--- | :---: | :--- |
| **ไซส์ผ้าอ้อม / สิทธิการรักษาหลัก / การช่วยเหลือตัวเอง** | **Stage 2 (ศบส. เยี่ยมบ้าน)** 🩺 | ปรับลดเพื่อความกระชับ ให้พยาบาลวิชาชีพสอบถามและประเมินเมื่อลงเยี่ยมบ้าน |
| **บัตรคนพิการ / ประวัติโรคประจำตัว / ข้อระวังการดูแล** | **Stage 2 (ศบส. เยี่ยมบ้าน)** 🩺 | เป็นข้อมูลสุขภาพเชิงลึก ให้พยาบาลวิชาชีพสอบถามและประเมินเมื่อลงเยี่ยมบ้าน เพื่อป้องกันภาระการกรอกคำร้องเบื้องต้นของผู้สูงอายุ/ผู้ดูแล |
| **การประเมินคะแนน ADL 10 ข้อรายละเอียด** <br>*(กินอาหาร, อาบน้ำ, แต่งตัว ฯลฯ)* | **Stage 2 (ศบส. เยี่ยมบ้าน)** 🩺 | เป็นการประเมินทางการแพทย์ (Clinical Assessment) **ใน Stage 1 สรุปเหลือปุ่มเลือกสภาวะ "ติดเตียง / กลั้นไม่ได้" ในข้อ 4** |
| **รหัสศูนย์บริการสาธารณสุข (ศบส. 69 แห่ง)** | **Backend System** ⚙️ | ประชาชนไม่ทราบรหัส ศบส. **ระบบใช้พิกัด GPS (ข้อ 6) + เขต/แขวง (ข้อ 7)** ไปค้นหารหัส ศบส. ที่รับผิดชอบให้อัตโนมัติ |
| **การลงนามของแพทย์ผู้ดูแล / หัวหน้า ศบส.** | **Internal Workflow** 🏛️ | เป็นกระบวนการอนุมัติฝั่งเจ้าหน้าที่ (Internal Approval Chain) |

---

### 2. ตาราง Mapping คำถาม Stage 1 (10 ข้อคำถามย่อย)
| ข้อคำถามเดิมในเอกสาร | ตำแหน่งในระบบใหม่ | วัตถุประสงค์และประโยชน์ต่อระบบ |
| :--- | :---: | :--- |
| สถานะผู้ยื่นเรื่อง (ยื่นเอง/ยื่นแทน) | **คำถามที่ 1** | กำหนดบริบทการกรอกข้อมูล (Context Setting) |
| ชื่อ - นามสกุล ผู้ป่วย | **คำถามที่ 2** | ระบุตัวตนผู้ป่วยผู้ขอรับสิทธิ (ย้ายต่อท้ายข้อ 1) |
| เลขบัตรประจำตัวประชาชน 13 หลัก | **คำถามที่ 3** | ตรวจสอบสิทธิหลักประกันสุขภาพ (สปสช.) แบบ Auto-format |
| ผู้ป่วยมีภาวะใดที่ทำให้จำเป็นต้องใช้ผ้าอ้อมผู้ใหญ่ | **คำถามที่ 4** | คัดกรองสิทธิทางการแพทย์หลัก (Medical Eligibility Filter) |
| แนบรูปถ่ายใบรับรองแพทย์ | **คำถามที่ 5 (Conditional Step)** ✨ | **แสดงเฉพาะผู้ที่เลือก "กลั้นไม่ได้" ในข้อ 4** *(ข้ามให้อัตโนมัติหากไม่เข้าเงื่อนไข)* |
| พิกัดสถานที่พักอาศัย GPS | **คำถามที่ 6** | **Location-First:** ดึงพิกัดอัตโนมัติ เพื่อส่งค่า แขวง/เขต ไปเติมในข้อ 7 |
| ที่อยู่ / แขวง / เขต / จุดสังเกต | **คำถามที่ 7** | **BKK Address Autocomplete:** ป้องกันพิมพ์ผิด + ช่องจุดสังเกต |
| เบอร์โทรศัพท์ติดต่อนัดหมาย | **คำถามที่ 8** | ช่องทางให้เจ้าหน้าที่ ศบส. โทรนัดหมายประเมินเยี่ยมบ้าน |
| ข้อมูลญาติ / ผู้ดูแลหลัก | **คำถามที่ 9** | **ยื่นเอง = Optional / ญาติยื่นแทน = Required** |
| รูปถ่ายสถานที่ / ผู้ป่วย | **คำถามที่ 10** | แนบหลักฐานประกอบสถานที่และผู้ป่วย (ไม่บังคับ) |
| สรุปข้อมูลการยื่นเรื่อง | **ขั้นตอนสุดท้าย (11)** | แสดงสรุป 5 การ์ดหมวดหมู่ พร้อมปุ่มแก้ไขเฉพาะจุด |

---

## ✨ จุดเด่นและฟีเจอร์หลัก (Key Features)

1. **Auto GPS Fetching & Reverse Geocoding อัตโนมัติ:**
   - ทันทีที่เข้าสู่ข้อคำถามที่ 6 ระบบจะเรียกสิทธิ์และดึงตำแหน่ง GPS ปัจจุบันของผู้ใช้มาปักหมุดบนแผนที่ให้อัตโนมัติ พร้อมค้นหาชื่อ **แขวง** และ **เขต** ในกรุงเทพมหานครส่งต่อไปเติมในข้อ 7 ให้อัตโนมัติโดยไม่ต้องเสียเวลากดปุ่มดึงตำแหน่ง
2. **BKK Address Autocomplete สไตล์ `jquery.Thailand.js`:**
   - สามารถพิมพ์หรือเลือกตัวเลือก **แขวง / เขต / รหัสไปรษณีย์** ยอดนิยมของ กทม. ได้ทันทีเมื่อแตะช่องค้นหา ป้องกันการพิมพ์ชื่อแขวง/เขตผิด 100%
3. **จุดสังเกตใกล้บ้าน (Landmark Option):**
   - เพิ่มช่องกรอกจุดสังเกตใกล้บ้าน (ไม่บังคับ) ช่วยให้ทีมพยาบาลเยี่ยมบ้านของศูนย์บริการสาธารณสุขเดินทางไปส่งมอบผ้าอ้อมได้รวดเร็ว
4. **โครงสร้างคำถามเรียงตามหลักจิตวิทยา UX/UI (Progressive Disclosure):**
   - เรียงคำถามจาก บริบท ➔ สิทธิทางการแพทย์ ➔ พิกัด ➔ ที่อยู่ ➔ ยืนยันตัวตน ➔ การดูแล ➔ สรุปการยื่นเรื่อง
5. **Accessibility สำหรับผู้สูงอายุ (Font Scaling):**
   - ปรับขนาดตัวอักษรได้ 3 ระดับ (`A`, `A+`, `A++`) เพื่อผู้สูงอายุและผู้ป่วย

---

## 🛠️ โครงสร้างไฟล์ในโครงการ (Project Architecture)

```
bkk-careplan/
├── index.html                  # หน้าเว็บ HTML5 Web App (Responsive)
├── styles.css                  # Modern Responsive CSS System
├── app.js                      # Form Logic, Leaflet GPS & Autocomplete Engine
├── docs/
│   ├── ai_prompting_guide.md   # คู่มือการสั่งงาน AI (Prompt Engineering Guide)
│   ├── context.md              # บริบท ที่มาโครงการ นโยบาย สปสช./กทม. & 2-Stage Data Model
│   ├── screenshots/            # ภาพถ่ายหน้าจอมือถือของทั้ง 13 ขั้นตอน
│   └── references/             # เอกสารอ้างอิงนโยบายและระเบียบ กทม./สปสช.
├── okf/
│   └── module_bkk_careplan.md  # OKF Technical Specification & Schema Definition
├── README.md                   # คู่มือและคำอธิบายโครงการ
└── .gitignore
```

---

## 🤝 การเชื่อมต่อระบบ (Integration & Payload)

ระบบส่งออกข้อมูลการยื่นเรื่องในรูปแบบ **JSON Payload** ที่รองรับการเชื่อมต่อ API กับ Traffy Fondue และระบบบริหารจัดการของกรุงเทพมหานคร (BKK Careplan Engine)
