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
    status: 'active',
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
          statusEl.title = 'Sistem CBT sedang dalam masa pemeliharaan';
        }
        if (btnLaunch) {
          btnLaunch.innerHTML = `<span>Mode Maintenance</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        }
      } else if (cbtSt === 'offline' || cbtSt === 'suspended') {
        if (statusEl) {
          statusEl.className = 'status-indicator status-unconfigured';
          statusEl.innerHTML = `<span class="dot-gray"></span> Ditutup`;
          statusEl.title = 'Sistem CBT sedang ditutup di luar jadwal ujian';
        }
        if (btnLaunch) {
          btnLaunch.classList.add('btn-launch-off');
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

// Buka link modul di tab yang sama (tidak new tab)
function navigateToModule(url, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const cleanUrl = (url || '').trim();
  if (!cleanUrl || cleanUrl === '#' || cleanUrl.startsWith('javascript:')) {
    if (event && event.currentTarget && event.currentTarget.classList.contains('btn-launch-maintenance-inventaris')) {
      showToast('Modul Inventaris & Sarpras sedang dalam tahap persiapan & pemeliharaan sistem.');
      return false;
    }
    showToast('Modul ini belum diaktifkan di Manager SIAKAD.');
    return false;
  }

  window.location.href = cleanUrl;
  return false;
}

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
