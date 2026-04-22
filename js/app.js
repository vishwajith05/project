// ============================================
//   SMART CAMPUS — CORE APP LOGIC (REAL-TIME)
// ============================================

let selectedRole = 'student';
let sidebarCollapsed = false;
let clockInterval = null;
let allCharts = {};
let socket = null; 
let Users = []; // Real user list from server

// Initialize Socket.io Connection
function initSocket() {
  try {
    socket = io(); // Connects to the same host/port

    socket.on('connect', () => {
      console.log('🔗 Connected to real-time server');
      // showToast('Connected!', 'success'); // Optional, maybe too noisy
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from server');
      showToast('Offline mode — auto-reconnecting...', 'warning');
    });

    socket.on('SYNC_STATE', (db) => {
      console.log('🔄 State sync from server');
      if (db.users) {
        Users = db.users;
        // Sync Students array for backward compatibility across other JS files
        const newStudents = Users.filter(u => u.role === 'student');
        Students.splice(0, Students.length, ...newStudents);
      }
      if (db.gatePasses) GatePasses.splice(0, GatePasses.length, ...db.gatePasses);
      if (db.logs) EntryExitLogs.splice(0, EntryExitLogs.length, ...db.logs);
      if (db.messBookings) {
        Object.keys(MessBookings).forEach(k => delete MessBookings[k]);
        Object.assign(MessBookings, db.messBookings);
      }
      if (db.messMenu) {
        Object.keys(MessSchedule).forEach(k => delete MessSchedule[k]);
        Object.assign(MessSchedule, db.messMenu);
      }
      if (db.feedbacks) {
        Feedbacks.splice(0, Feedbacks.length, ...db.feedbacks);
      }
      // Re-render current page if logged in
      if (!document.getElementById('app').classList.contains('hidden')) {
        navigateTo(AppState.currentPage);
      }
    });

    socket.on('GATE_PASS_ADDED', (newPass) => {
      // Check if it already exists to avoid dupes from SYNC_STATE
      if (!GatePasses.find(p => p.id === newPass.id)) {
        GatePasses.push(newPass);
        if (AppState.currentRole === 'warden' && AppState.currentPage === 'pending-passes') {
          navigateTo('pending-passes');
        }
      }
    });

    socket.on('GATE_PASS_UPDATED', (updatedPass) => {
      const idx = GatePasses.findIndex(p => p.id === updatedPass.id);
      if (idx !== -1) GatePasses[idx] = updatedPass;
      // Re-render if viewed
      if (AppState.currentPage === 'gate-pass' || AppState.currentPage === 'pending-passes' || AppState.currentPage === 'dashboard') {
        navigateTo(AppState.currentPage);
      }
    });

    socket.on('MESS_BOOKING_UPDATED', (data) => {
      if (!MessBookings[data.studentId]) MessBookings[data.studentId] = {};
      MessBookings[data.studentId][data.meal] = data.status;
      if (AppState.currentPage === 'mess-booking' || AppState.currentPage === 'meal-counts' || AppState.currentPage === 'dashboard') {
        navigateTo(AppState.currentPage);
      }
    });

    socket.on('LOG_ADDED', (log) => {
      if (!EntryExitLogs.find(l => l.id === log.id)) {
        EntryExitLogs.unshift(log);
        if (AppState.currentPage === 'entry-exit' || AppState.currentPage === 'dashboard') {
          navigateTo(AppState.currentPage);
        }
      }
    });

    socket.on('NOTIFICATION', (notif) => {
      if (AppState.currentRole === 'student' && AppState.currentUser.id === notif.studentId) {
        showToast(notif.text, notif.color === 'green' ? 'success' : 'error');
        // Add to local notification record if we had one
        if (!Notifications.student) Notifications.student = [];
        Notifications.student.unshift({ text: notif.text, time: 'Just now', color: notif.color });
        buildNotifications('student');
      }
    });

    socket.on('MENU_UPDATED', (newMenu) => {
      Object.keys(MessSchedule).forEach(k => delete MessSchedule[k]);
      Object.assign(MessSchedule, newMenu);
      if (AppState.currentPage === 'mess-menu' || AppState.currentPage === 'menu-mgmt') {
        navigateTo(AppState.currentPage);
      }
    });

    socket.on('FEEDBACK_ADDED', (feedback) => {
      if (!Feedbacks.find(f => f.id === feedback.id)) {
        Feedbacks.unshift(feedback);
        if (AppState.currentPage === 'feedback') {
          navigateTo('feedback');
        }
      }
    });

  } catch (err) {
    console.warn('❌ Socket.io failed to initialize. Falling back to local mode.');
  }
}

