/**
 * PORTAL SIAKAD TERPADU - JAVASCRIPT CONTROLLER
 * Live Telemetry Integration with SIAKAD Remote Manager (Fleet Hub)
 */

// Remote Manager API Gateway Endpoints
const MANAGER_ENDPOINTS = [
  'https://manager.yatindosystem.net/api/portal-gateway',
  'https://manager.yatindosystem.net/api/v1/portal-gateway',
  'https://siakad-manager.test/api/portal-gateway',
  'https://siakad-manager.test/api/v1/portal-gateway'
];

// Default Fleet State (Based on real telemetry: SMK=655/49/22, SMP=382/26/11 -> Total 1,037)
const DEFAULT_GATEWAY_DATA = {
  institution: 'Yayasan Tinta Emas Indonesia',
  stats: {
    total_students: 1037,
    total_staff: 75,
    total_rombels: 33,
    uptime: '99.98%'
  },
  urls: {
    smk: 'https://smk.yatindosystem.net',
    smp: 'https://smp.yatindosystem.net',
    cbt: 'https://cbtsmk.yatindosystem.net',
    guru: 'https://admsmk.yatindosystem.net',
    inventaris: null
  },
  cbt_status: {
    status: 'maintenance',
    name: 'CBT YATINDO',
    url: 'https://cbtsmk.yatindosystem.net'
  },
  guru_status: {
    status: 'active',
    name: 'Administrasi Guru',
    url: 'https://admsmk.yatindosystem.net'
  },
  inventaris_status: {
    status: 'maintenance',
    name: 'Inventaris & Sarpras',
    url: '#'
  },
  helpdesk: {
    is_active: true,
    name: 'Helpdesk IT Yayasan',
    whatsapp: '',
    email: '',
    hours: 'Senin - Sabtu: 07:00 - 16:00 WIB',
    notes: 'Hubungi helpdesk jika mengalami kendala login akun, lupa password, atau pertanyaan teknis seputar sistem sekolah.'
  }
};

const THEME_KEY = 'siakad_portal_theme';

// Active state
let portalData = { ...DEFAULT_GATEWAY_DATA };

// Fetch live telemetry from SIAKAD Manager
async function fetchManagerTelemetry() {
  for (const endpoint of MANAGER_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const json = await response.json();
        if (json.status === 'success') {
          if (json.institution) portalData.institution = json.institution;
          if (json.stats) Object.assign(portalData.stats, json.stats);
          if (json.cbt_status) portalData.cbt_status = json.cbt_status;
          if (json.guru_status) portalData.guru_status = json.guru_status;
          if (json.inventaris_status) portalData.inventaris_status = json.inventaris_status;
          if (json.urls) {
            Object.assign(portalData.urls, json.urls);
            // Normalisasi URL agar langsung membuka subdomain tanpa /login
            if (portalData.urls.smk) portalData.urls.smk = portalData.urls.smk.replace(/\/login\/?$/, '');
            if (portalData.urls.smp) portalData.urls.smp = portalData.urls.smp.replace(/\/login\/?$/, '');
          }
          if (json.helpdesk) {
            portalData.helpdesk = Object.assign(portalData.helpdesk || {}, json.helpdesk);
          }
          applyDataToUi();
          return;
        }
      }
    } catch (err) {
      // Continue to next endpoint or fallback
    }
  }

  // Fallback to active state
  applyDataToUi();
}

