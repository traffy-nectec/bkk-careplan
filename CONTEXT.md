# Project Context: BKK Careplan ( Adult Diapers Support Form )

## Purpose
โปรเจกต์ `bkk-careplan` มีวัตถุประสงค์เพื่อให้บริการเว็บฟอร์มแจ้งความประสงค์ขอรับผ้าอ้อมผู้ใหญ่ แผ่นรองซับการขับถ่าย และแผ่นเสริมซึมซับ สำหรับประชาชนในกรุงเทพมหานคร เชื่อมโยงกระบวนการยื่นคำร้องผ่าน Traffy Fondue เข้ากับแบบฟอร์มประเมินทางการแพทย์ (แบบ Diapers 01-2 และ Diapers 02 MINI Careplan)

## Key Features & Architecture
1. **One-Question-Per-Screen (Conversational Wizard UI)**:
   - ออกแบบแบบ Mobile-First เพื่ออำนวยความสะดวกให้ผู้สูงอายุหรือผู้ดูแลกรอกผ่านสมาร์ทโฟน
   - แต่ละหน้าจอถามเพียง 1 ประเด็น ช่วยลด Cognitive Load และลดอัตราการละทิ้งฟอร์มกลางคราว (Drop-off Rate)
2. **Draft Auto-save Mechanism**:
   - ใช้งาน `localStorage` บันทึก State ของฟอร์มทุกครั้งที่มีการเปลี่ยนข้อ
   - หากผู้ใช้งานเน็ตหลุด เบราว์เซอร์ปิด หรือสลับแอป สามารถกลับมากรอกต่อจากข้อเดิมได้ทันที
3. **Data Field Categorization Strategy**:
   - **จำ เป็นต้องมี (Required)**: ข้อมูลผู้ป่วย, เลขประจำตัวประชาชน 13 หลัก, ที่อยู่ BKK, พิกัด GPS, เบอร์โทรศัพท์, สิทธิการรักษา และสภาวะความต้องการ (ติดเตียง/กลั้นขับถ่ายไม่ได้)
   - **แนะนำให้มี (Recommended)**: ข้อมูลผู้ดูแล, โรคประจำตัว, ไซส์ผ้าอ้อมผู้ใหญ่ (S, M, L, XL), บัตรคนพิการ, และรูปถ่าย/ใบรับรองแพทย์
   - **ไม่จำเป็นต้องให้ประชาชนกรอก (Excluded)**: คะแนน ADL Barthel Index, การจัดชุด A-E, ข้อมูลและลายเซ็น Care Manager (ส่วนนี้ให้ ศบส. เป็นผู้ประเมิน)
4. **JSON Payload Standard**:
   - ส่งออกข้อมูลในรูปแบบ JSON Schema ที่รองรับการเชื่อมต่อ API ของ Traffy Fondue และระบบจัดการข้อมูล Care Plan หลังบ้าน

## Technical Stack
- **Frontend**: Vanilla HTML5, ES6 JavaScript Modules
- **Styling**: Pure Modern CSS3 (Variables, Dynamic Flexbox/Grid, Glassmorphism, Smooth Slide Keyframes)
- **State Management**: Client-side Reactive Form State Engine with LocalStorage Synchronization
- **Color Palette**: BKK Emerald / Deep Teal (`#0d5c3a`, `#16a085`, `#e8f5e9`)