// ---- Login ----
function selectRole(role, btn) {
  selectedRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function handleLogin(e) {
  e.preventDefault();
  const userInp = document.getElementById('login-user').value.trim().toLowerCase();
  const passInp = document.getElementById('login-pass').value.trim();

  console.log('--- LOGIN ATTEMPT ---');
  console.log('User Input:', userInp);
  console.log('Users in local state:', Users.length);

  // 1. Try to find user in the live synced list (Real-time mode)
  let user = Users.find(u => {
    const dbUser = (u.username || '').toLowerCase();
    const dbId = (u.id || '').toLowerCase();
    const dbName = (u.name || '').toLowerCase();
    // Allow login via username, ID, or full name for better UX
    return (dbUser === userInp || dbId === userInp || dbName === userInp) && u.password === passInp;
  });
  
  // 2. Fallback for Demo/Offline mode
  if (!user && Users.length === 0) {
    console.log('Offline/Local Mode: Checking static credentials...');
    
    // Check RoleUsers (Admin, Warden, etc.)
    for (const [role, demoData] of Object.entries(RoleUsers)) {
      if ((userInp === demoData.username.toLowerCase() || userInp === demoData.id.toLowerCase()) && passInp === demoData.password) {
        user = { ...demoData, role };
        break;
      }
    }

    // Check Students array (for newly added students in local mode)
    if (!user) {
      const student = Students.find(s => 
        (s.username?.toLowerCase() === userInp || s.id?.toLowerCase() === userInp) && s.password === passInp
      );
      if (student) user = { ...student, role: 'student' };
    }
  }

  if (!user) {
    showToast('Invalid credentials!', 'error');
    console.warn('Login failed: User not found or password mismatch.');
    return;
  }

  AppState.currentRole = user.role;
  AppState.currentUser = user;
  
  showToast(`Welcome, ${user.name}!`, 'success');
  initApp();
}

function handleLogout() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  Object.values(allCharts).forEach(c => { try { c.destroy(); } catch(ex) {} });
  allCharts = {};
  if (clockInterval) clearInterval(clockInterval);
}

// ---- App init ----
function initApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  const role = AppState.currentRole;
  const user = AppState.currentUser;

  document.getElementById('sidebar-username').textContent = user.name;
  document.getElementById('sidebar-role').textContent = RoleNames[role];
  document.getElementById('user-avatar').textContent = user.name[0];

  buildSidebarNav(role);
  buildNotifications(role);
  updateClock();
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(updateClock, 1000);
  navigateTo('dashboard');
}

function buildSidebarNav(role) {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  const menu = NavMenus[role];
  let lastSection = '';
  menu.forEach(item => {
    if (item.section && item.section !== lastSection) {
      lastSection = item.section;
      const lbl = document.createElement('div');
      lbl.className = 'nav-section-label';
      lbl.textContent = item.section;
      nav.appendChild(lbl);
    }
    const el = document.createElement('div');
    el.className = 'nav-item';
    el.id = `nav-${item.id}`;
    el.innerHTML = `<span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span>`;
    el.onclick = () => navigateTo(item.id);
    nav.appendChild(el);
  });
}