// Apply live URLs, metrics, and branding to DOM
function applyDataToUi() {
  let instName = (portalData.institution || 'Yayasan Tinta Emas Indonesia').trim();
  // Bersihkan label internal seperti (Client #SMK) agar tampilan portal publik tetap elegan
  instName = instName.replace(/\s*\(Client.*?\)/gi, '').trim();
  if (instName === 'Yayasan Tinta Emas') {
    instName = 'Yayasan Tinta Emas Indonesia';
  }

  // 1. Header Navbar Brand (PORTAL SIAKAD | Gateway Ekosistem Terpadu)
  const headerSubtitle = document.getElementById('headerSubtitle');
  if (headerSubtitle) {
    headerSubtitle.textContent = 'Gateway Ekosistem Terpadu';
  }

  // 2. Hero Section Branding
  const heroPillText = document.getElementById('heroPillText');
  if (heroPillText) {
    heroPillText.textContent = instName;
  }

  const heroSubtitleText = document.getElementById('heroSubtitleText');
  if (heroSubtitleText) {
    heroSubtitleText.textContent = `Pusat layanan digital integrasi ${instName} untuk akses cepat civitas akademika menuju sistem pembelajaran, ujian daring, dan tata kelola sekolah.`;
  }

  document.title = `Portal SIAKAD - ${instName} | Gateway Ekosistem Terpadu`;

  // 3. Stats Section (Live counts from SMK & SMP fleet)
  const elStudents = document.getElementById('statStudents');
  const elStaff = document.getElementById('statStaff');
  const elRombels = document.getElementById('statRombels');
  const elUptime = document.getElementById('statUptime');

  if (elStudents && portalData.stats.total_students) {
    elStudents.textContent = portalData.stats.total_students.toLocaleString('id-ID') + '+';
  }
  if (elStaff && portalData.stats.total_staff) {
    elStaff.textContent = portalData.stats.total_staff.toLocaleString('id-ID');
  }
  if (elRombels && portalData.stats.total_rombels) {
    elRombels.textContent = portalData.stats.total_rombels + ' Rombel';
  }
  if (elUptime && portalData.stats.uptime) {
    elUptime.textContent = portalData.stats.uptime;
  }

  // 4. Footer Branding
  const footerInstName = document.getElementById('footerInstitutionName');
  if (footerInstName) {
    footerInstName.textContent = `Portal SIAKAD ${instName}`;
  }
  const footerBrandTitle = document.getElementById('footerBrandTitle');
  if (footerBrandTitle) {
    footerBrandTitle.textContent = `PORTAL SIAKAD ${instName.toUpperCase()}`;
  }

  // 5. Module URLs & Status Badges
  const keys = ['smk', 'smp', 'cbt', 'guru', 'inventaris'];
  const moduleConfig = {
    smk: { name: 'SIAKAD SMK', activeLabel: 'Aktif', defaultLabel: 'Masuk SIAKAD SMK' },
    smp: { name: 'SIAKAD SMP', activeLabel: 'Aktif', defaultLabel: 'Masuk SIAKAD SMP' },
    cbt: { name: 'CBT Ujian Online', activeLabel: 'Siap Ujian', defaultLabel: 'Masuk Portal CBT' },
    guru: { name: 'Administrasi Guru', activeLabel: 'Aktif', defaultLabel: 'Akses Ruang Guru' },
    inventaris: { name: 'Inventaris & Sarpras', activeLabel: 'Terhubung', defaultLabel: 'Kelola Inventaris' }
  };

  keys.forEach((key) => {
    const rawUrl = portalData.urls ? portalData.urls[key] : null;
    const targetUrl = (rawUrl || '').trim();
    const btnLaunch = document.getElementById(`btnLaunch-${key}`);
    const statusEl = document.getElementById(`status-${key}`);
    const isOnline = Boolean(targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:'));

    if (btnLaunch) {
      if (isOnline) {
        btnLaunch.href = targetUrl;
        btnLaunch.classList.remove('btn-launch-off');
        btnLaunch.classList.remove('btn-launch-maintenance-cbt');
        btnLaunch.classList.remove('btn-launch-maintenance-inventaris');
        btnLaunch.title = 'Buka ' + targetUrl;
        btnLaunch.innerHTML = `<span>${moduleConfig[key].defaultLabel}</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
      } else {
        btnLaunch.href = '#';
        btnLaunch.classList.add('btn-launch-off');
        btnLaunch.title = `Modul ${moduleConfig[key].name} belum diaktifkan di Manager SIAKAD`;
        btnLaunch.innerHTML = `<span>Modul Nonaktif</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`;
      }
    }

    if (statusEl) {
      if (isOnline) {
        statusEl.className = 'status-indicator status-online';
        statusEl.innerHTML = `<span class="dot-green"></span> ${moduleConfig[key].activeLabel}`;
        statusEl.title = 'Terhubung langsung ke server ' + targetUrl;
      } else {
        statusEl.className = 'status-indicator status-unconfigured';
        statusEl.innerHTML = `<span class="dot-gray"></span> Nonaktif`;
        statusEl.title = 'Modul belum diaktifkan di Manager SIAKAD';
      }
    }

    // Specific live status override for CBT
    if (key === 'cbt' && portalData.cbt_status) {
      const cbtSt = portalData.cbt_status.status;
      if (cbtSt === 'maintenance') {
        if (statusEl) {
          statusEl.className = 'status-indicator status-maintenance';
          statusEl.innerHTML = `<span class="dot-amber"></span> Maintenance`;
          statusEl.title = 'Sistem CBT sedang dalam masa pemeliharaan & persiapan ujian';
        }
        if (btnLaunch) {
          btnLaunch.classList.remove('btn-launch-off');
          btnLaunch.classList.add('btn-launch-maintenance-cbt');
          btnLaunch.href = 'javascript:void(0)';
          btnLaunch.title = 'Sistem CBT sedang dalam masa pemeliharaan & persiapan ujian';
          btnLaunch.innerHTML = `<span>Mode Maintenance</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        }
      } else if (cbtSt === 'offline' || cbtSt === 'suspended') {
        if (statusEl) {
          statusEl.className = 'status-indicator status-unconfigured';
          statusEl.innerHTML = `<span class="dot-gray"></span> Ditutup`;
          statusEl.title = 'Sistem CBT sedang ditutup di luar jadwal ujian';
        }
        if (btnLaunch) {
          btnLaunch.classList.remove('btn-launch-maintenance-cbt');
          btnLaunch.classList.add('btn-launch-off');
          btnLaunch.href = '#';
          btnLaunch.innerHTML = `<span>CBT Ditutup</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`;
        }
      }
    }

    // Specific live status override for Guru (Administrasi Guru)
    if (key === 'guru' && portalData.guru_status) {
      const guruSt = portalData.guru_status.status;
      if (guruSt === 'maintenance') {
        if (statusEl) {
          statusEl.className = 'status-indicator status-maintenance';
          statusEl.innerHTML = `<span class="dot-amber"></span> Maintenance`;
          statusEl.title = 'Modul Administrasi Guru sedang dalam pemeliharaan';
        }
        if (btnLaunch) {
          btnLaunch.innerHTML = `<span>Mode Maintenance</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        }
      } else if (guruSt === 'offline' || guruSt === 'suspended') {
        if (statusEl) {
          statusEl.className = 'status-indicator status-unconfigured';
          statusEl.innerHTML = `<span class="dot-gray"></span> Nonaktif`;
          statusEl.title = 'Modul Administrasi Guru sedang dinonaktifkan';
        }
        if (btnLaunch) {
          btnLaunch.classList.add('btn-launch-off');
          btnLaunch.href = '#';
          btnLaunch.innerHTML = `<span>Modul Nonaktif</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`;
        }
      }
    }

    // Specific live status override for Inventaris & Sarpras
    if (key === 'inventaris') {
      const invSt = portalData.inventaris_status ? portalData.inventaris_status.status : 'maintenance';
      if (invSt === 'maintenance') {
        if (statusEl) {
          statusEl.className = 'status-indicator status-maintenance status-maintenance-inventaris';
          statusEl.innerHTML = `<span class="dot-amber-red"></span> Maintenance`;
          statusEl.title = 'Modul Inventaris & Sarpras sedang dalam tahap persiapan & pemeliharaan sistem';
        }
        if (btnLaunch) {
          btnLaunch.classList.remove('btn-launch-off');
          btnLaunch.classList.add('btn-launch-maintenance-inventaris');
          btnLaunch.href = 'javascript:void(0)';
          btnLaunch.title = 'Modul Inventaris & Sarpras sedang dalam tahap persiapan & pemeliharaan';
          btnLaunch.innerHTML = `<span>Mode Maintenance</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        }
      } else if (invSt === 'offline' || invSt === 'suspended') {
        if (statusEl) {
          statusEl.className = 'status-indicator status-unconfigured';
          statusEl.innerHTML = `<span class="dot-gray"></span> Nonaktif`;
          statusEl.title = 'Modul Inventaris & Sarpras belum diaktifkan';
        }
        if (btnLaunch) {
          btnLaunch.classList.remove('btn-launch-maintenance-inventaris');
          btnLaunch.classList.add('btn-launch-off');
          btnLaunch.href = '#';
          btnLaunch.innerHTML = `<span>Modul Nonaktif</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`;
        }
      }
    }
  });

  // 6. Helpdesk Contact Mirroring
  applyHelpdeskData();
}

