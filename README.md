# ระบบยื่นเรื่องขอรับการสนับสนุนผ้าอ้อมผู้ใหญ่ กรุงเทพมหานคร (BKK Careplan - Traffy Fondue)

ระบบเว็บฟอร์มยื่นเรื่องขอรับการสนับสนุนผ้าอ้อมผู้ใหญ่และแผ่นรองซับการขับถ่าย สำหรับประชาชนและผู้ดูแลในพื้นที่กรุงเทพมหานคร โดยเชื่อมต่อข้อมูลเข้ากับระบบ **Traffy Fondue** และศูนย์บริการสาธารณสุข (ศบส.) กรุงเทพมหานคร

🌐 **ทดลองใช้งานระบบ (Live Demo):** [https://traffy-nectec.github.io/bkk-careplan/](https://traffy-nectec.github.io/bkk-careplan/)

---

## 📱 ภาพถ่ายตัวอย่างหน้าจอแอปพลิเคชัน (Mobile UI Screen Captures)

<div align="center">
  <img src="docs/screenshots/step_01_applicant.png" width="30%" alt="Step 1: สถานะผู้กรอก" />
  <img src="docs/screenshots/step_04_map_location.png" width="30%" alt="Step 4: ปักหมุดแผนที่" />
  <img src="docs/screenshots/step_05_address.png" width="30%" alt="Step 5: ที่อยู่ กทม." />
</div>
<br>
<div align="center">
  <img src="docs/screenshots/step_07_national_id.png" width="30%" alt="Step 7: เลขบัตรประชาชน" />
  <img src="docs/screenshots/step_10_self_care_status.png" width="30%" alt="Step 10: การดูแลตัวเอง" />
  <img src="docs/screenshots/step_13_review_summary.png" width="30%" alt="Step 13: สรุปข้อมูล UX Cards" />
</div>

---

## ✨ จุดเด่นและฟีเจอร์หลัก (Key Features)

1. **Location-First & Reverse Geocoding อัตโนมัติ:**
   - เมื่อผู้ใช้ปักหมุดบนแผนที่ GPS ระบบจะดึงชื่อ **แขวง** และ **เขต** ในกรุงเทพมหานคร มาใส่ไว้ในที่อยู่อัตโนมัติ
2. **BKK Address Autocomplete สไตล์ `jquery.Thailand.js`:**
   - สามารถพิมพ์หรือเลือกตัวเลือก **แขวง / เขต / รหัสไปรษณีย์** ยอดนิยมของ กทม. ได้ทันทีเมื่อแตะช่องค้นหา ป้องกันการพิมพ์ชื่อแขวง/เขตผิด 100%
3. **จุดสังเกตใกล้บ้าน (Landmark Option):**
   - เพิ่มช่องกรอกจุดสังเกตใกล้บ้าน (ไม่บังคับ) ช่วยให้ทีมพยาบาลเยี่ยมบ้านของศูนย์บริการสาธารณสุขเดินทางไปส่งมอบผ้าอ้อมได้รวดเร็ว
4. **โครงสร้างคำถามเรียงตามหลักจิตวิทยา UX/UI (Progressive Disclosure):**
   - เรียงคำถามจาก บริบท ➔ สิทธิทางการแพทย์ ➔ พิกัด ➔ ที่อยู่ ➔ ยืนยันตัวตน ➔ การดูแล ➔ สรุปการยื่นเรื่อง
5. ** accessibility สสำหรับผู้สูงอายุ (Font Scaling):**
   - ปรับขนาดตัวอักษรได้ 3 ระดับ (`A`, `A+`, `A++`) เพื่อผู้สูงอายุและผู้ป่วย

---

## 🛠️ โครงสร้างไฟล์ในโครงการ (Project Architecture)

```
bkk-careplan/
├── index.html                  # หน้าเว็บ HTML5 Web App (Responsive)
├── styles.css                  # Modern Responsive CSS System
├── app.js                      # Form Logic, Leaflet GPS & Autocomplete Engine
├── docs/
│   ├── screenshots/            # ภาพถ่ายหน้าจอมือถือของทั้ง 13 ขั้นตอน
│   ├── references/             # เอกสารอ้างอิงนโยบายและระเบียบ กทม./สปสช.
│   └── context.md              # บริบทและที่มาของโครงการ
├── okf/
│   └── module_bkk_careplan.md  # OKF Technical Specification & Schema Definition
├── README.md                   # คู่มือและคำอธิบายโครงการ
└── .gitignore
```

---

## 🤝 การเชื่อมต่อระบบ (Integration & Payload)

ระบบส่งออกข้อมูลการยื่นเรื่องในรูปแบบ **JSON Payload** ที่รองรับการเชื่อมต่อ API กับ Traffy Fondue และระบบบริหารจัดการของกรุงเทพมหานคร (BKK Careplan Engine)
