# BKK Careplan - ระบบฟอร์มแจ้งขอรับผ้าอ้อมผู้ใหญ่ กรุงเทพมหานคร ผ่าน Traffy Fondue

ระบบเว็บฟอร์มแบบ **Mobile-First Multi-Step Form (1 ข้อต่อ 1 หน้า)** สำหรับประชาชนและผู้ดูแลผู้ป่วยในพื้นที่กรุงเทพมหานคร เพื่อแจ้งความประสงค์ขอรับการสนับสนุนผ้าอ้อมผู้ใหญ่ แผ่นรองซับการขับถ่าย และแผ่นเสริมซึมซับ ตามแนวทางหลักประกันสุขภาพแห่งชาติและกรุงเทพมหานคร ผ่านแอปพลิเคชัน/ระบบ **Traffy Fondue**

---

## 🎯 วัตถุประสงค์ (Purpose)
ช่วยอำนวยความสะดวกให้ประชาชน ผู้ป่วยติดเตียง หรือผู้ดูแล สามารถยื่นคำขอรับสิทธิผ้าอ้อมผู้ใหญ่ได้อย่างรวดเร็ว ง่ายดาย ผ่านมือถือ โดยออกแบบ UI/UX ให้ใช้งานง่ายด้วยหลักการ **One Question Per Screen** มีระบบบันทึกร่างข้อมูลอัตโนมัติ (LocalStorage) และส่งออกข้อมูลเป็น JSON Payload สำหรับเชื่อมโยงกับระบบหลังบ้านและศูนย์บริการสาธารณสุข (ศบส.)

---

## 📋 เอกสารอ้างอิงและแบบฟอร์มทางการ (Referenced Documents)
- **แบบ Diapers 01-2:** [2.Diapers 01-2, 02 D3 16-12-2568.pdf](file:///Users/plagad/work/nstda/1_project/bkk-careplan/docs/references/2.Diapers%2001-2,%2002%20D3%2016-12-2568.pdf) - แบบแสดงความจำนงของบุคคลที่ประสงค์ขอรับการสนับสนุนผ้าอ้อมผู้ใหญ่ฯ
- **แบบ Diapers 02 (MINI Careplan):** แผนการดูแลรายบุคคลสำหรับบุคคลที่มีภาวะพึ่งพิง (ADL $\le$ 6) หรือภาวะกลั้นขับถ่ายไม่ได้
- **ขั้นตอนการรับผ้าอ้อมผ่าน Traffy Fondue:** [ขั้นตอนการรับผ้าอ้อม Traffy Fondue.pdf](file:///Users/plagad/work/nstda/1_project/bkk-careplan/docs/references/ขั้นตอนการรับผ้าอ้อม%20Traffy%20Fondue4-8-2569_5pm.pdf) - แนวทางการรับเรื่อง 3 วันทำการ และประเมินเสร็จสิ้นภายใน 14 วัน โดย ศบส. กรุงเทพมหานคร

---

## 🚀 ฟีเจอร์หลัก (Key Features)

1. **Mobile-First Multi-Step Form:**
   * ถามข้อมูลทีละ 1 ข้อต่อ 1 หน้าจอ (Card Slide Animation)
   * ปุ่มกดขนาดใหญ่ (Touch Targets) เหมาะสำหรับผู้สูงอายุหรือผู้ดูแล
2. **ระบบ Auto-Save Draft (LocalStorage):**
   * บันทึกคำตอบให้อัตโนมัติทุกครั้งที่เปลี่ยนข้อ ป้องกันข้อมูลสูญหายเมื่อเน็ตหลุดหรือเผลอปิดเบราว์เซอร์
3. **การตรวจสอบและวิเคราะห์ข้อมูลสิทธิประโยชน์:**
   * ตรวจสอบความถูกต้องของเลขบัตรประชาชน 13 หลัก
   * คัดกรองประเภทสิทธิการรักษาพยาบาล และกลุ่มเป้าหมายสภาวะสุขภาพตามเกณฑ์ทางการแพทย์
4. **พิกัดและการแนบไฟล์:**
   * ปุ่มระบุพิกัดสถานที่พักอาศัย (Geolocation API)
   * ระบบอัปโหลด/แนบรูปถ่ายผู้ป่วย สถานที่พักอาศัย และใบรับรองแพทย์
5. **หน้าสรุปข้อมูล (Review & Confirm):**
   * แสดงคำตอบทั้งหมดก่อนยืนยัน พร้อมปุ่มย้อนกลับแก้ไขคำตอบได้ตลอดเวลา
   * ส่งออกเป็น JSON Payload มาตรฐานสำหรับ API หลังบ้าน

---

## 🛠️ โครงสร้างโปรเจกต์ (Project Structure)

```
bkk-careplan/
├── .gitignore                         # กำหนดไม่ให้ commit ไฟล์ขยะและไฟล์ binary อ้างอิงขนาดใหญ่
├── README.md                          # เอกสารคู่มือและรายละเอียดระบบ
├── CONTEXT.md                         # บริบท วัตถุประสงค์ และข้อมูลทางเทคนิค
├── docs/
│   └── references/                    # เก็บไฟล์เอกสารอ้างอิง PDF และ PPTX ต้นฉบับ
│       ├── 2.Diapers 01-2, 02 D3 16-12-2568.pdf
│       ├── ขั้นตอนการรับผ้าอ้อม Traffy Fondue4-8-2569_5pm.pdf
│       └── ขั้นตอนการรับผ้าอ้อม Traffy Fondue4-8-2569_5pm.pptx
├── okf/
│   └── module_bkk_careplan.md         # Operational Knowledge Folder ของโมดูล
├── index.html                         # Entry Point (Single Page Application HTML)
├── styles.css                         # BKK Emerald/Teal Design System & Glassmorphism UI
└── app.js                             # Multi-step Form State, LocalStorage & JSON Generator
```

---

## ⚙️ การใช้งานและเปิดรันโปรเจกต์ (Getting Started)

เนื่องจากเป็น Vanilla Web Application (HTML5 / Modern CSS / JavaScript ES6+) สามารถเปิดใช้งานได้โดย:
1. เปิดไฟล์ [index.html](file:///Users/plagad/work/nstda/1_project/bkk-careplan/index.html) ผ่าน Web Browser บนเครื่องคอมพิวเตอร์หรือโทรศัพท์มือถือ
2. หรือรันผ่าน Local HTTP Server เช่น:
   ```bash
   npx serve .
   # หรือ
   python3 -m http.server 8000
   ```