// Mirror dynamic helpdesk contacts from SIAKAD Manager
function applyHelpdeskData() {
  const hd = portalData.helpdesk || {};
  const isActive = hd.is_active !== false;
  const floatingBtn = document.getElementById('floatingHelpdesk');
  const footerSection = document.getElementById('footerHelpdeskCol');
  const modalName = document.getElementById('hdModalName');
  const modalHours = document.getElementById('hdModalHours');
  const modalNotes = document.getElementById('hdModalNotes');
  const modalWaBtn = document.getElementById('hdModalWaBtn');
  const modalEmailBtn = document.getElementById('hdModalEmailBtn');
  const footerWa = document.getElementById('footerHelpdeskWa');
  const footerEmail = document.getElementById('footerHelpdeskEmail');
  const footerHours = document.getElementById('footerHelpdeskHours');

  if (!isActive) {
    if (floatingBtn) floatingBtn.style.display = 'none';
    if (footerSection) footerSection.style.display = 'none';
    return;
  }

  if (floatingBtn) floatingBtn.style.display = 'flex';
  if (footerSection) footerSection.style.display = 'block';

  const name = (hd.name || 'Helpdesk IT Yayasan').trim();
  const hours = (hd.hours || 'Senin - Sabtu: 07:00 - 16:00 WIB').trim();
  const notes = (hd.notes || 'Hubungi tim bantuan jika terkendala akses masuk.').trim();
  let rawWa = (hd.whatsapp || '').replace(/[^0-9]/g, '');
  if (rawWa.startsWith('0')) {
    rawWa = '62' + rawWa.substring(1);
  }
  const email = (hd.email || '').trim();

  if (modalName) modalName.textContent = name;
  if (modalHours) modalHours.textContent = hours;
  if (modalNotes) modalNotes.textContent = notes;
  if (footerHours) footerHours.textContent = hours;

  // WhatsApp setup
  if (rawWa) {
    const defaultMsg = encodeURIComponent(`Halo ${name}, saya butuh informasi / bantuan mengenai Portal SIAKAD (yatindosystem.net).`);
    const waUrl = `https://wa.me/${rawWa}?text=${defaultMsg}`;

    if (modalWaBtn) {
      modalWaBtn.href = waUrl;
      modalWaBtn.onclick = null;
      modalWaBtn.style.display = 'inline-flex';
      const textSpan = modalWaBtn.querySelector('.hd-btn-text');
      if (textSpan) textSpan.textContent = `Chat WhatsApp (+${rawWa})`;
    }
    if (footerWa) {
      footerWa.href = waUrl;
      footerWa.style.display = 'inline-flex';
      const valSpan = footerWa.querySelector('.footer-contact-val');
      if (valSpan) valSpan.textContent = `WhatsApp (+${rawWa})`;
    }
  } else {
    if (modalWaBtn) {
      modalWaBtn.href = 'javascript:void(0)';
      modalWaBtn.onclick = () => showToast('Kontak WhatsApp belum diatur di Manager SIAKAD.');
      const textSpan = modalWaBtn.querySelector('.hd-btn-text');
      if (textSpan) textSpan.textContent = 'WhatsApp Belum Diatur';
    }
    if (footerWa) footerWa.style.display = 'none';
  }

  // Email setup
  if (email) {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent('Bantuan Portal SIAKAD')}`;
    if (modalEmailBtn) {
      modalEmailBtn.href = mailtoUrl;
      modalEmailBtn.style.display = 'inline-flex';
      const textSpan = modalEmailBtn.querySelector('.hd-btn-text');
      if (textSpan) textSpan.textContent = email;
    }
    if (footerEmail) {
      footerEmail.href = mailtoUrl;
      footerEmail.style.display = 'inline-flex';
      const valSpan = footerEmail.querySelector('.footer-contact-val');
      if (valSpan) valSpan.textContent = email;
    }
  } else {
    if (modalEmailBtn) modalEmailBtn.style.display = 'none';
    if (footerEmail) footerEmail.style.display = 'none';
  }
}

// Toggle Helpdesk Modal
function toggleHelpdeskModal(isOpen) {
  const modal = document.getElementById('helpdeskModal');
  if (!modal) return;
  if (isOpen) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

let isTransitioning = false;

// Buka link modul dengan transisi debu & morphing form login
function navigateToModule(url, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (isTransitioning) return false;

  const cleanUrl = (url || '').trim();
  if (!cleanUrl || cleanUrl === '#' || cleanUrl.startsWith('javascript:')) {
    if (event && event.currentTarget) {
      if (event.currentTarget.classList.contains('btn-launch-maintenance-cbt') || event.currentTarget.id === 'btnLaunch-cbt') {
        showToast('Sistem CBT Ujian Online sedang dalam masa pemeliharaan & persiapan bank soal.');
        return false;
      }
      if (event.currentTarget.classList.contains('btn-launch-maintenance-inventaris') || event.currentTarget.id === 'btnLaunch-inventaris') {
        showToast('Modul Inventaris & Sarpras sedang dalam tahap persiapan & pemeliharaan sistem.');
        return false;
      }
    }
    showToast('Modul ini belum diaktifkan di Manager SIAKAD.');
    return false;
  }

  // Cari kartu portal yang bersangkutan
  let card = null;
  if (event && event.currentTarget) {
    card = event.currentTarget.closest('.portal-card');
  }
  if (!card) {
    if (cleanUrl.includes('smk.yatindosystem.net')) card = document.getElementById('portal-smk');
    else if (cleanUrl.includes('smp.yatindosystem.net')) card = document.getElementById('portal-smp');
    else if (cleanUrl.includes('admsmk.yatindosystem.net')) card = document.getElementById('portal-guru');
  }

  // Jika kartu aktif SIAKAD / Supervisi, aktifkan transisi debu & transformasi login
  if (card && (cleanUrl.includes('smk.yatindosystem.net') || cleanUrl.includes('smp.yatindosystem.net') || cleanUrl.includes('admsmk.yatindosystem.net'))) {
    triggerPortalTransition(card, cleanUrl);
    return false;
  }

  window.location.href = cleanUrl;
  return false;
}

function triggerPortalTransition(card, targetUrl) {
  if (isTransitioning) return;
  isTransitioning = true;

  // Metadata sistem sesuai modul
  let theme = 'smk';
  let title = 'Masuk ke Sistem SIAKAD';
  let school = 'SMK TINTA EMAS INDONESIA';
  let sub = 'SISTEM INFORMASI AKADEMIK';
  let icon = '🎓';
  let btnText = 'Masuk ke Sistem SIAKAD';
  let btnBg = 'linear-gradient(135deg, #475569 0%, #334155 100%)';
  let btnShadow = 'rgba(51, 65, 85, 0.35)';
  let accentColor = '#475569';

  if (targetUrl.includes('smp.yatindosystem.net')) {
    theme = 'smp';
    school = 'SMP TINTA EMAS INDONESIA';
    icon = '📖';
    btnBg = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
    btnShadow = 'rgba(37, 99, 235, 0.35)';
    accentColor = '#2563eb';
  } else if (targetUrl.includes('admsmk.yatindosystem.net')) {
    theme = 'guru';
    title = 'Masuk ke Portal Supervisi';
    school = 'SMK TINTA EMAS INDONESIA';
    sub = 'PORTAL SUPERVISI & RUANG GURU';
    icon = '👥';
    btnText = 'Masuk ke Sistem Supervisi';
    btnBg = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    btnShadow = 'rgba(124, 58, 237, 0.35)';
    accentColor = '#7c3aed';
  }

  // 1. Ambil koordinat awal kartu untuk efek FLIP smooth
  const rect = card.getBoundingClientRect();
  const initialWidth = rect.width;
  const initialHeight = rect.height;
  const initialTop = rect.top;
  const initialLeft = rect.left;

  // 2. Tampilkan backdrop gradien halus sesuai tema
  let backdrop = document.getElementById('portalTransitionBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'portalTransitionBackdrop';
    backdrop.className = `portal-transition-backdrop theme-${theme}`;
    document.body.appendChild(backdrop);
  } else {
    backdrop.className = `portal-transition-backdrop theme-${theme}`;
  }

  // Force reflow agar transisi CSS langsung terbaca
  backdrop.offsetHeight;
  backdrop.classList.add('active');

  // 3. Tambahkan efek debu pada seluruh elemen sekitar (semuanya menghilang bagai debu)
  document.body.classList.add('portal-transitioning');

  // 4. Kunci posisi kartu di koordinat awalnya
  card.style.position = 'fixed';
  card.style.top = initialTop + 'px';
  card.style.left = initialLeft + 'px';
  card.style.width = initialWidth + 'px';
  card.style.height = initialHeight + 'px';
  card.style.zIndex = '9999';
  card.style.margin = '0';
  card.classList.add('card-selected-morph');

  // 5. Animasi kartu membesar ke tengah dan bertransformasi jadi form login
  requestAnimationFrame(() => {
    card.innerHTML = `
      <div class="morph-login-preview">
        <div class="morph-brand-badge badge-${theme}">
          <span style="font-size: 1.35rem;">${icon}</span>
          <div style="display:flex; flex-direction:column; min-width:0;">
            <span style="font-size:0.75rem; font-weight:800; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${school}</span>
            <span style="font-size:0.63rem; font-weight:700; color:${accentColor}; letter-spacing:0.04em;">${sub}</span>
          </div>
        </div>
        <div style="font-family:'Outfit', var(--font-main); font-size:1.3rem; font-weight:800; color:#0f172a; margin-top:2px;">
          ${title}
        </div>
        <p style="font-size:0.8rem; color:#64748b; margin:0 0 4px; line-height:1.4;">
          Menghubungkan ke server autentikasi...
        </p>
        <div class="morph-inputs-mock">
          <div class="morph-input-row">
            <span>👤</span>
            <span>Email / Username</span>
          </div>
          <div class="morph-input-row">
            <span>🔒</span>
            <span>Kata Sandi</span>
          </div>
        </div>
        <div style="width:100%; padding:0.82rem 1rem; border-radius:10px; background:${btnBg}; color:#ffffff; font-weight:700; font-size:0.88rem; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow: 0 4px 14px ${btnShadow}; margin-top:4px;">
          <div class="morph-spinner-ring"></div>
          <span>${btnText}</span>
        </div>
      </div>
    `;

    const targetWidth = Math.min(window.innerWidth * 0.92, 440);
    const targetLeft = (window.innerWidth - targetWidth) / 2;
    const targetTop = Math.max(20, (window.innerHeight - 380) / 2);

    card.style.transition = 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.width = targetWidth + 'px';
    card.style.height = 'auto';
    card.style.minHeight = '360px';
    card.style.left = targetLeft + 'px';
    card.style.top = targetTop + 'px';
    card.style.padding = '24px';
  });

  // 6. Alihkan ke URL tujuan setelah animasi selesai
  setTimeout(() => {
    window.location.href = targetUrl;
  }, 620);
}

// Reset transisi saat kembali dari browser cache (bfcache)
window.addEventListener('pageshow', () => {
  isTransitioning = false;
  document.body.classList.remove('portal-transitioning');
  const backdrop = document.getElementById('portalTransitionBackdrop');
  if (backdrop) backdrop.remove();
  document.querySelectorAll('.portal-card').forEach(c => {
    c.removeAttribute('style');
    c.classList.remove('card-selected-morph');
  });
});

// Alias untuk kompatibilitas jika masih dipanggil di tempat lain
function openInNewTab(url, event) {
  return navigateToModule(url, event);
}

// Toast notification
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');
  if (!toast) return;

  if (toastText) toastText.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Realtime Indonesian Clock
function initClock() {
  const clockDisplay = document.getElementById('clockDisplay');
  if (!clockDisplay) return;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  function update() {
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockDisplay.textContent = `${dayName}, ${dateNum} ${monthName} ${year} • ${hours}:${minutes}:${seconds} WIB`;
  }

  update();
  setInterval(update, 1000);
}

// Dark / Light Theme Handler
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const iconSun = document.getElementById('themeIconSun');
  const iconMoon = document.getElementById('themeIconMoon');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      showToast(`Mode tampilan diubah ke: ${newTheme === 'dark' ? 'Gelap' : 'Terang'}`);
    });
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    if (theme === 'light') {
      if (iconSun) iconSun.style.display = 'inline-block';
      if (iconMoon) iconMoon.style.display = 'none';
    } else {
      if (iconSun) iconSun.style.display = 'none';
      if (iconMoon) iconMoon.style.display = 'inline-block';
    }
  }
}

// Header scroll shadow
window.addEventListener('scroll', () => {
  const header = document.getElementById('mainHeader');
  if (header) {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  applyDataToUi();
  fetchManagerTelemetry();
  initClock();
  initTheme();

  // Auto-sync telemetry every 60 seconds
  setInterval(fetchManagerTelemetry, 60000);

  // Jadikan seluruh card portal interaktif saat diklik
  document.querySelectorAll('.portal-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-launch') || e.target.closest('a')) return;
      const btn = card.querySelector('.btn-launch');
      if (btn) btn.click();
    });
  });
});

// ============================================================================
// PWA INSTALLATION & SERVICE WORKER ENGINE
// ============================================================================

let deferredPrompt = null;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const pwaBtn = document.getElementById('pwaInstallBtn');
  if (pwaBtn) {
    pwaBtn.classList.add('pwa-ready');
  }
});

// Listen for appinstalled event
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const pwaBtn = document.getElementById('pwaInstallBtn');
  if (pwaBtn) {
    pwaBtn.style.display = 'none';
  }
  showToast('Portal SIAKAD berhasil dipasang sebagai aplikasi!');
});

// Trigger installation prompt
async function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Memasang Portal SIAKAD ke perangkat Anda...');
    }
    deferredPrompt = null;
  } else {
    // Check if on iOS Safari or already standalone
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isStandalone) {
      showToast('Aplikasi Portal SIAKAD sudah terpasang di perangkat Anda.');
      return;
    }

    if (isIos) {
      showToast('Untuk pasang di iPhone/iPad: Ketuk ikon Bagikan (Share) di Safari, lalu pilih "Tambah ke Layar Utama".');
    } else {
      showToast('Untuk memasang: Buka menu browser (titik tiga) lalu pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama".');
    }
  }
}
