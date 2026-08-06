document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_STEPS = 13;
  let currentStep = 1;
  let leafletMap = null;
  let leafletMarker = null;
  let isMapFullscreen = false;
  
  // Bangkok 50 Districts & 180 Subdistricts Dataset
  const bkkSubdistrictList = [
    { subdistrict: "ทุ่งสองห้อง", district: "หลักสี่", zipcode: "10210" },
    { subdistrict: "ตลาดบางเขน", district: "หลักสี่", zipcode: "10210" },
    { subdistrict: "ลาดยาว", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "เสนานิคม", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "จันทรเกษม", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "จอมพล", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "จตุจักร", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "สามเสนใน", district: "พญาไท", zipcode: "10400" },
    { subdistrict: "พญาไท", district: "พญาไท", zipcode: "10400" },
    { subdistrict: "สีกัน", district: "ดอนเมือง", zipcode: "10210" },
    { subdistrict: "ดอนเมือง", district: "ดอนเมือง", zipcode: "10210" },
    { subdistrict: "สนามบิน", district: "ดอนเมือง", zipcode: "10210" },
    { subdistrict: "คลองจั่น", district: "บางกะปิ", zipcode: "10240" },
    { subdistrict: "หัวหมาก", district: "บางกะปิ", zipcode: "10240" },
    { subdistrict: "อนุสาวรีย์", district: "บางเขน", zipcode: "10220" },
    { subdistrict: "ท่าแร้ง", district: "บางเขน", zipcode: "10220" },
    { subdistrict: "สายไหม", district: "สายไหม", zipcode: "10220" },
    { subdistrict: "ออเงิน", district: "สายไหม", zipcode: "10220" },
    { subdistrict: "คลองถนน", district: "สายไหม", zipcode: "10220" },
    { subdistrict: "ดินแดง", district: "ดินแดง", zipcode: "10400" },
    { subdistrict: "รัชดาภิเษก", district: "ดินแดง", zipcode: "10400" },
    { subdistrict: "ห้วยขวาง", district: "ห้วยขวาง", zipcode: "10310" },
    { subdistrict: "สามเสนนอก", district: "ห้วยขวาง", zipcode: "10310" },
    { subdistrict: "บางซื่อ", district: "บางซื่อ", zipcode: "10800" },
    { subdistrict: "วงศ์สว่าง", district: "บางซื่อ", zipcode: "10800" },
    { subdistrict: "คลองเตย", district: "คลองเตย", zipcode: "10110" },
    { subdistrict: "คลองตัน", district: "คลองเตย", zipcode: "10110" },
    { subdistrict: "พระโขนง", district: "คลองเตย", zipcode: "10110" },
    { subdistrict: "สวนหลวง", district: "สวนหลวง", zipcode: "10250" },
    { subdistrict: "อ่อนนุช", district: "สวนหลวง", zipcode: "10250" },
    { subdistrict: "พัฒนาการ", district: "สวนหลวง", zipcode: "10250" },
    { subdistrict: "ประเวศ", district: "ประเวศ", zipcode: "10250" },
    { subdistrict: "หนองบอน", district: "ประเวศ", zipcode: "10250" },
    { subdistrict: "ดอกไม้", district: "ประเวศ", zipcode: "10250" },
    { subdistrict: "บางนาเหนือ", district: "บางนา", zipcode: "10260" },
    { subdistrict: "บางนาใต้", district: "บางนา", zipcode: "10260" },
    { subdistrict: "สีลม", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "สุริยวงศ์", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "บางรัก", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "สี่พระยา", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "มหาพฤฒาราม", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "รองเมือง", district: "ปทุมวัน", zipcode: "10330" },
    { subdistrict: "วังใหม่", district: "ปทุมวัน", zipcode: "10330" },
    { subdistrict: "ปทุมวัน", district: "ปทุมวัน", zipcode: "10330" },
    { subdistrict: "ลุมพินี", district: "ปทุมวัน", zipcode: "10330" },
    { subdistrict: "ทุ่งพญาไท", district: "ราชเทวี", zipcode: "10400" },
    { subdistrict: "ถนนพญาไท", district: "ราชเทวี", zipcode: "10400" },
    { subdistrict: "ถนนเพชรบุรี", district: "ราชเทวี", zipcode: "10400" },
    { subdistrict: "มักกะสัน", district: "ราชเทวี", zipcode: "10400" },
    { subdistrict: "คลองเตยเหนือ", district: "วัฒนา", zipcode: "10110" },
    { subdistrict: "คลองตันเหนือ", district: "วัฒนา", zipcode: "10110" },
    { subdistrict: "พระโขนงเหนือ", district: "วัฒนา", zipcode: "10110" },
    { subdistrict: "ลาดพร้าว", district: "ลาดพร้าว", zipcode: "10230" },
    { subdistrict: "จรเข้บัว", district: "ลาดพร้าว", zipcode: "10230" },
    { subdistrict: "คลองกุ่ม", district: "บึงกุ่ม", zipcode: "10240" },
    { subdistrict: "นวมินทร์", district: "บึงกุ่ม", zipcode: "10240" },
    { subdistrict: "นวลจันทร์", district: "บึงกุ่ม", zipcode: "10230" },
    { subdistrict: "คันนายาว", district: "คันนายาว", zipcode: "10230" },
    { subdistrict: "รามอินทรา", district: "คันนายาว", zipcode: "10230" },
    { subdistrict: "สะพานสูง", district: "สะพานสูง", zipcode: "10240" },
    { subdistrict: "ทับช้าง", district: "สะพานสูง", zipcode: "10250" },
    { subdistrict: "ราษฎร์พัฒนา", district: "สะพานสูง", zipcode: "10240" },
    { subdistrict: "วังทองหลาง", district: "วังทองหลาง", zipcode: "10310" },
    { subdistrict: "สะพานสอง", district: "วังทองหลาง", zipcode: "10310" },
    { subdistrict: "คลองเจ้าคุณสิงห์", district: "วังทองหลาง", zipcode: "10310" },
    { subdistrict: "พลับพลา", district: "วังทองหลาง", zipcode: "10310" },
    { subdistrict: "สามวาตะวันตก", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "สามวาตะวันออก", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "บางชัน", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "ทรายกองดิน", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "ทรายกองดินใต้", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "กระทุ่มราย", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "หนองจอก", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "คลองสิบ", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "คลองสิบสอง", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "โคกแฝด", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "คู้ฝ้าย", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "คลองสิบสี่", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "พระบรมมหาราชวัง", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "วังบูรพาภิรมย์", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "วัดราชบพิธ", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "สำราญราษฎร์", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "ศาลเจ้าพ่อเสือ", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "เสาชิงช้า", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "บวรนิเวศน์", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "ตลาดยอด", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "ชนะสงคราม", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "บ้านพานถม", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "บางขุนพรหม", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "วัดสามพระยา", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "ดุสิต", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "วชิรพยาบาล", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "สวนจิตรลดา", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "สี่แยกมหานาค", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "ถนนนครไชยศรี", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "ป้อมปราบ", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "วัดเทพศิรินทร์", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "คลองมหานาค", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "บ้านบาตร", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "วัดโสมนัส", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "วัดกัลยาณ์", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "หิรัญรูจี", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "บางยี่เรือ", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "บุคคโล", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "ตลาดพลู", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "ดาวคะนอง", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "สำเหร่", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "วัดอรุณ", district: "บางกอกใหญ่", zipcode: "10600" },
    { subdistrict: "วัดท่าพระ", district: "บางกอกใหญ่", zipcode: "10600" },
    { subdistrict: "สมเด็จเจ้าพระยา", district: "คลองสาน", zipcode: "10600" },
    { subdistrict: "คลองสาน", district: "คลองสาน", zipcode: "10600" },
    { subdistrict: "บางลำภูล่าง", district: "คลองสาน", zipcode: "10600" },
    { subdistrict: "คลองต้นไทร", district: "คลองสาน", zipcode: "10600" },
    { subdistrict: "คลองชักพระ", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "ตลิ่งชัน", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "ฉิมพลี", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "บางพรม", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "บางระมาด", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "บางเชือกหนัง", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "ศิริราช", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "บ้านช่างหล่อ", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "บางขุนนนท์", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "บางขุนศรี", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "อรุณอมรินทร์", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "ท่าข้าม", district: "บางขุนเทียน", zipcode: "10150" },
    { subdistrict: "แสมดำ", district: "บางขุนเทียน", zipcode: "10150" },
    { subdistrict: "บางหว้า", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "บางด้วน", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "บางจาก", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "บางแวก", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "คลองขวาง", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "ปากคลองภาษีเจริญ", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "หนองแขม", district: "หนองแขม", zipcode: "10160" },
    { subdistrict: "หนองค้างพลู", district: "หนองแขม", zipcode: "10160" },
    { subdistrict: "ราษฎร์บูรณะ", district: "ราษฎร์บูรณะ", zipcode: "10140" },
    { subdistrict: "บางปะกอก", district: "ราษฎร์บูรณะ", zipcode: "10140" },
    { subdistrict: "บางพลัด", district: "บางพลัด", zipcode: "10700" },
    { subdistrict: "บางอ้อ", district: "บางพลัด", zipcode: "10700" },
    { subdistrict: "บางบำหรุ", district: "บางพลัด", zipcode: "10700" },
    { subdistrict: "บางยี่ขัน", district: "บางพลัด", zipcode: "10700" },
    { subdistrict: "ทุ่งมหาเมฆ", district: "สาทร", zipcode: "10120" },
    { subdistrict: "ยานนาวา", district: "สาทร", zipcode: "10120" },
    { subdistrict: "ทุ่งวัดดอน", district: "สาทร", zipcode: "10120" },
    { subdistrict: "บางแค", district: "บางแค", zipcode: "10160" },
    { subdistrict: "บางแคเหนือ", district: "บางแค", zipcode: "10160" },
    { subdistrict: "บางไผ่", district: "บางแค", zipcode: "10160" },
    { subdistrict: "หลักสอง", district: "บางแค", zipcode: "10160" },
    { subdistrict: "ทวีวัฒนา", district: "ทวีวัฒนา", zipcode: "10170" },
    { subdistrict: "ศาลาธรรมสพน์", district: "ทวีวัฒนา", zipcode: "10170" },
    { subdistrict: "บางมด", district: "ทุ่งครุ", zipcode: "10140" },
    { subdistrict: "ทุ่งครุ", district: "ทุ่งครุ", zipcode: "10140" },
    { subdistrict: "บางบอนเหนือ", district: "บางบอน", zipcode: "10150" },
    { subdistrict: "บางบอนใต้", district: "บางบอน", zipcode: "10150" },
    { subdistrict: "คลองบางพราน", district: "บางบอน", zipcode: "10150" },
    { subdistrict: "คลองบางบอน", district: "บางบอน", zipcode: "10150" }
  ];

  // State Object
  let formData = {
    applicant_type: '',
    patient_name: '',
    patient_id: '',
    health_coverage: '',
    contact_phone: '',
    district: '',
    subdistrict: '',
    zipcode: '',
    patient_address_detail: '',
    patient_address: '',
    latitude: null,
    longitude: null,
    health_conditions: [],
    diaper_size: '',
    self_care_status: '',
    caregiver_name: '',
    caregiver_phone: '',
    attachments: []
  };

  // DOM Elements
  const stepCards = document.querySelectorAll('.step-card');
  const progressBar = document.getElementById('progressBar');
  const stepIndicator = document.getElementById('stepIndicator');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnGetLocation = document.getElementById('btnGetLocation');
  const btnToggleFullscreenMap = document.getElementById('btnToggleFullscreenMap');
  const mapSearchInput = document.getElementById('mapSearchInput');
  const btnSearchMap = document.getElementById('btnSearchMap');
  const coordsDisplay = document.getElementById('coordsDisplay');
  const bkkAddressSearch = document.getElementById('bkkAddressSearch');
  const bkkAddressSuggestions = document.getElementById('bkkAddressSuggestions');
  const selectedAddressBadge = document.getElementById('selectedAddressBadge');
  const geocodeNotification = document.getElementById('geocodeNotification');
  const patientAddressDetail = document.getElementById('patient_address_detail');
  const fileUpload = document.getElementById('fileUpload');
  const filePreviewList = document.getElementById('filePreviewList');
  const reviewSummaryGrid = document.getElementById('reviewSummaryGrid');
  const payloadModal = document.getElementById('payloadModal');
  const payloadJsonDisplay = document.getElementById('payloadJsonDisplay');
  const btnCopyPayload = document.getElementById('btnCopyPayload');
  const patientIdInput = document.getElementById('patient_id');
  const idValidationMsg = document.getElementById('idValidationMsg');

  // Accessibility Font Size Toggle
  document.querySelectorAll('.btn-font-size').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-font-size').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const size = btn.dataset.size;
      document.body.setAttribute('data-font-size', size);
    });
  });

  // BKK Address Autocomplete Engine (Focus & Click Suggestions Support)
  if (bkkAddressSearch) {
    function renderSuggestions(matches, headerTitle = '') {
      if (matches.length > 0) {
        bkkAddressSuggestions.innerHTML = '';
        if (headerTitle) {
          const header = document.createElement('div');
          header.className = 'suggestion-header';
          header.textContent = headerTitle;
          bkkAddressSuggestions.appendChild(header);
        }
        matches.forEach(item => {
          const div = document.createElement('div');
          div.className = 'suggestion-item';
          div.innerHTML = `แขวง<b>${item.subdistrict}</b> » เขต<b>${item.district}</b> » ${item.zipcode}`;
          div.addEventListener('click', () => selectBkkAddress(item));
          bkkAddressSuggestions.appendChild(div);
        });
        bkkAddressSuggestions.style.display = 'block';
      } else {
        bkkAddressSuggestions.style.display = 'none';
      }
    }

    // Show initial top recommendations on click / focus before typing
    bkkAddressSearch.addEventListener('focus', () => {
      if (!bkkAddressSearch.value.trim()) {
        renderSuggestions(bkkSubdistrictList.slice(0, 8), '💡 ตัวเลือกแขวง/เขตยอดนิยมใน กทม.:');
      }
    });

    bkkAddressSearch.addEventListener('click', () => {
      if (!bkkAddressSearch.value.trim()) {
        renderSuggestions(bkkSubdistrictList.slice(0, 8), '💡 ตัวเลือกแขวง/เขตยอดนิยมใน กทม.:');
      }
    });

    bkkAddressSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        renderSuggestions(bkkSubdistrictList.slice(0, 8), '💡 ตัวเลือกแขวง/เขตยอดนิยมใน กทม.:');
        return;
      }
      const matches = bkkSubdistrictList.filter(item => 
        item.subdistrict.toLowerCase().includes(q) || 
        item.district.toLowerCase().includes(q) ||
        item.zipcode.includes(q)
      ).slice(0, 8);

      renderSuggestions(matches);
    });

    document.addEventListener('click', (e) => {
      if (!bkkAddressSearch.contains(e.target) && !bkkAddressSuggestions.contains(e.target)) {
        bkkAddressSuggestions.style.display = 'none';
      }
    });

    patientAddressDetail.addEventListener('input', () => {
      formData.patient_address_detail = patientAddressDetail.value.trim();
      updateFullAddressText();
      checkCurrentStepValidity();
      saveDraft();
    });
  }

  function selectBkkAddress(item) {
    formData.subdistrict = item.subdistrict;
    formData.district = item.district;
    formData.zipcode = item.zipcode;
    bkkAddressSearch.value = `แขวง${item.subdistrict} เขต${item.district} ${item.zipcode}`;
    bkkAddressSuggestions.style.display = 'none';
    selectedAddressBadge.innerHTML = `✅ เลือกแล้ว: <b>แขวง${item.subdistrict} เขต${item.district} ${item.zipcode}</b>`;
    selectedAddressBadge.style.display = 'block';
    updateFullAddressText();
    checkCurrentStepValidity();
    saveDraft();
  }

  function updateFullAddressText() {
    const detail = formData.patient_address_detail || '';
    const sub = formData.subdistrict ? ` แขวง${formData.subdistrict}` : '';
    const dist = formData.district ? ` เขต${formData.district}` : '';
    const zip = formData.zipcode ? ` ${formData.zipcode}` : '';
    formData.patient_address = `${detail}${sub}${dist} กรุงเทพมหานคร${zip}`.trim();
  }

  // Restore Draft from LocalStorage
  function restoreDraft() {
    const saved = localStorage.getItem('bkk_careplan_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        formData = { ...formData, ...parsed };
        populateUI();
      } catch (e) {
        console.error('Failed to restore draft', e);
      }
    }
  }

  // Save Draft to LocalStorage
  function saveDraft() {
    localStorage.setItem('bkk_careplan_draft', JSON.stringify(formData));
  }

  // Populate UI inputs from State
  function populateUI() {
    if (formData.applicant_type) {
      const radio = document.querySelector(`input[name="applicant_type"][value="${formData.applicant_type}"]`);
      if (radio) radio.checked = true;
    }
    if (formData.patient_name) document.getElementById('patient_name').value = formData.patient_name;
    if (formData.patient_id) document.getElementById('patient_id').value = formatThaiIDString(formData.patient_id);
    if (formData.health_coverage) {
      const radio = document.querySelector(`input[name="health_coverage"][value="${formData.health_coverage}"]`);
      if (radio) radio.checked = true;
    }
    if (formData.contact_phone) document.getElementById('contact_phone').value = formData.contact_phone;
    
    if (formData.subdistrict && formData.district && bkkAddressSearch) {
      bkkAddressSearch.value = `แขวง${formData.subdistrict} เขต${formData.district} ${formData.zipcode || ''}`;
      selectedAddressBadge.innerHTML = `✅ เลือกแล้ว: <b>แขวง${formData.subdistrict} เขต${formData.district} ${formData.zipcode || ''}</b>`;
      selectedAddressBadge.style.display = 'block';
    }
    if (formData.patient_address_detail) patientAddressDetail.value = formData.patient_address_detail;

    if (formData.health_conditions && formData.health_conditions.length) {
      formData.health_conditions.forEach(val => {
        const cb = document.querySelector(`input[name="health_condition"][value="${val}"]`);
        if (cb) cb.checked = true;
      });
    }
    if (formData.diaper_size) {
      const radio = document.querySelector(`input[name="diaper_size"][value="${formData.diaper_size}"]`);
      if (radio) radio.checked = true;
    }
    if (formData.self_care_status) {
      const radio = document.querySelector(`input[name="self_care_status"][value="${formData.self_care_status}"]`);
      if (radio) radio.checked = true;
    }
    if (formData.caregiver_name) document.getElementById('caregiver_name').value = formData.caregiver_name;
    if (formData.caregiver_phone) document.getElementById('caregiver_phone').value = formData.caregiver_phone;
  }

  // Thai Citizen ID Mask Formatting
  function formatThaiIDString(val) {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    let formatted = '';
    if (digits.length > 0) formatted += digits.substring(0, 1);
    if (digits.length > 1) formatted += '-' + digits.substring(1, 5);
    if (digits.length > 5) formatted += '-' + digits.substring(5, 10);
    if (digits.length > 10) formatted += '-' + digits.substring(10, 12);
    if (digits.length > 12) formatted += '-' + digits.substring(12, 13);
    return formatted;
  }

  if (patientIdInput) {
    patientIdInput.addEventListener('input', (e) => {
      const formatted = formatThaiIDString(e.target.value);
      e.target.value = formatted;
      formData.patient_id = formatted.replace(/\D/g, '');
      checkCurrentStepValidity();
      saveDraft();
    });
  }

  function validateThaiID(idDigits) {
    if (!/^\d{13}$/.test(idDigits)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(idDigits.charAt(i)) * (13 - i);
    }
    const check = (11 - (sum % 11)) % 10;
    return check === parseInt(idDigits.charAt(12));
  }

  // Initialize Leaflet Draggable Map & Reverse Geocoding
  function initLeafletMap() {
    if (leafletMap) {
      setTimeout(() => leafletMap.invalidateSize(), 200);
      return;
    }

    const defaultLat = formData.latitude || 13.7563;
    const defaultLng = formData.longitude || 100.5018;

    leafletMap = L.map('map', { touchZoom: true, scrollWheelZoom: false }).setView([defaultLat, defaultLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(leafletMap);

    leafletMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(leafletMap);

    if (formData.latitude && formData.longitude) {
      updateCoordsDisplay(formData.latitude, formData.longitude);
    }

    leafletMarker.on('dragend', function (e) {
      const pos = leafletMarker.getLatLng();
      setCoordsAndReverseGeocode(pos.lat, pos.lng);
    });

    leafletMap.on('click', function (e) {
      leafletMarker.setLatLng(e.latlng);
      setCoordsAndReverseGeocode(e.latlng.lat, e.latlng.lng);
    });
  }

  function setCoordsAndReverseGeocode(lat, lng) {
    formData.latitude = lat;
    formData.longitude = lng;
    updateCoordsDisplay(lat, lng);
    checkCurrentStepValidity();
    saveDraft();

    // Reverse Geocoding to auto-fill BKK District/Subdistrict
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`)
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          const rawAddr = JSON.stringify(data.address);
          const matched = bkkSubdistrictList.find(item => 
            rawAddr.includes(item.subdistrict) || rawAddr.includes(item.district)
          );
          if (matched) {
            selectBkkAddress(matched);
            geocodeNotification.style.display = 'block';
          }
        }
      })
      .catch(err => console.log('Reverse geocode skip', err));
  }

  function updateCoordsDisplay(lat, lng) {
    coordsDisplay.textContent = `📍 พิกัด: Lat ${lat.toFixed(5)}, Lon ${lng.toFixed(5)}`;
    coordsDisplay.classList.add('active');
  }

  // Map Fullscreen Toggle
  const btnCloseFullscreenMap = document.getElementById('btnCloseFullscreenMap');

  function toggleFullscreenMap() {
    const mapContainer = document.getElementById('map');
    isMapFullscreen = !isMapFullscreen;
    if (isMapFullscreen) {
      mapContainer.classList.add('fullscreen');
      btnToggleFullscreenMap.textContent = '❌ ย่อแผนที่กลับ';
      if (btnCloseFullscreenMap) btnCloseFullscreenMap.style.display = 'block';
    } else {
      mapContainer.classList.remove('fullscreen');
      btnToggleFullscreenMap.textContent = '🔍 ขยายแผนที่เต็มจอ';
      if (btnCloseFullscreenMap) btnCloseFullscreenMap.style.display = 'none';
    }
    setTimeout(() => leafletMap.invalidateSize(), 200);
  }

  if (btnToggleFullscreenMap) {
    btnToggleFullscreenMap.addEventListener('click', toggleFullscreenMap);
  }

  if (btnCloseFullscreenMap) {
    btnCloseFullscreenMap.addEventListener('click', toggleFullscreenMap);
  }

  // Search Map Location via OpenStreetMap Nominatim API
  if (btnSearchMap && mapSearchInput) {
    btnSearchMap.addEventListener('click', () => {
      const query = mapSearchInput.value.trim();
      if (!query) return;
      btnSearchMap.textContent = '⏳ ค้นหา...';
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' กรุงเทพมหานคร')}`)
        .then(res => res.json())
        .then(data => {
          btnSearchMap.textContent = 'ค้นหา';
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            leafletMap.setView([lat, lon], 16);
            leafletMarker.setLatLng([lat, lon]);
            setCoordsAndReverseGeocode(lat, lon);
          } else {
            alert('ไม่พบสถานที่ดังกล่าว กรุณาลองค้นหาด้วยชื่อถนนหรือสถานที่สำคัญใกล้เคียง');
          }
        })
        .catch(err => {
          btnSearchMap.textContent = 'ค้นหา';
          alert('เกิดข้อผิดพลาดในการเชื่อมต่อค้นหาแผนที่');
        });
    });
  }

  // Geolocation Handler
  if (btnGetLocation) {
    btnGetLocation.addEventListener('click', () => {
      if ('geolocation' in navigator) {
        btnGetLocation.textContent = '⏳ กำลังหาตำแหน่ง...';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setCoordsAndReverseGeocode(lat, lng);
            if (leafletMap && leafletMarker) {
              leafletMap.setView([lat, lng], 16);
              leafletMarker.setLatLng([lat, lng]);
            }
            btnGetLocation.innerHTML = '🎯 ดึงตำแหน่ง GPS ปัจจุบัน';
          },
          (err) => {
            alert('ไม่สามารถดึงพิกัดได้ กรุณาอนุญาตตำแหน่ง หรือค้นหา/ลากหมุดบนแผนที่');
            btnGetLocation.innerHTML = '🎯 ดึงตำแหน่ง GPS ปัจจุบัน';
          }
        );
      } else {
        alert('อุปกรณ์นี้ไม่รองรับ Geolocation กรุณาลากหมุดบนแผนที่');
      }
    });
  }

  // File Upload Preview
  if (fileUpload) {
    fileUpload.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          formData.attachments.push({ name: file.name, url: event.target.result });
          renderFilePreviews();
          saveDraft();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function renderFilePreviews() {
    filePreviewList.innerHTML = '';
    formData.attachments.forEach(att => {
      const img = document.createElement('img');
      img.src = att.url;
      img.className = 'file-thumb';
      filePreviewList.appendChild(img);
    });
  }

  // Check validity for current step & disable/enable Next button
  function checkCurrentStepValidity() {
    let isValid = false;

    if (currentStep === 1) {
      isValid = !!document.querySelector('input[name="applicant_type"]:checked');
    } else if (currentStep === 2) {
      const cbs = document.querySelectorAll('input[name="health_condition"]:checked');
      isValid = cbs.length > 0;
    } else if (currentStep === 3) {
      isValid = true; // Recommended step
    } else if (currentStep === 4) {
      isValid = formData.latitude !== null && formData.longitude !== null;
    } else if (currentStep === 5) {
      isValid = !!formData.district && !!formData.subdistrict && !!formData.patient_address_detail;
    } else if (currentStep === 6) {
      isValid = document.getElementById('patient_name').value.trim().length > 0;
    } else if (currentStep === 7) {
      const idDigits = formData.patient_id;
      isValid = validateThaiID(idDigits);
      if (idDigits.length === 13) {
        if (isValid) {
          idValidationMsg.textContent = '✓ เลขบัตรประชาชนถูกต้อง';
          idValidationMsg.classList.remove('error');
        } else {
          idValidationMsg.textContent = '❌ เลขบัตรประชาชนไม่ถูกต้อง';
          idValidationMsg.classList.add('error');
        }
      } else {
        idValidationMsg.textContent = 'ป้อนตัวเลขให้ครบ 13 หลัก';
        idValidationMsg.classList.remove('error');
      }
    } else if (currentStep === 8) {
      isValid = !!document.querySelector('input[name="health_coverage"]:checked');
    } else if (currentStep === 9) {
      const phone = document.getElementById('contact_phone').value.trim();
      isValid = phone.length >= 9;
    } else if (currentStep === 10) {
      isValid = !!document.querySelector('input[name="self_care_status"]:checked');
    } else if (currentStep === 11) {
      const name = document.getElementById('caregiver_name').value.trim();
      const phone = document.getElementById('caregiver_phone').value.trim();
      isValid = name.length > 0 && phone.length >= 9;
    } else if (currentStep === 12) {
      isValid = true; // Optional step
    } else if (currentStep === 13) {
      isValid = true; // Review step
    }

    btnNext.disabled = !isValid;
    return isValid;
  }

  // Save current step data into state
  function syncCurrentStepData() {
    if (currentStep === 1) {
      const sel = document.querySelector('input[name="applicant_type"]:checked');
      if (sel) formData.applicant_type = sel.value;
    } else if (currentStep === 2) {
      formData.health_conditions = Array.from(document.querySelectorAll('input[name="health_condition"]:checked')).map(cb => cb.value);
    } else if (currentStep === 3) {
      const sel = document.querySelector('input[name="diaper_size"]:checked');
      if (sel) formData.diaper_size = sel.value;
    } else if (currentStep === 5) {
      updateFullAddressText();
    } else if (currentStep === 6) {
      formData.patient_name = document.getElementById('patient_name').value.trim();
    } else if (currentStep === 7) {
      formData.patient_id = patientIdInput.value.replace(/\D/g, '');
    } else if (currentStep === 8) {
      const sel = document.querySelector('input[name="health_coverage"]:checked');
      if (sel) formData.health_coverage = sel.value;
    } else if (currentStep === 9) {
      formData.contact_phone = document.getElementById('contact_phone').value.trim();
    } else if (currentStep === 10) {
      const sel = document.querySelector('input[name="self_care_status"]:checked');
      if (sel) formData.self_care_status = sel.value;
    } else if (currentStep === 11) {
      formData.caregiver_name = document.getElementById('caregiver_name').value.trim();
      formData.caregiver_phone = document.getElementById('caregiver_phone').value.trim();
    }
    saveDraft();
  }

  // Real-time input listeners to enable/disable Next button
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      syncCurrentStepData();
      checkCurrentStepValidity();
    });
    el.addEventListener('change', () => {
      syncCurrentStepData();
      checkCurrentStepValidity();
    });
  });

  // Advance to Next Step
  function goNextStep() {
    syncCurrentStepData();
    if (!checkCurrentStepValidity()) return;

    if (currentStep === 10 && formData.self_care_status === 'self') {
      currentStep = 12;
    } else if (currentStep < TOTAL_STEPS) {
      currentStep++;
    } else {
      submitPayload();
      return;
    }
    updateStepUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Go to Previous Step
  function goPrevStep() {
    if (currentStep === 12 && formData.self_care_status === 'self') {
      currentStep = 10;
    } else if (currentStep > 1) {
      currentStep--;
    }
    updateStepUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Jump to specific step from Review edit buttons
  window.jumpToStep = function(stepNum) {
    currentStep = stepNum;
    updateStepUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update UI Step Visibility & Progress
  function updateStepUI() {
    stepCards.forEach(card => {
      const step = parseInt(card.dataset.step);
      if (step === currentStep) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Initialize Map if on Step 4
    if (currentStep === 4) {
      setTimeout(initLeafletMap, 150);
    }

    // Update Progress Bar
    const pct = Math.round((currentStep / TOTAL_STEPS) * 100);
    progressBar.style.width = `${pct}%`;
    stepIndicator.textContent = currentStep === TOTAL_STEPS ? `ขั้นตอนสุดท้าย` : `ข้อที่ ${currentStep} / ${TOTAL_STEPS - 1}`;

    // Prev Button Visibility
    btnPrev.style.display = currentStep === 1 ? 'none' : 'inline-block';

    // Next / Submit Button Text
    if (currentStep === TOTAL_STEPS) {
      btnNext.textContent = 'ยืนยันและส่งเรื่อง 🚀';
      renderUXReviewSummary();
    } else {
      btnNext.textContent = 'ถัดไป →';
    }

    checkCurrentStepValidity();
  }

  // Render UX-Optimized Categorized Review Cards (Step 13)
  function renderUXReviewSummary() {
    const isPatient = formData.applicant_type === 'patient';
    const condLabels = formData.health_conditions.map(c => c === 'bedridden' ? 'ผู้ป่วยติดเตียง' : 'กลั้นขับถ่ายไม่ได้').join(', ');
    const isSelfCare = formData.self_care_status === 'self';

    reviewSummaryGrid.innerHTML = `
      <!-- Card 1: Medical & Eligibility -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">🩺 สิทธิและสภาวะความต้องการ</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(2)">แก้ไข</button>
        </div>
        <div class="review-data-row">
          <span class="review-label">สภาวะสุขภาพ:</span>
          <span class="review-value">${condLabels || '-'}</span>
        </div>
        <div class="review-data-row">
          <span class="review-label">ไซส์ผ้าอ้อม:</span>
          <span class="review-value">${formData.diaper_size || 'ไม่ระบุ'}</span>
        </div>
        <div class="review-data-row">
          <span class="review-label">สิทธิการรักษาหลัก:</span>
          <span class="review-value">${formData.health_coverage || '-'}</span>
        </div>
      </div>

      <!-- Card 2: Location & Address -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">📍 ที่อยู่และพิกัดจัดส่ง (Auto-filled)</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(4)">แก้ไข</button>
        </div>
        <div class="review-data-row">
          <span class="review-label">ที่อยู่ กทม.:</span>
          <span class="review-value">${formData.patient_address || '-'}</span>
        </div>
        <div class="review-data-row">
          <span class="review-label">พิกัด GPS:</span>
          <span class="review-value">${formData.latitude ? `Lat ${formData.latitude.toFixed(4)}, Lon ${formData.longitude.toFixed(4)}` : 'ไม่ได้ระบุ'}</span>
        </div>
      </div>

      <!-- Card 3: Patient & Caregiver Info -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">👤 ข้อมูลผู้ขอรับสิทธิและผู้ดูแล</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(6)">แก้ไข</button>
        </div>
        <div class="review-data-row">
          <span class="review-label">ชื่อผู้ป่วย:</span>
          <span class="review-value">${formData.patient_name || '-'}</span>
        </div>
        <div class="review-data-row">
          <span class="review-label">เลขบัตรประชาชน:</span>
          <span class="review-value">${formatThaiIDString(formData.patient_id) || '-'}</span>
        </div>
        <div class="review-data-row">
          <span class="review-label">เบอร์ติดต่อผู้ป่วย:</span>
          <span class="review-value">${formData.contact_phone || '-'}</span>
        </div>
        <div class="review-data-row">
          <span class="review-label">การดูแลตัวเอง:</span>
          <span class="review-value">${isSelfCare ? 'ดูแลตัวเองได้' : 'มีผู้ดูแลช่วยเหลือ'}</span>
        </div>
        ${!isSelfCare ? `
        <div class="review-data-row">
          <span class="review-label">ชื่อผู้ดูแล:</span>
          <span class="review-value">${formData.caregiver_name} (${formData.caregiver_phone})</span>
        </div>` : ''}
      </div>

      <!-- Card 4: Attachments -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">📷 หลักฐานประกอบ</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(12)">แก้ไข</button>
        </div>
        <div class="review-data-row">
          <span class="review-label">จำนวนรูปภาพแนบ:</span>
          <span class="review-value">${formData.attachments.length} ไฟล์</span>
        </div>
      </div>
    `;
  }

  // Submit Final Payload
  function submitPayload() {
    const payload = {
      request_timestamp: new Date().toISOString(),
      source: "bkk_careplan_traffy_fondue_webview",
      applicant_type: formData.applicant_type,
      patient_info: {
        fullname: formData.patient_name,
        id_card: formData.patient_id,
        health_coverage: formData.health_coverage
      },
      contact_info: {
        phone: formData.contact_phone,
        district: formData.district,
        subdistrict: formData.subdistrict,
        zipcode: formData.zipcode,
        address_detail: formData.patient_address_detail,
        full_address: formData.patient_address,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude
        }
      },
      medical_conditions: {
        is_bedridden: formData.health_conditions.includes('bedridden'),
        has_incontinence: formData.health_conditions.includes('incontinence'),
        preferred_diaper_size: formData.diaper_size
      },
      caregiver_info: {
        is_self_care: formData.self_care_status === 'self',
        fullname: formData.self_care_status === 'self' ? '' : formData.caregiver_name,
        phone: formData.self_care_status === 'self' ? '' : formData.caregiver_phone
      },
      attachments_count: formData.attachments.length
    };

    payloadJsonDisplay.textContent = JSON.stringify(payload, null, 2);
    payloadModal.classList.add('active');

    // Clear local storage draft after successful submit
    localStorage.removeItem('bkk_careplan_draft');
  }

  // Copy JSON Payload Handler
  if (btnCopyPayload) {
    btnCopyPayload.addEventListener('click', () => {
      navigator.clipboard.writeText(payloadJsonDisplay.textContent).then(() => {
        btnCopyPayload.textContent = '✓ คัดลอกเรียบร้อย!';
        setTimeout(() => btnCopyPayload.textContent = 'ก๊อปปี้ JSON', 2000);
      });
    });
  }

  // Navigation Button Handlers
  btnNext.addEventListener('click', () => goNextStep());
  btnPrev.addEventListener('click', () => goPrevStep());

  // Init
  restoreDraft();
  updateStepUI();
});