function navigateTo(pageId) {
  AppState.currentPage = pageId;

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.getElementById(`nav-${pageId}`);
  if (activeNav) activeNav.classList.add('active');

  const role = AppState.currentRole;
  const menu = NavMenus[role];
  const item = menu.find(m => m.id === pageId);
  document.getElementById('breadcrumb').textContent = item ? item.label : 'Dashboard';

  Object.values(allCharts).forEach(c => { try { c.destroy(); } catch(ex) {} });
  allCharts = {};

  const content = document.getElementById('page-content');
  content.innerHTML = '';
  content.className = 'page-content page-animate';

  const rolePages = {
    student: { dashboard: renderStudentDashboard, 'gate-pass': renderGatePassPage, 'gate-history': renderGateHistory, 'qr-pass': renderQRPage, 'mess-booking': renderMessBooking, 'mess-menu': renderMessMenu },
    warden: { dashboard: renderWardenDashboard, 'pending-passes': renderPendingPasses, 'all-passes': renderAllPasses, students: renderStudentsPage },
    security: { dashboard: renderSecurityDashboard, scanner: renderScanner, 'entry-exit': renderEntryExit, 'active-passes': renderActivePasses },
    mess: { dashboard: renderMessDashboard, 'meal-counts': renderMealCounts, attendance: renderAttendance, 'menu-mgmt': renderMenuMgmt, feedback: renderFeedback },
    admin: { dashboard: renderAdminDashboard, 'campus-status': renderCampusStatus, 'pending-admin': renderPendingAdmin, 'all-students': renderAllStudents, 'mess-stats': renderMessStats, 'user-mgmt': renderUserMgmt, reports: renderReports },
  };

  const pages = rolePages[AppState.currentRole] || {};
  const renderer = pages[pageId];
  if (renderer) renderer();
  else content.innerHTML = `<div class="empty-state"><div class="empty-icon">🚧</div><p>This page is under construction</p></div>`;

  // Mobile nav bar logic
  const mobileNav = document.getElementById('mobile-nav-bar');
  if (mobileNav) {
    if (window.innerWidth <= 768 && role === 'student') {
      mobileNav.classList.remove('hidden');
    } else {
      mobileNav.classList.add('hidden');
    }
  }

  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('notification-panel').classList.add('hidden');
}

// ---- UI Helpers ----
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main-content');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebarCollapsed = !sidebarCollapsed;
    sidebar.classList.toggle('collapsed', sidebarCollapsed);
    main.classList.toggle('expanded', sidebarCollapsed);
  }
}

function updateClock() {
  const el = document.getElementById('top-bar-time');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function buildNotifications(role) {
  const notifs = Notifications[role] || [];
  const list = document.getElementById('notif-list');
  list.innerHTML = '';
  notifs.forEach(n => {
    const colorMap = { green: 'var(--accent-green)', cyan: 'var(--accent-cyan)', orange: 'var(--accent-orange)', red: 'var(--accent-red)' };
    list.innerHTML += `<div class="notif-item">
      <div class="notif-dot" style="background:${colorMap[n.color] || 'var(--accent-primary)'}"></div>
      <div><div class="notif-text">${n.text}</div><div class="notif-time">${n.time}</div></div>
    </div>`;
  });
  document.getElementById('notif-badge').textContent = notifs.length;
}

function toggleNotifications() {
  document.getElementById('notification-panel').classList.toggle('hidden');
}

function showToast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// Modal
function openModal(htmlContent) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal';
  overlay.innerHTML = htmlContent;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}

function closeModal() {
  const m = document.getElementById('active-modal');
  if (m) m.remove();
}

// Builders
function buildStatCard(icon, iconClass, value, label, change, changeDir, cardClass) {
  return `<div class="stat-card ${cardClass || ''}">
    <div class="stat-icon ${iconClass}">${icon}</div>
    <div class="stat-info">
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
      ${change ? `<div class="stat-change ${changeDir}">${changeDir === 'up' ? '↑' : '↓'} ${change}</div>` : ''}
    </div>
  </div>`;
}

function buildBadge(status) {
  const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', active: 'badge-active', inside: 'badge-in', outside: 'badge-out' };
  return `<span class="badge ${map[status] || 'badge-pending'}">${status}</span>`;
}

function statusDot(status) {
  const color = status === 'inside' ? 'var(--accent-green)' : 'var(--accent-red)';
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:8px;box-shadow:0 0 8px ${color}"></span>`;
}

function createChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const chart = new Chart(canvas, config);
  allCharts[canvasId] = chart;
  return chart;
}

// Start
initSocket();

// Chart defaults
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
