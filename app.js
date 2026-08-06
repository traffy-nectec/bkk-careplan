document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_STEPS = 13;
  let currentStep = 1;
  let leafletMap = null;
  let leafletMarker = null;
  let isMapFullscreen = false;
  
  // Bangkok Districts & Subdistricts Sample Mapping
  const bkkDistrictsData = {
    "พระนคร": ["พระบรมมหาราชวัง", "วังบูรพาภิรมย์", "วัดราชบพิธ", "สำราญราษฎร์", "ศาลเจ้าพ่อเสือ", "เสาชิงช้า", "บวรนิเวศน์", "ตลาดยอด", "ชนะสงคราม", "บ้านพานถม", "บางขุนพรหม", "วัดสามพระยา"],
    "ดุสิต": ["ดุสิต", "วชิรพยาบาล", "สวนจิตรลดา", "สี่แยกมหานาค", "ถนนนครไชยศรี"],
    "หนองจอก": ["กระทุ่มราย", "หนองจอก", "คลองสิบ", "คลองสิบสอง", "โคกแฝด", "คู้ฝ้าย", "คลองสิบสี่"],
    "บางรัก": ["มหาพฤฒาราม", "สีลม", "สุริยวงศ์", "บางรัก", "สี่พระยา"],
    "บางเขน": ["อนุสาวรีย์", "ท่าแร้ง"],
    "บางกะปิ": ["คลองจั่น", "หัวหมาก"],
    "ปทุมวัน": ["รองเมือง", "วังใหม่", "ปทุมวัน", "ลุมพินี"],
    "ป้อมปราบศัตรูพ่าย": ["ป้อมปราบ", "วัดเทพศิรินทร์", "คลองมหานาค", "บ้านบาตร", "วัดโสมนัส"],
    "พญาไท": ["สามเสนใน", "พญาไท"],
    "ธนบุรี": ["วัดกัลยาณ์", "หิรัญรูจี", "บางยี่เรือ", "บุคคโล", "ตลาดพลู", "ดาวคะนอง", "สำเหร่"],
    "บางกอกใหญ่": ["วัดอรุณ", "วัดท่าพระ"],
    "ห้วยขวาง": ["ห้วยขวาง", "บางกะปิ", "สามเสนนอก"],
    "คลองสาน": ["สมเด็จเจ้าพระยา", "คลองสาน", "บางลำภูล่าง", "คลองต้นไทร"],
    "ตลิ่งชัน": ["คลองชักพระ", "ตลิ่งชัน", "ฉิมพลี", "บางพรม", "บางระมาด", "บางเชือกหนัง"],
    "บางกอกน้อย": ["ศิริราช", "บ้านช่างหล่อ", "บางขุนนนท์", "บางขุนศรี", "อรุณอมรินทร์"],
    "บางขุนเทียน": ["ท่าข้าม", "แสมดำ"],
    "ภาษีเจริญ": ["บางหว้า", "บางด้วน", "บางจาก", "บางแวก", "คลองขวาง", "ปากคลองภาษีเจริญ"],
    "หนองแขม": ["หนองแขม", "หนองค้างพลู"],
    "ราษฎร์บูรณะ": ["ราษฎร์บูรณะ", "บางปะกอก"],
    "บางพลัด": ["บางพลัด", "บางอ้อ", "บางบำหรุ", "บางยี่ขัน"],
    "ดินแดง": ["ดินแดง", "รัชดาภิเษก"],
    "บึงกุ่ม": ["คลองกุ่ม", "นวมินทร์", "นวลจันทร์"],
    "สาทร": ["ทุ่งมหาเมฆ", "ยานนาวา", "ทุ่งวัดดอน"],
    "บางซื่อ": ["บางซื่อ", "วงศ์สว่าง"],
    "จตุจักร": ["ลาดยาว", "เสนานิคม", "จันทรเกษม", "จอมพล", "จตุจักร"],
    "ประเวศ": ["ประเวศ", "หนองบอน", "ดอกไม้"],
    "คลองเตย": ["คลองเตย", "คลองตัน", "พระโขนง"],
    "สวนหลวง": ["สวนหลวง", "อ่อนนุช", "พัฒนาการ"],
    "ดอนเมือง": ["สีกัน", "ดอนเมือง", "สนามบิน"],
    "ราชเทวี": ["ทุ่งพญาไท", "ถนนพญาไท", "ถนนเพชรบุรี", "มักกะสัน"],
    "ลาดพร้าว": ["ลาดพร้าว", "จรเข้บัว"],
    "วัฒนา": ["คลองเตยเหนือ", "คลองตันเหนือ", "พระโขนงเหนือ"],
    "บางแค": ["บางแค", "บางแคเหนือ", "บางไผ่", "หลักสอง"],
    "หลักสี่": ["ทุ่งสองห้อง", "ตลาดบางเขน"],
    "สายไหม": ["สายไหม", "ออเงิน", "คลองถนน"],
    "คันนายาว": ["คันนายาว", "รามอินทรา"],
    "สะพานสูง": ["สะพานสูง", "ทับช้าง", "ราษฎร์พัฒนา"],
    "วังทองหลาง": ["วังทองหลาง", "สะพานสอง", "คลองเจ้าคุณสิงห์", "พลับพลา"],
    "คลองสามวา": ["สามวาตะวันตก", "สามวาตะวันออก", "บางชัน", "ทรายกองดิน", "ทรายกองดินใต้"],
    "บางนา": ["บางนาเหนือ", "บางนาใต้"],
    "ทวีวัฒนา": ["ทวีวัฒนา", "ศาลาธรรมสพน์"],
    "ทุ่งครุ": ["บางมด", "ทุ่งครุ"],
    "บางบอน": ["บางบอนเหนือ", "บางบอนใต้", "คลองบางพราน", "คลองบางบอน"]
  };

  // State Object
  let formData = {
    applicant_type: '',
    patient_name: '',
    patient_id: '',
    health_coverage: '',
    contact_phone: '',
    district: '',
    subdistrict: '',
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
  const districtSelect = document.getElementById('districtSelect');
  const subdistrictSelect = document.getElementById('subdistrictSelect');
  const patientAddressDetail = document.getElementById('patient_address_detail');
  const fileUpload = document.getElementById('fileUpload');
  const filePreviewList = document.getElementById('filePreviewList');
  const reviewSummaryGrid = document.getElementById('reviewSummaryGrid');
  const payloadModal = document.getElementById('payloadModal');
  const payloadJsonDisplay = document.getElementById('payloadJsonDisplay');
  const btnCopyPayload = document.getElementById('btnCopyPayload');
  const patientIdInput = document.getElementById('patient_id');
  const idValidationMsg = document.getElementById('idValidationMsg');

  // Accessibility Font Size Toggle (3.2)
  document.querySelectorAll('.btn-font-size').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-font-size').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const size = btn.dataset.size;
      document.body.setAttribute('data-font-size', size);
    });
  });

  // Init BKK District Select (2.3)
  if (districtSelect) {
    Object.keys(bkkDistrictsData).sort().forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = `เขต${d}`;
      districtSelect.appendChild(opt);
    });

    districtSelect.addEventListener('change', () => {
      const dist = districtSelect.value;
      formData.district = dist;
      subdistrictSelect.innerHTML = '<option value="">-- เลือกแขวง --</option>';
      if (dist && bkkDistrictsData[dist]) {
        bkkDistrictsData[dist].forEach(sub => {
          const opt = document.createElement('option');
          opt.value = sub;
          opt.textContent = `แขวง${sub}`;
          subdistrictSelect.appendChild(opt);
        });
      }
      updateFullAddressText();
      checkCurrentStepValidity();
      saveDraft();
    });

    subdistrictSelect.addEventListener('change', () => {
      formData.subdistrict = subdistrictSelect.value;
      updateFullAddressText();
      checkCurrentStepValidity();
      saveDraft();
    });

    patientAddressDetail.addEventListener('input', () => {
      formData.patient_address_detail = patientAddressDetail.value.trim();
      updateFullAddressText();
      checkCurrentStepValidity();
      saveDraft();
    });
  }

  function updateFullAddressText() {
    const detail = formData.patient_address_detail || '';
    const sub = formData.subdistrict ? ` แขวง${formData.subdistrict}` : '';
    const dist = formData.district ? ` เขต${formData.district}` : '';
    formData.patient_address = `${detail}${sub}${dist} กรุงเทพมหานคร`.trim();
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
    
    if (formData.district && districtSelect) {
      districtSelect.value = formData.district;
      districtSelect.dispatchEvent(new Event('change'));
      if (formData.subdistrict) subdistrictSelect.value = formData.subdistrict;
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

  // Thai Citizen ID Mask Formatting (2.2)
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

  // Initialize Leaflet Draggable Map (2.1)
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

    // Drag marker event
    leafletMarker.on('dragend', function (e) {
      const position = leafletMarker.getLatLng();
      setCoords(position.lat, position.lng);
    });

    // Click map event
    leafletMap.on('click', function (e) {
      leafletMarker.setLatLng(e.latlng);
      setCoords(e.latlng.lat, e.latlng.lng);
    });
  }

  function setCoords(lat, lng) {
    formData.latitude = lat;
    formData.longitude = lng;
    updateCoordsDisplay(lat, lng);
    checkCurrentStepValidity();
    saveDraft();
  }

  function updateCoordsDisplay(lat, lng) {
    coordsDisplay.textContent = `📍 พิกัด: Lat ${lat.toFixed(5)}, Lon ${lng.toFixed(5)}`;
    coordsDisplay.classList.add('active');
  }

  // Map Fullscreen Toggle (2.1)
  if (btnToggleFullscreenMap) {
    btnToggleFullscreenMap.addEventListener('click', () => {
      const mapContainer = document.getElementById('map');
      isMapFullscreen = !isMapFullscreen;
      if (isMapFullscreen) {
        mapContainer.classList.add('fullscreen');
        btnToggleFullscreenMap.textContent = '❌ ย่อแผนที่กลับ';
      } else {
        mapContainer.classList.remove('fullscreen');
        btnToggleFullscreenMap.textContent = '🔍 ขยายแผนที่เต็มจอ';
      }
      setTimeout(() => leafletMap.invalidateSize(), 200);
    });
  }

  // Search Map Location via OpenStreetMap Nominatim API (2.1)
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
            setCoords(lat, lon);
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
            setCoords(lat, lng);
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
      isValid = !!document.querySelector('input[name="health_coverage"]:checked');
    } else if (currentStep === 5) {
      const phone = document.getElementById('contact_phone').value.trim();
      isValid = phone.length >= 9;
    } else if (currentStep === 6) {
      isValid = !!formData.district && !!formData.subdistrict && !!formData.patient_address_detail;
    } else if (currentStep === 7) {
      isValid = formData.latitude !== null && formData.longitude !== null;
    } else if (currentStep === 8) {
      const cbs = document.querySelectorAll('input[name="health_condition"]:checked');
      isValid = cbs.length > 0;
    } else if (currentStep === 9) {
      isValid = true; // Recommended step
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
      formData.patient_name = document.getElementById('patient_name').value.trim();
    } else if (currentStep === 3) {
      formData.patient_id = patientIdInput.value.replace(/\D/g, '');
    } else if (currentStep === 4) {
      const sel = document.querySelector('input[name="health_coverage"]:checked');
      if (sel) formData.health_coverage = sel.value;
    } else if (currentStep === 5) {
      formData.contact_phone = document.getElementById('contact_phone').value.trim();
    } else if (currentStep === 6) {
      updateFullAddressText();
    } else if (currentStep === 8) {
      formData.health_conditions = Array.from(document.querySelectorAll('input[name="health_condition"]:checked')).map(cb => cb.value);
    } else if (currentStep === 9) {
      const sel = document.querySelector('input[name="diaper_size"]:checked');
      if (sel) formData.diaper_size = sel.value;
    } else if (currentStep === 10) {
      const sel = document.querySelector('input[name="self_care_status"]:checked');
      if (sel) formData.self_care_status = sel.value;
    } else if (currentStep === 11) {
      formData.caregiver_name = document.getElementById('caregiver_name').value.trim();
      formData.caregiver_phone = document.getElementById('caregiver_phone').value.trim();
    }
    saveDraft();
  }

  // Real-time input listeners to enable/disable Next button (1.2 Explicit Next button)
  document.querySelectorAll('input, textarea, select').forEach(el => {
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
      // Skip Step 11 (Caregiver details) if patient can self care
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
      // Skip back over Step 11 to Step 10
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

    // Initialize Map if on Step 7
    if (currentStep === 7) {
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
          <button type="button" class="review-edit-btn" onclick="jumpToStep(8)">แก้ไข</button>
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

      <!-- Card 2: Patient & Caregiver Info -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">👤 ข้อมูลผู้ขอรับสิทธิและผู้ดูแล</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(2)">แก้ไข</button>
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

      <!-- Card 3: Address & Location -->
      <div class="review-section-card">
        <div class="review-card-header">
          <div class="review-card-title">📍 ที่อยู่และพิกัดจัดส่ง</div>
          <button type="button" class="review-edit-btn" onclick="jumpToStep(6)">แก้ไข</button>
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
