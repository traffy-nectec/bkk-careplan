document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_STEPS = 11;
  let currentStep = 1;
  let leafletMap = null;
  let leafletMarker = null;
  let isMapFullscreen = false;
  let hasPassedLocationGate = false;

  // LIFF Configuration & State
  const LIFF_ID = '2000158432-95uKB5EW'; // Actual LINE LIFF ID
  const GATEWAY_API_URL = window.GATEWAY_API_URL || 'https://liff-form-gateway-884122932397.asia-southeast1.run.app/'; // Production Cloud Run URL
  let lineProfile = null;

  async function initLiff() {
    if (typeof liff === 'undefined') return;
    try {
      await liff.init({ liffId: LIFF_ID });
      if (liff.isLoggedIn()) {
        lineProfile = await liff.getProfile();
        console.log('LIFF initialized & logged in:', lineProfile);
      } else {
        if (getLocationTestMode()) return;
        liff.login();
      }
    } catch (err) {
      console.warn('LIFF initialization warning/error:', err);
    }
  }

  // Bangkok 50 Districts & 180 Subdistricts Dataset (Synced with public.voice_subdistrictlist)
  const bkkSubdistrictList = [
    { subdistrict: "คลองต้นไทร", district: "คลองสาน", zipcode: "10600" },
    { subdistrict: "คลองสาน", district: "คลองสาน", zipcode: "10600" },
    { subdistrict: "บางลำภูล่าง", district: "คลองสาน", zipcode: "10600" },
    { subdistrict: "สมเด็จเจ้าพระยา", district: "คลองสาน", zipcode: "10600" },
    { subdistrict: "ทรายกองดิน", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "ทรายกองดินใต้", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "บางชัน", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "สามวาตะวันตก", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "สามวาตะวันออก", district: "คลองสามวา", zipcode: "10510" },
    { subdistrict: "คลองตัน", district: "คลองเตย", zipcode: "10110" },
    { subdistrict: "คลองเตย", district: "คลองเตย", zipcode: "10110" },
    { subdistrict: "พระโขนง", district: "คลองเตย", zipcode: "10110" },
    { subdistrict: "คันนายาว", district: "คันนายาว", zipcode: "10230" },
    { subdistrict: "รามอินทรา", district: "คันนายาว", zipcode: "10230" },
    { subdistrict: "จตุจักร", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "จอมพล", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "จันทรเกษม", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "ลาดยาว", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "เสนานิคม", district: "จตุจักร", zipcode: "10900" },
    { subdistrict: "จอมทอง", district: "จอมทอง", zipcode: "10150" },
    { subdistrict: "บางขุนเทียน", district: "จอมทอง", zipcode: "10150" },
    { subdistrict: "บางค้อ", district: "จอมทอง", zipcode: "10150" },
    { subdistrict: "บางมด", district: "จอมทอง", zipcode: "10150" },
    { subdistrict: "ดอนเมือง", district: "ดอนเมือง", zipcode: "10210" },
    { subdistrict: "สนามบิน", district: "ดอนเมือง", zipcode: "10210" },
    { subdistrict: "สีกัน", district: "ดอนเมือง", zipcode: "10210" },
    { subdistrict: "ดินแดง", district: "ดินแดง", zipcode: "10400" },
    { subdistrict: "รัชดาภิเษก", district: "ดินแดง", zipcode: "10400" },
    { subdistrict: "ดุสิต", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "ถนนนครไชยศรี", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "วชิรพยาบาล", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "สวนจิตรลดา", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "สี่แยกมหานาค", district: "ดุสิต", zipcode: "10300" },
    { subdistrict: "คลองชักพระ", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "ฉิมพลี", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "ตลิ่งชัน", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "บางพรม", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "บางระมาด", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "บางเชือกหนัง", district: "ตลิ่งชัน", zipcode: "10170" },
    { subdistrict: "ทวีวัฒนา", district: "ทวีวัฒนา", zipcode: "10170" },
    { subdistrict: "ศาลาธรรมสพน์", district: "ทวีวัฒนา", zipcode: "10170" },
    { subdistrict: "ทุ่งครุ", district: "ทุ่งครุ", zipcode: "10140" },
    { subdistrict: "บางมด", district: "ทุ่งครุ", zipcode: "10140" },
    { subdistrict: "ดาวคะนอง", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "ตลาดพลู", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "บางยี่เรือ", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "บุคคโล", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "วัดกัลยาณ์", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "สำเหร่", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "หิรัญรูจี", district: "ธนบุรี", zipcode: "10600" },
    { subdistrict: "บางขุนนนท์", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "บางขุนศรี", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "บ้านช่างหล่อ", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "ศิริราช", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "อรุณอมรินทร์", district: "บางกอกน้อย", zipcode: "10700" },
    { subdistrict: "วัดท่าพระ", district: "บางกอกใหญ่", zipcode: "10600" },
    { subdistrict: "วัดอรุณ", district: "บางกอกใหญ่", zipcode: "10600" },
    { subdistrict: "คลองจั่น", district: "บางกะปิ", zipcode: "10240" },
    { subdistrict: "หัวหมาก", district: "บางกะปิ", zipcode: "10240" },
    { subdistrict: "ท่าข้าม", district: "บางขุนเทียน", zipcode: "10150" },
    { subdistrict: "แสมดำ", district: "บางขุนเทียน", zipcode: "10150" },
    { subdistrict: "บางคอแหลม", district: "บางคอแหลม", zipcode: "10120" },
    { subdistrict: "บางโคล่", district: "บางคอแหลม", zipcode: "10120" },
    { subdistrict: "วัดพระยาไกร", district: "บางคอแหลม", zipcode: "10120" },
    { subdistrict: "บางซื่อ", district: "บางซื่อ", zipcode: "10800" },
    { subdistrict: "วงศ์สว่าง", district: "บางซื่อ", zipcode: "10800" },
    { subdistrict: "บางนาเหนือ", district: "บางนา", zipcode: "10260" },
    { subdistrict: "บางนาใต้", district: "บางนา", zipcode: "10260" },
    { subdistrict: "คลองบางบอน", district: "บางบอน", zipcode: "10150" },
    { subdistrict: "คลองบางพราน", district: "บางบอน", zipcode: "10150" },
    { subdistrict: "บางบอนเหนือ", district: "บางบอน", zipcode: "10150" },
    { subdistrict: "บางบอนใต้", district: "บางบอน", zipcode: "10150" },
    { subdistrict: "บางบำหรุ", district: "บางพลัด", zipcode: "10700" },
    { subdistrict: "บางพลัด", district: "บางพลัด", zipcode: "10700" },
    { subdistrict: "บางยี่ขัน", district: "บางพลัด", zipcode: "10700" },
    { subdistrict: "บางอ้อ", district: "บางพลัด", zipcode: "10700" },
    { subdistrict: "บางรัก", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "มหาพฤฒาราม", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "สีลม", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "สี่พระยา", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "สุริยวงศ์", district: "บางรัก", zipcode: "10500" },
    { subdistrict: "ท่าแร้ง", district: "บางเขน", zipcode: "10220" },
    { subdistrict: "อนุสาวรีย์", district: "บางเขน", zipcode: "10220" },
    { subdistrict: "บางแค", district: "บางแค", zipcode: "10160" },
    { subdistrict: "บางแคเหนือ", district: "บางแค", zipcode: "10160" },
    { subdistrict: "บางไผ่", district: "บางแค", zipcode: "10160" },
    { subdistrict: "หลักสอง", district: "บางแค", zipcode: "10160" },
    { subdistrict: "คลองกุ่ม", district: "บึงกุ่ม", zipcode: "10240" },
    { subdistrict: "นวมินทร์", district: "บึงกุ่ม", zipcode: "10240" },
    { subdistrict: "นวลจันทร์", district: "บึงกุ่ม", zipcode: "10230" },
    { subdistrict: "ปทุมวัน", district: "ปทุมวัน", zipcode: "10330" },
    { subdistrict: "รองเมือง", district: "ปทุมวัน", zipcode: "10330" },
    { subdistrict: "ลุมพินี", district: "ปทุมวัน", zipcode: "10330" },
    { subdistrict: "วังใหม่", district: "ปทุมวัน", zipcode: "10330" },
    { subdistrict: "ดอกไม้", district: "ประเวศ", zipcode: "10250" },
    { subdistrict: "ประเวศ", district: "ประเวศ", zipcode: "10250" },
    { subdistrict: "หนองบอน", district: "ประเวศ", zipcode: "10250" },
    { subdistrict: "คลองมหานาค", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "บ้านบาตร", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "ป้อมปราบ", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "วัดเทพศิรินทร์", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "วัดโสมนัส", district: "ป้อมปราบศัตรูพ่าย", zipcode: "10100" },
    { subdistrict: "พญาไท", district: "พญาไท", zipcode: "10400" },
    { subdistrict: "สามเสนใน", district: "พญาไท", zipcode: "10400" },
    { subdistrict: "ชนะสงคราม", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "ตลาดยอด", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "บวรนิเวศ", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "บางขุนพรหม", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "บ้านพานถม", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "พระบรมมหาราชวัง", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "วังบูรพาภิรมย์", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "วัดราชบพิธ", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "วัดสามพระยา", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "ศาลเจ้าพ่อเสือ", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "สำราญราษฎร์", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "เสาชิงช้า", district: "พระนคร", zipcode: "10200" },
    { subdistrict: "บางจาก", district: "พระโขนง", zipcode: "10260" },
    { subdistrict: "พระโขนงใต้", district: "พระโขนง", zipcode: "10260" },
    { subdistrict: "คลองขวาง", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "คูหาสวรรค์", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "บางจาก", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "บางด้วน", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "บางหว้า", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "บางแวก", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "ปากคลองภาษีเจริญ", district: "ภาษีเจริญ", zipcode: "10160" },
    { subdistrict: "มีนบุรี", district: "มีนบุรี", zipcode: "10510" },
    { subdistrict: "แสนแสบ", district: "มีนบุรี", zipcode: "10510" },
    { subdistrict: "ช่องนนทรี", district: "ยานนาวา", zipcode: "10120" },
    { subdistrict: "บางโพงพาง", district: "ยานนาวา", zipcode: "10120" },
    { subdistrict: "ถนนพญาไท", district: "ราชเทวี", zipcode: "10400" },
    { subdistrict: "ถนนเพชรบุรี", district: "ราชเทวี", zipcode: "10400" },
    { subdistrict: "ทุ่งพญาไท", district: "ราชเทวี", zipcode: "10400" },
    { subdistrict: "มักกะสัน", district: "ราชเทวี", zipcode: "10400" },
    { subdistrict: "บางปะกอก", district: "ราษฎร์บูรณะ", zipcode: "10140" },
    { subdistrict: "ราษฎร์บูรณะ", district: "ราษฎร์บูรณะ", zipcode: "10140" },
    { subdistrict: "ขุมทอง", district: "ลาดกระบัง", zipcode: "10520" },
    { subdistrict: "คลองสองต้นนุ่น", district: "ลาดกระบัง", zipcode: "10520" },
    { subdistrict: "คลองสามประเวศ", district: "ลาดกระบัง", zipcode: "10520" },
    { subdistrict: "ทับยาว", district: "ลาดกระบัง", zipcode: "10520" },
    { subdistrict: "ลาดกระบัง", district: "ลาดกระบัง", zipcode: "10520" },
    { subdistrict: "ลำปลาทิว", district: "ลาดกระบัง", zipcode: "10520" },
    { subdistrict: "จรเข้บัว", district: "ลาดพร้าว", zipcode: "10230" },
    { subdistrict: "ลาดพร้าว", district: "ลาดพร้าว", zipcode: "10230" },
    { subdistrict: "คลองเจ้าคุณสิงห์", district: "วังทองหลาง", zipcode: "10310" },
    { subdistrict: "พลับพลา", district: "วังทองหลาง", zipcode: "10310" },
    { subdistrict: "วังทองหลาง", district: "วังทองหลาง", zipcode: "10310" },
    { subdistrict: "สะพานสอง", district: "วังทองหลาง", zipcode: "10310" },
    { subdistrict: "คลองตันเหนือ", district: "วัฒนา", zipcode: "10110" },
    { subdistrict: "คลองเตยเหนือ", district: "วัฒนา", zipcode: "10110" },
    { subdistrict: "พระโขนงเหนือ", district: "วัฒนา", zipcode: "10110" },
    { subdistrict: "พัฒนาการ", district: "สวนหลวง", zipcode: "10250" },
    { subdistrict: "สวนหลวง", district: "สวนหลวง", zipcode: "10250" },
    { subdistrict: "อ่อนนุช", district: "สวนหลวง", zipcode: "10250" },
    { subdistrict: "ทับช้าง", district: "สะพานสูง", zipcode: "10250" },
    { subdistrict: "ราษฎร์พัฒนา", district: "สะพานสูง", zipcode: "10240" },
    { subdistrict: "สะพานสูง", district: "สะพานสูง", zipcode: "10240" },
    { subdistrict: "จักรวรรดิ", district: "สัมพันธวงศ์", zipcode: "10100" },
    { subdistrict: "ตลาดน้อย", district: "สัมพันธวงศ์", zipcode: "10100" },
    { subdistrict: "สัมพันธวงศ์", district: "สัมพันธวงศ์", zipcode: "10100" },
    { subdistrict: "ทุ่งมหาเมฆ", district: "สาทร", zipcode: "10120" },
    { subdistrict: "ทุ่งวัดดอน", district: "สาทร", zipcode: "10120" },
    { subdistrict: "ยานนาวา", district: "สาทร", zipcode: "10120" },
    { subdistrict: "คลองถนน", district: "สายไหม", zipcode: "10220" },
    { subdistrict: "สายไหม", district: "สายไหม", zipcode: "10220" },
    { subdistrict: "ออเงิน", district: "สายไหม", zipcode: "10220" },
    { subdistrict: "กระทุ่มราย", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "คลองสิบ", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "คลองสิบสอง", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "คู้ฝั่งเหนือ", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "ลำต้อยติ่ง", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "ลำผักชี", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "หนองจอก", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "โคกแฝด", district: "หนองจอก", zipcode: "10530" },
    { subdistrict: "หนองค้างพลู", district: "หนองแขม", zipcode: "10160" },
    { subdistrict: "หนองแขม", district: "หนองแขม", zipcode: "10160" },
    { subdistrict: "ตลาดบางเขน", district: "หลักสี่", zipcode: "10210" },
    { subdistrict: "ทุ่งสองห้อง", district: "หลักสี่", zipcode: "10210" },
    { subdistrict: "บางกะปิ", district: "ห้วยขวาง", zipcode: "10310" },
    { subdistrict: "สามเสนนอก", district: "ห้วยขวาง", zipcode: "10310" },
    { subdistrict: "ห้วยขวาง", district: "ห้วยขวาง", zipcode: "10310" }
  ];

  // State Object
  let formData = {
    applicant_type: '',
    patient_name: '',
    patient_id: '',
    health_condition: '',
    medical_certs: [],
    latitude: null,
    longitude: null,
    district: '',
    subdistrict: '',
    zipcode: '',
    patient_address_detail: '',
    patient_address_landmark: '',
    patient_address: '',
    contact_phone: '',
    caregiver_name: '',
    caregiver_phone: '',
    attachments: []
  };
  window.formData = formData;

  // DOM Elements
  const stepCards = document.querySelectorAll('.step-card');
  const progressBar = document.getElementById('progressBar');
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
  const patientAddressLandmark = document.getElementById('patient_address_landmark');
  const medicalCertUpload = document.getElementById('medicalCertUpload');
  const medCertPreviewList = document.getElementById('medCertPreviewList');
  const fileUpload = document.getElementById('fileUpload');
  const filePreviewList = document.getElementById('filePreviewList');
  const actionFooter = document.getElementById('actionFooter');
  const progressBarContainer = document.getElementById('progressBarContainer');
  const diaperForm = document.getElementById('diaperForm');
  const locationGate = document.getElementById('locationGate');
  const locationOutsideState = document.getElementById('locationOutsideState');
  const locationErrorState = document.getElementById('locationErrorState');
  const locationErrorMessage = document.getElementById('locationErrorMessage');
  const locationPermissionHelp = document.getElementById('locationPermissionHelp');
  const locationPermissionRealHelp = document.getElementById('locationPermissionRealHelp');
  const locationPermissionHelpTitle = document.getElementById('locationPermissionHelpTitle');
  const locationPermissionHelpPrimary = document.getElementById('locationPermissionHelpPrimary');
  const locationPermissionHelpSecondary = document.getElementById('locationPermissionHelpSecondary');
  const locationPermissionTestHelp = document.getElementById('locationPermissionTestHelp');
  const btnCloseLocationError = document.getElementById('btnCloseLocationError');
  const btnRetryServiceLocation = document.getElementById('btnRetryServiceLocation');
  const btnContinueOutside = document.getElementById('btnContinueOutside');
  const btnFinishLiff = document.getElementById('btnFinishLiff');
  const patientIdInput = document.getElementById('patient_id');
  const idValidationMsg = document.getElementById('idValidationMsg');
  const caregiverBadge = document.getElementById('caregiverBadge');
  const caregiverDesc = document.getElementById('caregiverDesc');

  // Accessibility Font Size Toggle
  document.querySelectorAll('.btn-font-size').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-font-size').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const size = btn.dataset.size;
      document.body.setAttribute('data-font-size', size);
    });
  });

  // Required current-location check before entering the form
  function showLocationGateState(activeState) {
    if (locationGate) {
      locationGate.hidden = false;
      locationGate.classList.remove('is-hidden');
    }
    [locationOutsideState, locationErrorState].forEach(state => {
      if (state) {
        const shouldHide = state !== activeState;
        state.hidden = shouldHide;
        state.classList.toggle('is-hidden', shouldHide);
      }
    });
  }

  function setLocationChecking(isChecking) {
    if (btnRetryServiceLocation) {
      btnRetryServiceLocation.disabled = isChecking;
      btnRetryServiceLocation.textContent = isChecking
        ? '⏳ กำลังตรวจสอบตำแหน่ง...'
        : 'ลองตรวจสอบอีกครั้ง';
    }
  }

  function isBangkokLocation(data) {
    if (!data || !data.address) return false;
    const address = data.address;
    const isoCode = address['ISO3166-2-lvl4'] || address['ISO3166-2-lvl3'] || '';
    if (isoCode.toUpperCase() === 'TH-10') return true;

    const administrativeArea = [
      address.city,
      address.state,
      address.province,
      address.municipality,
      address.county,
      address.city_district
    ].filter(Boolean).join(' ').toLowerCase();

    return administrativeArea.includes('กรุงเทพมหานคร')
      || administrativeArea.includes('กรุงเทพฯ')
      || administrativeArea.includes('bangkok')
      || administrativeArea.includes('krung thep maha nakhon');
  }

  function enterFormFlow() {
    hasPassedLocationGate = true;
    if (locationGate) {
      locationGate.hidden = true;
      locationGate.classList.add('is-hidden');
    }
    if (diaperForm) {
      diaperForm.hidden = false;
      diaperForm.classList.remove('is-hidden');
    }
    if (progressBarContainer) {
      progressBarContainer.hidden = false;
      progressBarContainer.classList.remove('is-hidden');
    }
    if (actionFooter) {
      actionFooter.hidden = false;
      actionFooter.classList.remove('is-hidden');
    }
    updateStepUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function isIOSDevice() {
    if (typeof liff !== 'undefined' && typeof liff.getOS === 'function') {
      try {
        if (liff.getOS() === 'ios') return true;
      } catch (err) {
        console.warn('Unable to detect OS from LIFF:', err);
      }
    }

    return /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function showLocationError(message, isPermissionDenied = false, isTestMode = false) {
    const isIOSPermissionDenied = isPermissionDenied && !isTestMode && isIOSDevice();
    setLocationChecking(false);
    if (locationErrorMessage) {
      locationErrorMessage.textContent = isIOSPermissionDenied
        ? 'ไม่สามารถดำเนินการต่อได้ เนื่องจากไม่ได้รับอนุญาตให้ใช้ตำแหน่ง'
        : message;
    }
    if (locationPermissionHelp) {
      locationPermissionHelp.hidden = !isPermissionDenied;
      locationPermissionHelp.classList.toggle('is-hidden', !isPermissionDenied);
    }
    if (locationPermissionRealHelp) {
      locationPermissionRealHelp.hidden = isTestMode;
      locationPermissionRealHelp.classList.toggle('is-hidden', isTestMode);
    }
    if (locationPermissionTestHelp) {
      locationPermissionTestHelp.hidden = !isTestMode;
      locationPermissionTestHelp.classList.toggle('is-hidden', !isTestMode);
    }
    if (isPermissionDenied && !isTestMode) {
      if (locationPermissionHelpTitle) {
        locationPermissionHelpTitle.textContent = isIOSPermissionDenied
          ? 'ไม่สามารถขออนุญาตซ้ำจากหน้าฟอร์มนี้ได้'
          : 'กรุณาลองตรวจสอบตำแหน่งอีกครั้ง';
      }
      if (locationPermissionHelpPrimary) {
        locationPermissionHelpPrimary.textContent = isIOSPermissionDenied
          ? 'ขณะนี้การขออนุญาตตำแหน่งอีกครั้งบน iPhone อาจไม่สามารถทำได้'
          : 'หากระบบถามขอใช้ตำแหน่ง ให้เลือก “อนุญาต” เพื่อดำเนินการต่อ';
      }
      if (locationPermissionHelpSecondary) {
        locationPermissionHelpSecondary.textContent = isIOSPermissionDenied
          ? 'กรุณาลองเปิดแบบฟอร์มด้วยอุปกรณ์อื่น'
          : 'หากยังไม่มีคำถาม กรุณาปิดแบบฟอร์มแล้วเปิดใหม่';
      }
    }
    if (btnRetryServiceLocation) {
      const shouldHideRetry = isTestMode || isIOSPermissionDenied;
      btnRetryServiceLocation.hidden = shouldHideRetry;
      btnRetryServiceLocation.classList.toggle('is-hidden', shouldHideRetry);
      btnRetryServiceLocation.textContent = 'ลองตรวจสอบอีกครั้ง';
    }
    if (btnCloseLocationError) {
      const shouldPromoteClose = isTestMode || isIOSPermissionDenied;
      btnCloseLocationError.dataset.exitLocationTest = isTestMode ? 'true' : 'false';
      btnCloseLocationError.textContent = isTestMode
        ? 'ออกจากโหมดทดสอบและเปิด flow จริง'
        : 'ปิดแบบฟอร์ม';
      btnCloseLocationError.classList.toggle('btn-primary', shouldPromoteClose);
      btnCloseLocationError.classList.toggle('btn-secondary', !shouldPromoteClose);
    }
    showLocationGateState(locationErrorState);
    announceToScreenReader(message);
  }

  // Development-only location scenarios. Ignored on production hosts.
  function getLocationTestMode() {
    const hostname = window.location.hostname.toLowerCase();
    const isTestHost = hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname === '::1'
      || hostname.endsWith('.ngrok-free.app')
      || hostname.endsWith('.ngrok.io');

    if (!isTestHost) return null;

    const queryParams = new URLSearchParams(window.location.search);
    let testMode = queryParams.get('test_location');

    // LIFF may wrap query parameters from liff.line.me inside `liff.state`.
    if (!testMode) {
      const liffState = queryParams.get('liff.state') || '';
      const stateQueryIndex = liffState.indexOf('?');
      if (stateQueryIndex >= 0) {
        const stateParams = new URLSearchParams(liffState.slice(stateQueryIndex + 1));
        testMode = stateParams.get('test_location');
      }
    }
    return ['bangkok', 'outside', 'denied'].includes(testMode) ? testMode : null;
  }

  function applyLocationTestMode() {
    const testMode = getLocationTestMode();
    if (testMode === 'bangkok') {
      console.info('Location test mode: Bangkok');
      enterFormFlow();
      return true;
    }
    if (testMode === 'outside') {
      console.info('Location test mode: outside Bangkok');
      showLocationGateState(locationOutsideState);
      announceToScreenReader('ตำแหน่งปัจจุบันอยู่นอกกรุงเทพมหานคร');
      return true;
    }
    if (testMode === 'denied') {
      console.info('Location test mode: permission denied');
      showLocationError('โหมดทดสอบ: จำลองการไม่อนุญาตตำแหน่ง', true, true);
      return true;
    }

    return false;
  }

  function verifyServiceLocation() {
    if (!navigator.geolocation) {
      showLocationError('อุปกรณ์นี้ไม่รองรับการตรวจสอบตำแหน่ง จึงไม่สามารถดำเนินการต่อได้');
      return;
    }

    setLocationChecking(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=th,en`
          );
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const locationData = await response.json();
          setLocationChecking(false);

          if (isBangkokLocation(locationData)) {
            enterFormFlow();
          } else {
            showLocationGateState(locationOutsideState);
            announceToScreenReader('ตำแหน่งปัจจุบันอยู่นอกกรุงเทพมหานคร');
          }
        } catch (err) {
          console.warn('Service-area verification error:', err);
          showLocationError('ระบบได้รับพิกัดแล้ว แต่ไม่สามารถตรวจสอบพื้นที่ได้ กรุณาลองอีกครั้ง');
        }
      },
      (error) => {
        const isPermissionDenied = error.code === 1;
        const message = isPermissionDenied
          ? 'คุณยังไม่ได้อนุญาตให้แบบฟอร์มนี้ใช้ตำแหน่ง'
          : 'ไม่สามารถรับตำแหน่งปัจจุบันได้ กรุณาตรวจสอบสัญญาณ GPS แล้วลองอีกครั้ง';
        showLocationError(message, isPermissionDenied);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  if (btnRetryServiceLocation) {
    btnRetryServiceLocation.addEventListener('click', () => {
      if (!applyLocationTestMode()) verifyServiceLocation();
    });
  }
  if (btnContinueOutside) btnContinueOutside.addEventListener('click', enterFormFlow);

  // BKK Address Autocomplete Engine
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

    bkkAddressSearch.addEventListener('focus', () => {
      if (!bkkAddressSearch.value.trim()) {
        const topSubdistricts = bkkSubdistrictList.slice(0, 8);
        renderSuggestions(topSubdistricts, '💡 แขวง/เขตนียอดนิยม กรุงเทพมหานคร');
      }
    });

    bkkAddressSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (!q) {
        const topSubdistricts = bkkSubdistrictList.slice(0, 8);
        renderSuggestions(topSubdistricts, '💡 แขวง/เขตนียอดนิยม กรุงเทพมหานคร');
        return;
      }
      const matches = bkkSubdistrictList.filter(item =>
        item.subdistrict.includes(q) || item.district.includes(q) || item.zipcode.includes(q)
      ).slice(0, 10);
      renderSuggestions(matches);
    });

    document.addEventListener('click', (e) => {
      if (!bkkAddressSearch.contains(e.target) && !bkkAddressSuggestions.contains(e.target)) {
        bkkAddressSuggestions.style.display = 'none';
      }
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
  window.selectBkkAddress = selectBkkAddress;

  function updateFullAddressText() {
    const detail = formData.patient_address_detail || '';
    const landmark = formData.patient_address_landmark ? ` (จุดสังเกต: ${formData.patient_address_landmark})` : '';
    const sub = formData.subdistrict ? ` แขวง${formData.subdistrict}` : '';
    const dist = formData.district ? ` เขต${formData.district}` : '';
    const zip = formData.zipcode ? ` ${formData.zipcode}` : '';
    formData.patient_address = `${detail}${landmark}${sub}${dist} กรุงเทพมหานคร${zip}`.trim();
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
    if (formData.contact_phone) document.getElementById('contact_phone').value = formData.contact_phone;

    if (formData.subdistrict && formData.district && bkkAddressSearch) {
      bkkAddressSearch.value = `แขวง${formData.subdistrict} เขต${formData.district} ${formData.zipcode || ''}`;
      selectedAddressBadge.innerHTML = `✅ เลือกแล้ว: <b>แขวง${formData.subdistrict} เขต${formData.district} ${formData.zipcode || ''}</b>`;
      selectedAddressBadge.style.display = 'block';
    }
    if (formData.patient_address_detail && patientAddressDetail) patientAddressDetail.value = formData.patient_address_detail;
    if (formData.patient_address_landmark && patientAddressLandmark) patientAddressLandmark.value = formData.patient_address_landmark;

    if (formData.health_condition) {
      const radio = document.querySelector(`input[name="health_condition"][value="${formData.health_condition}"]`);
      if (radio) radio.checked = true;
    } else if (formData.health_conditions && formData.health_conditions.length) {
      const val = formData.health_conditions[0];
      formData.health_condition = val;
      const radio = document.querySelector(`input[name="health_condition"][value="${val}"]`);
      if (radio) radio.checked = true;
    }
    if (formData.caregiver_name) document.getElementById('caregiver_name').value = formData.caregiver_name;
    if (formData.caregiver_phone) document.getElementById('caregiver_phone').value = formData.caregiver_phone;

    renderMedCertPreviews();
    renderFilePreviews();
    updateCardSelectedStates();
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

  // Geolocation Handler & Auto Fetching
  function fetchCurrentLocation(isManual = false) {
    if ('geolocation' in navigator) {
      if (btnGetLocation) btnGetLocation.textContent = '⏳ กำลังดึงตำแหน่ง GPS...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoordsAndReverseGeocode(lat, lng);
          if (leafletMap && leafletMarker) {
            leafletMap.setView([lat, lng], 16);
            leafletMarker.setLatLng([lat, lng]);
          }
          if (btnGetLocation) btnGetLocation.innerHTML = '🎯 ดึงตำแหน่ง GPS ปัจจุบัน';
        },
        (err) => {
          if (isManual) {
            alert('ไม่สามารถดึงพิกัดได้ กรุณาอนุญาตตำแหน่ง หรือค้นหา/ลากหมุดบนแผนที่');
          } else {
            console.log('Auto geolocation skipped or denied:', err);
          }
          if (btnGetLocation) btnGetLocation.innerHTML = '🎯 ดึงตำแหน่ง GPS ปัจจุบัน';
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else if (isManual) {
      alert('อุปกรณ์นี้ไม่รองรับ Geolocation กรุณาลากหมุดบนแผนที่');
    }
  }

  if (btnGetLocation) {
    btnGetLocation.addEventListener('click', () => fetchCurrentLocation(true));
  }

  // Image Compression & Resizing Utility using HTML5 Canvas
  function compressImage(file, maxDimension = 1280, quality = 0.75) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(new Error('กรุณาเลือกเฉพาะไฟล์รูปภาพเท่านั้น (เช่น JPG, PNG, WEBP)'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ name: file.name, url: compressedDataUrl });
        };
        img.onerror = () => reject(new Error('ไม่สามารถประมวลผลไฟล์รูปภาพได้'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
      reader.readAsDataURL(file);
    });
  }

  // Medical Certificate Upload Handler
  if (medicalCertUpload) {
    medicalCertUpload.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          const compressed = await compressImage(file);
          formData.medical_certs.push(compressed);
          renderMedCertPreviews();
          saveDraft();
          checkCurrentStepValidity();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  }

  function renderMedCertPreviews() {
    if (!medCertPreviewList) return;
    medCertPreviewList.innerHTML = '';
    formData.medical_certs.forEach(att => {
      const img = document.createElement('img');
      img.src = att.url;
      img.className = 'file-thumb';
      medCertPreviewList.appendChild(img);
    });
  }

  // File Upload Preview Handler
  if (fileUpload) {
    fileUpload.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          const compressed = await compressImage(file);
          formData.attachments.push(compressed);
          renderFilePreviews();
          saveDraft();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  }

  function renderFilePreviews() {
    if (!filePreviewList) return;
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
      isValid = document.getElementById('patient_name').value.trim().length > 0;
    } else if (currentStep === 3) {
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
    } else if (currentStep === 4) {
      isValid = !!document.querySelector('input[name="health_condition"]:checked');
    } else if (currentStep === 5) {
      isValid = formData.medical_certs.length > 0;
    } else if (currentStep === 6) {
      isValid = formData.latitude !== null && formData.longitude !== null;
    } else if (currentStep === 7) {
      isValid = !!formData.district && !!formData.subdistrict && !!formData.patient_address_detail;
    } else if (currentStep === 8) {
      const phone = document.getElementById('contact_phone').value.trim();
      isValid = phone.length >= 9;
    } else if (currentStep === 9) {
      const isCaregiverApplicant = formData.applicant_type === 'caregiver';
      const isBedriddenPatient = formData.health_condition === 'bedridden';
      const requiresCaregiverInfo = isCaregiverApplicant || isBedriddenPatient;
      if (caregiverBadge && caregiverDesc) {
        if (requiresCaregiverInfo) {
          caregiverBadge.textContent = 'จำเป็นต้องระบุ';
          caregiverBadge.className = 'badge-required';
          caregiverDesc.textContent = isBedriddenPatient
            ? 'ผู้ป่วยติดเตียงจำเป็นต้องระบุชื่อและเบอร์โทรศัพท์ญาติหรือผู้ดูแลสำหรับติดต่อประสานงาน'
            : 'ญาติหรือผู้ดูแลกรอกแทนผู้ป่วย จำเป็นต้องระบุชื่อและเบอร์โทรศัพท์ผู้ดูแล';
        } else {
          caregiverBadge.textContent = 'ไม่บังคับกรอก';
          caregiverBadge.className = 'badge-optional';
          caregiverDesc.textContent = 'ผู้ป่วยยื่นขอรับด้วยตนเอง หากมีผู้ดูแลสามารถระบุเพิ่มเติมได้ (ไม่บังคับ)';
        }
      }

      if (requiresCaregiverInfo) {
        const name = document.getElementById('caregiver_name').value.trim();
        const phone = document.getElementById('caregiver_phone').value.trim();
        isValid = name.length > 0 && phone.length >= 9;
      } else {
        isValid = true; // Optional for self patient applicants
      }
    } else if (currentStep === 10) {
      isValid = true; // Optional step (General attachments)
    } else if (currentStep === 11) {
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
      formData.patient_name = document.getElementById('patient_name').value.trim();
    } else if (currentStep === 3) {
      formData.patient_id = patientIdInput.value.replace(/\D/g, '');
    } else if (currentStep === 4) {
      const sel = document.querySelector('input[name="health_condition"]:checked');
      if (sel) formData.health_condition = sel.value;
    } else if (currentStep === 7) {
      if (patientAddressDetail) formData.patient_address_detail = patientAddressDetail.value.trim();
      if (patientAddressLandmark) formData.patient_address_landmark = patientAddressLandmark.value.trim();
      updateFullAddressText();
    } else if (currentStep === 8) {
      formData.contact_phone = document.getElementById('contact_phone').value.trim();
    } else if (currentStep === 9) {
      formData.caregiver_name = document.getElementById('caregiver_name').value.trim();
      formData.caregiver_phone = document.getElementById('caregiver_phone').value.trim();
    }
    saveDraft();
  }

  function updateCardSelectedStates() {
    document.querySelectorAll('.checkbox-card, .option-card').forEach(card => {
      const input = card.querySelector('input');
      if (input && input.checked) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  // Real-time input listeners to enable/disable Next button & update selection UI
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      syncCurrentStepData();
      updateCardSelectedStates();
      checkCurrentStepValidity();
    });
    el.addEventListener('change', () => {
      syncCurrentStepData();
      updateCardSelectedStates();
      checkCurrentStepValidity();
    });
  });

  // Advance to Next Step (With Conditional Skip for Medical Cert)
  function goNextStep() {
    syncCurrentStepData();
    if (!checkCurrentStepValidity()) return;

    if (currentStep === 4 && formData.health_condition !== 'incontinence') {
      currentStep = 6; // Skip Medical Cert step if not incontinence
    } else if (currentStep < TOTAL_STEPS) {
      currentStep++;
    } else {
      // Critical Step Check: Check LIFF authentication before submitting
      if (typeof liff !== 'undefined' && liff.init) {
        if (!liff.isLoggedIn()) {
          const confirmLogin = confirm('ระบบจำเป็นต้องยืนยันตัวตนด้วย LINE ก่อนส่งเรื่องคำร้อง กรุณากด "ตกลง" เพื่อเข้าสู่ระบบ LINE');
          if (confirmLogin) {
            liff.login();
          }
          return;
        }
      }
      submitPayload();
      return;
    }
    updateStepUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Go to Previous Step (With Conditional Skip for Medical Cert)
  function goPrevStep() {
    if (currentStep === 6 && formData.health_condition !== 'incontinence') {
      currentStep = 4; // Skip Medical Cert step backwards if not incontinence
    } else if (currentStep > 1) {
      currentStep--;
    }
    updateStepUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Jump to specific step from Review edit buttons
  window.jumpToStep = function (stepNum) {
    currentStep = stepNum;
    updateStepUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ariaLiveRegion = document.getElementById('ariaLiveRegion');
  function announceToScreenReader(msg) {
    if (ariaLiveRegion) {
      ariaLiveRegion.textContent = '';
      setTimeout(() => { ariaLiveRegion.textContent = msg; }, 100);
    }
  }

  // Update UI Step Visibility & Progress
  function updateStepUI() {
    if (!hasPassedLocationGate) {
      if (diaperForm) {
        diaperForm.hidden = true;
        diaperForm.classList.add('is-hidden');
      }
      if (progressBarContainer) {
        progressBarContainer.hidden = true;
        progressBarContainer.classList.add('is-hidden');
      }
      if (actionFooter) {
        actionFooter.hidden = true;
        actionFooter.classList.add('is-hidden');
      }
      return;
    }

    stepCards.forEach(card => {
      const step = parseInt(card.dataset.step);
      if (step === currentStep) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (currentStep === 12) {
      if (actionFooter) actionFooter.style.display = 'none';
      progressBar.style.width = '100%';
      announceToScreenReader('ยื่นเรื่องเรียบร้อยแล้ว');
      return;
    } else {
      if (actionFooter) actionFooter.style.display = 'flex';
    }

    // Screen Reader Step Announcement (WCAG 4.1.3)
    const titleEl = document.querySelector(`.step-card[data-step="${currentStep}"] h2`);
    if (titleEl) {
      announceToScreenReader(`ขั้นตอนที่ ${currentStep} จาก ${TOTAL_STEPS}: ${titleEl.textContent}`);
    }

    // Initialize Map & Auto-fetch Location if on Step 6
    if (currentStep === 6) {
      setTimeout(() => {
        initLeafletMap();
        if (formData.latitude === null && formData.longitude === null) {
          fetchCurrentLocation(false);
        }
      }, 150);
    }

    // Update Progress Bar
    const pct = Math.round((currentStep / TOTAL_STEPS) * 100);
    progressBar.style.width = `${pct}%`;

    // Prev Button Visibility
    btnPrev.style.display = currentStep === 1 ? 'none' : 'inline-block';

    // Next / Submit Button Text
    if (currentStep === TOTAL_STEPS) {
      btnNext.textContent = 'ยืนยันและส่งเรื่อง 🚀';
      renderUXReviewSummary();
    } else {
      btnNext.textContent = 'ถัดไป →';
    }

    // Auto-focus primary input field on step transition
    setTimeout(() => {
      const activeCard = document.querySelector('.step-card.active');
      if (activeCard) {
        const firstInput = activeCard.querySelector('input[type="text"], input[type="tel"], textarea');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 200);

    checkCurrentStepValidity();
  }

  // Render UX-Optimized Categorized Review Cards (Step 11)
  function renderUXReviewSummary() {
    const isPatientApplicant = formData.applicant_type === 'patient';
    const condLabel = formData.health_condition === 'bedridden' ? 'ผู้ป่วยติดเตียง / ไม่สามารถช่วยเหลือตัวเองได้' : (formData.health_condition === 'incontinence' ? 'มีปัญหาภาวะกลั้นปัสสาวะหรืออุจจาระไม่ได้' : '-');
    const hasCaregiverInfo = !!formData.caregiver_name;

    reviewSummaryGrid.innerHTML = `
      <!-- Card 1: Patient Identity -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">👤 ข้อมูลผู้ขอรับสิทธิ</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(1)">แก้ไข</button>
        </div>
        <div class="review-data-row">
          <span class="review-label">สถานะผู้กรอก:</span>
          <span class="review-value">${isPatientApplicant ? 'ผู้ป่วยยื่นขอรับด้วยตนเอง' : 'ญาติ / ผู้ดูแลกรอกแทน'}</span>
        </div>
        <div class="review-data-row">
          <span class="review-label">ชื่อผู้ป่วย:</span>
          <span class="review-value">${formData.patient_name || '-'}</span>
        </div>
        <div class="review-data-row">
          <span class="review-label">เลขบัตรประชาชน:</span>
          <span class="review-value">${formatThaiIDString(formData.patient_id) || '-'}</span>
        </div>
      </div>

      <!-- Card 2: Medical Condition & Certs -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">🩺 สภาวะความต้องการผ้าอ้อม</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(4)">แก้ไข</button>
        </div>
        <div class="review-data-row">
          <span class="review-label">สภาวะสุขภาพ:</span>
          <span class="review-value">${condLabel}</span>
        </div>
        ${formData.health_condition === 'incontinence' ? `
        <div class="review-data-row">
          <span class="review-label">รูปถ่ายใบรับรองแพทย์:</span>
          <span class="review-value">${formData.medical_certs.length > 0 ? `${formData.medical_certs.length} ไฟล์` : 'ไม่ได้แนบ'}</span>
        </div>` : ''}
      </div>

      <!-- Card 3: Location & Address -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">📍 ที่อยู่และพิกัดจัดส่ง</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(6)">แก้ไข</button>
        </div>
        <div class="review-data-row">
          <span class="review-label">ที่อยู่ กทม.:</span>
          <span class="review-value">${formData.patient_address || '-'}</span>
        </div>
        ${formData.patient_address_landmark ? `
        <div class="review-data-row">
          <span class="review-label">จุดสังเกตใกล้บ้าน:</span>
          <span class="review-value">${formData.patient_address_landmark}</span>
        </div>` : ''}
        <div class="review-data-row">
          <span class="review-label">พิกัด GPS:</span>
          <span class="review-value">${formData.latitude ? `Lat ${formData.latitude.toFixed(4)}, Lon ${formData.longitude.toFixed(4)}` : 'ไม่ได้ระบุ'}</span>
        </div>
      </div>

      <!-- Card 4: Contact & Caregiver Info -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">📞 ข้อมูลติดต่อและผู้ดูแล</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(8)">แก้ไข</button>
        </div>
        <div class="review-data-row">
          <span class="review-label">เบอร์ติดต่อผู้ป่วย:</span>
          <span class="review-value">${formData.contact_phone || '-'}</span>
        </div>
        ${hasCaregiverInfo ? `
        <div class="review-data-row">
          <span class="review-label">ผู้ดูแลผู้ป่วย:</span>
          <span class="review-value">${formData.caregiver_name} (${formData.caregiver_phone})</span>
        </div>` : `
        <div class="review-data-row">
          <span class="review-label">ผู้ดูแลผู้ป่วย:</span>
          <span class="review-value">ไม่มี (ยื่นขอรับด้วยตนเอง)</span>
        </div>`}
      </div>

      <!-- Card 5: General Attachments -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">📷 รูปถ่ายผู้ป่วย/สถานที่</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(10)">แก้ไข</button>
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
    if (formData.health_condition === 'incontinence' && formData.medical_certs.length === 0) {
      alert('กรุณาแนบใบรับรองแพทย์อย่างน้อย 1 ไฟล์');
      currentStep = 5;
      updateStepUI();
      return;
    }

    const requiresCaregiverInfo = formData.applicant_type === 'caregiver'
      || formData.health_condition === 'bedridden';
    if (requiresCaregiverInfo
      && (!formData.caregiver_name || formData.caregiver_phone.length < 9)) {
      alert('กรุณาระบุชื่อและเบอร์โทรศัพท์ญาติหรือผู้ดูแลผู้ป่วย');
      currentStep = 9;
      updateStepUI();
      return;
    }

    const payload = {
      request_timestamp: new Date().toISOString(),
      form_id: "bkk_careplan_diaper_v1",
      form_name: "แบบแจ้งความประสงค์ขอรับผ้าอ้อมผู้ใหญ่",
      liff_id: LIFF_ID || "",
      source: "bkk_careplan_traffy_fondue_webview",
      org_id: formData.org_id || "",
      applicant_type: formData.applicant_type,
      patient_info: {
        fullname: formData.patient_name,
        id_card: formData.patient_id
      },
      contact_info: {
        phone: formData.contact_phone,
        district: formData.district,
        subdistrict: formData.subdistrict,
        zipcode: formData.zipcode,
        address_detail: formData.patient_address_detail,
        landmark: formData.patient_address_landmark,
        full_address: formData.patient_address,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude
        }
      },
      medical_conditions: {
        condition: formData.health_condition,
        is_bedridden: formData.health_condition === 'bedridden',
        has_incontinence: formData.health_condition === 'incontinence',
        medical_cert_count: formData.medical_certs.length
      },
      caregiver_info: {
        fullname: formData.caregiver_name || '',
        phone: formData.caregiver_phone || ''
      },
      attachments_count: formData.attachments.length,
      images: {
        medical_certs: formData.medical_certs.map(item => ({
          filename: item.name,
          base64: item.url
        })),
        attachments: formData.attachments.map(item => ({
          filename: item.name,
          base64: item.url
        }))
      },
      line_profile: lineProfile ? {
        user_id: lineProfile.userId,
        display_name: lineProfile.displayName,
        picture_url: lineProfile.pictureUrl || ''
      } : null
    };

    // Send payload to Gateway API
    btnNext.disabled = true;
    btnNext.textContent = '⏳ กำลังส่งข้อมูลคำร้อง...';

    const handleSuccess = (responseData = null) => {
      console.log('✅ Submission Success! Gateway Response:', responseData);

      // Send text message confirmation into LINE chat if available
      if (typeof liff !== 'undefined' && liff.isInClient && liff.isInClient() && typeof liff.sendMessages === 'function') {
        liff.sendMessages([
          {
            type: 'text',
            text: `📌 ยื่นเรื่องขอรับสิทธิผ้าอ้อมผู้ใหญ่เรียบร้อยแล้ว\n\nชื่อผู้ป่วย: ${formData.patient_name}\nแขวง/เขต: แขวง${formData.subdistrict || '-'} เขต${formData.district || '-'}\nเบอร์ติดต่อ: ${formData.contact_phone || '-'}\nสถานะ: บันทึกข้อมูลเข้าสู่ระบบเรียบร้อยแล้ว 🚀`
          }
        ]).catch(err => console.warn('liff.sendMessages warning:', err));
      }

      localStorage.removeItem('bkk_careplan_draft');
      btnNext.disabled = false;
      btnNext.textContent = 'ยืนยันและส่งเรื่อง 🚀';
      currentStep = 12;
      updateStepUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (GATEWAY_API_URL && !GATEWAY_API_URL.includes('xxxx')) {
      console.log('🚀 Sending JSON payload to Gateway API:', GATEWAY_API_URL, payload);
      fetch(GATEWAY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          handleSuccess(data);
        })
        .catch(err => {
          console.error('❌ Failed to submit payload to gateway:', err);
          btnNext.disabled = false;
          btnNext.textContent = 'ยืนยันและส่งเรื่อง 🚀';
          alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง');
        });
    } else {
      handleSuccess({ mock: true });
    }
  }

  // Close LIFF Window Handler
  function closeLiffWindow(fallbackMessage) {
    const isInLiffClient = typeof liff !== 'undefined'
      && typeof liff.isInClient === 'function'
      && liff.isInClient();

    if (isInLiffClient && typeof liff.closeWindow === 'function') {
      try {
        liff.closeWindow();
        return;
      } catch (e) {
        console.warn('liff.closeWindow error:', e);
      }
    }

    alert(fallbackMessage);
  }

  document.querySelectorAll('.btnCloseLiff').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.exitLocationTest === 'true') {
        window.location.href = `https://liff.line.me/${LIFF_ID}`;
        return;
      }
      closeLiffWindow('ไม่สามารถปิดหน้าต่างอัตโนมัติได้ กรุณาปิดแท็บหรือหน้าต่างนี้');
    });
  });

  if (btnFinishLiff) {
    btnFinishLiff.addEventListener('click', () => {
      closeLiffWindow('ยื่นเรื่องเรียบร้อยแล้ว ท่านสามารถปิดแท็บเบราว์เซอร์นี้ได้เลยครับ');
    });
  }

  // Navigation Button Handlers
  btnNext.addEventListener('click', () => goNextStep());
  btnPrev.addEventListener('click', () => goPrevStep());

  // Init
  restoreDraft();
  updateStepUI();
  updateCardSelectedStates();

  async function initializeApp() {
    await initLiff();
    if (!applyLocationTestMode()) verifyServiceLocation();
  }

  initializeApp();
});
