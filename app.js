document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_STEPS = 11;
  let currentStep = 1;
  let leafletMap = null;
  let leafletMarker = null;
  let isMapFullscreen = false;

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
        liff.login();
      }
    } catch (err) {
      console.warn('LIFF initialization warning/error:', err);
    }
  }

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
    { subdistrict: "บางแค", district: "บางแค", zipcode: "10160" },
    { subdistrict: "ทุ่งมหาเมฆ", district: "สาทร", zipcode: "10120" },
    { subdistrict: "ยานนาวา", district: "สาทร", zipcode: "10120" },
    { subdistrict: "ทุ่งวัดดอน", district: "สาทร", zipcode: "10120" }
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
  const reviewSummaryGrid = document.getElementById('reviewSummaryGrid');
  const payloadModal = document.getElementById('payloadModal');
  const payloadJsonDisplay = document.getElementById('payloadJsonDisplay');
  const btnCopyPayload = document.getElementById('btnCopyPayload');
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
      isValid = true; // Optional step (Medical Cert)
    } else if (currentStep === 6) {
      isValid = formData.latitude !== null && formData.longitude !== null;
    } else if (currentStep === 7) {
      isValid = !!formData.district && !!formData.subdistrict && !!formData.patient_address_detail;
    } else if (currentStep === 8) {
      const phone = document.getElementById('contact_phone').value.trim();
      isValid = phone.length >= 9;
    } else if (currentStep === 9) {
      const isCaregiverApplicant = formData.applicant_type === 'caregiver';
      if (caregiverBadge && caregiverDesc) {
        if (isCaregiverApplicant) {
          caregiverBadge.textContent = 'จำเป็นต้องระบุ';
          caregiverBadge.className = 'badge-required';
          caregiverDesc.textContent = 'ญาติหรือผู้ดูแลกรอกแทนผู้ป่วย จำเป็นต้องระบุชื่อและเบอร์โทรศัพท์ผู้ดูแล';
        } else {
          caregiverBadge.textContent = 'ไม่บังคับกรอก';
          caregiverBadge.className = 'badge-optional';
          caregiverDesc.textContent = 'ผู้ป่วยยื่นขอรับด้วยตนเอง หากมีผู้ดูแลสามารถระบุเพิ่มเติมได้ (ไม่บังคับ)';
        }
      }

      if (isCaregiverApplicant) {
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
    stepCards.forEach(card => {
      const step = parseInt(card.dataset.step);
      if (step === currentStep) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

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

    payloadJsonDisplay.textContent = JSON.stringify(payload, null, 2);
    payloadModal.classList.add('active');

    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.querySelector('#payloadModal p');

    if (modalTitle) modalTitle.textContent = '⏳ กำลังส่งเรื่องเข้าสู่ระบบ...';
    if (modalDesc) modalDesc.textContent = 'กรุณารอสักครู่ ระบบกำลังส่งข้อมูลคำร้องเข้าสู่ระบบ';

    // Send payload to Gateway API
    if (GATEWAY_API_URL && !GATEWAY_API_URL.includes('xxxx')) {
      btnNext.disabled = true;
      btnNext.textContent = '⏳ กำลังส่งข้อมูลคำร้อง...';
      fetch(GATEWAY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          btnNext.textContent = '✓ ส่งข้อมูลเรียบร้อย!';
          if (modalTitle) modalTitle.textContent = '✅ ยื่นเรื่องเรียบร้อยแล้ว';
          if (modalDesc) modalDesc.textContent = 'ระบบบันทึกข้อมูลคำร้องเข้าสู่ระบบเรียบร้อยแล้ว เมื่อระบบประมวลผลเสร็จสิ้น ท่านจะได้รับใบรวบรวมสรุปข้อมูลผ่านทางแชต LINE นี้ และเจ้าหน้าที่จะแจ้งความคืบหน้าการดำเนินงานให้ทราบเป็นระยะ';

          localStorage.removeItem('bkk_careplan_draft');
        })
        .catch(err => {
          console.error('Failed to submit payload to gateway:', err);
          btnNext.disabled = false;
          btnNext.textContent = 'ยืนยันและส่งเรื่อง 🚀';
          if (modalTitle) modalTitle.textContent = '❌ เกิดข้อผิดพลาดในการส่งข้อมูล';
          if (modalDesc) modalDesc.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง';
        });
    } else {
      if (modalTitle) modalTitle.textContent = '✅ ยื่นเรื่องเรียบร้อยแล้ว';
      if (modalDesc) modalDesc.textContent = 'ระบบบันทึกข้อมูลคำร้องเข้าสู่ระบบเรียบร้อยแล้ว เมื่อระบบประมวลผลเสร็จสิ้น ท่านจะได้รับใบรวบรวมสรุปข้อมูลผ่านทางแชต LINE นี้ (โหมดจำลองระบบทดสอบ)';
      localStorage.removeItem('bkk_careplan_draft');
    }
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
  updateCardSelectedStates();
  initLiff();
});
