// ============================================
//   ADMIN DASHBOARD PAGES
// ============================================

function renderAdminDashboard() {
  const content = document.getElementById('page-content');
  const inside = Students.filter(s => s.status === 'inside');
  const outside = Students.filter(s => s.status === 'outside');
  const pending = GatePasses.filter(p => p.status === 'pending');
  const approved = GatePasses.filter(p => p.status === 'approved');

  let bCnt = 0, lCnt = 0, dCnt = 0;
  Object.values(MessBookings).forEach(b => {
    if (b.breakfast === 'booked') bCnt++;
    if (b.lunch === 'booked') lCnt++;
    if (b.dinner === 'booked') dCnt++;
  });

  content.innerHTML = `
    <div style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <h2 style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700">Admin Dashboard ⚙️</h2>
        <p style="color:var(--text-secondary);font-size:14px;margin-top:4px">SmartCampus Overview · ${new Date().toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline btn-sm" onclick="navigateTo('reports')">📊 Reports</button>
        <button class="btn btn-primary btn-sm" onclick="showToast('System check passed! All services running.','success')">🔄 Refresh</button>
      </div>
    </div>

    <!-- Hero stats -->
    <div class="stats-grid">
      ${buildStatCard('🏫', 'green', inside.length, 'Students On Campus', `${Math.round(inside.length/Students.length*100)}% of total`, 'up', 'green')}
      ${buildStatCard('🚶', 'red', outside.length, 'Students Outside', `${outside.length} with valid pass`, outside.length > 0 ? 'up' : null, 'orange')}
      ${buildStatCard('⏳', 'orange', pending.length, 'Pending Passes', 'awaiting warden', pending.length > 0 ? 'up' : null, 'orange')}
      ${buildStatCard('📋', 'purple', GatePasses.length, 'Total Gate Passes', 'all time', 'up', '')}
    </div>

    <!-- Campus status visual -->
    <div class="card" style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(6,182,212,0.05));border-color:rgba(99,102,241,0.2)">
      <div class="card-header"><span class="card-title">🏫 Campus Occupancy Overview</span></div>
      <div style="display:flex;align-items:center;gap:32px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:13px;color:var(--text-secondary)">Campus Occupancy</span>
              <span style="font-size:13px;font-weight:600">${Math.round(inside.length/Students.length*100)}%</span>
            </div>
            <div class="progress-bar-wrap" style="height:12px">
              <div class="progress-bar purple" style="width:${Math.round(inside.length/Students.length*100)}%"></div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
            <div style="text-align:center;padding:16px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md)">
              <div style="font-size:32px;font-weight:800;color:var(--accent-green);font-family:'Space Grotesk',sans-serif">${inside.length}</div>
              <div style="font-size:12px;color:var(--text-muted)">Inside Campus</div>
            </div>
            <div style="text-align:center;padding:16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-md)">
              <div style="font-size:32px;font-weight:800;color:var(--accent-red);font-family:'Space Grotesk',sans-serif">${outside.length}</div>
              <div style="font-size:12px;color:var(--text-muted)">Outside Campus</div>
            </div>
          </div>
        </div>
        <div style="width:200px">
          <canvas id="adminLocationChart"></canvas>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title">⏳ Pending Gate Passes</span>
          <button class="btn btn-sm btn-outline" onclick="navigateTo('pending-admin')">View All</button>
        </div>
        ${pending.length === 0
          ? `<div class="alert alert-success">✅ No pending gate passes!</div>`
          : pending.slice(0, 3).map(p => `
            <div style="padding:12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius-md);margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <code style="color:var(--accent-primary);font-size:12px">${p.id}</code>
                  <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-top:2px">${p.studentName}</div>
                  <div style="font-size:12px;color:var(--text-muted)">${p.reason} · ${p.from}</div>
                </div>
                ${buildBadge(p.status)}
              </div>
            </div>
          `).join('')
        }
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">📊 Gate Pass Analytics</span>
        </div>
        <div class="chart-container">
          <canvas id="adminPassChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Mess overview -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">🍽️ Today's Mess Statistics</span>
        <button class="btn btn-sm btn-outline" onclick="navigateTo('mess-stats')">Full Report</button>
      </div>
      <div class="grid-3">
        ${[['🍳 Breakfast', bCnt, 'orange'], ['🍛 Lunch', lCnt, 'cyan'], ['🍽️ Dinner', dCnt, 'purple']].map(([name, count]) => `
          <div style="text-align:center;padding:16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md)">
            <div style="font-size:24px;margin-bottom:8px">${name.split(' ')[0]}</div>
            <div style="font-size:28px;font-weight:700;font-family:'Space Grotesk',sans-serif;color:var(--text-primary)">${count}</div>
            <div style="font-size:12px;color:var(--text-muted)">students booked</div>
            <div class="progress-bar-wrap" style="margin-top:8px">
              <div class="progress-bar purple" style="width:${Math.round(count/Students.length*100)}%"></div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${Math.round(count/Students.length*100)}% attendance</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Recent entry/exit -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">🔁 Recent Campus Activity</span>
        <span class="badge badge-active">Live</span>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Time</th><th>Student</th><th>Action</th><th>Pass ID</th></tr></thead>
        <tbody>
          ${EntryExitLogs.slice(0,6).map(l => `<tr>
            <td style="font-size:12px">${l.time}</td>
            <td>${l.studentName}</td>
            <td><span class="badge ${l.type==='entry'?'badge-in':'badge-out'}">${l.type==='entry'?'⬅️ Entry':'➡️ Exit'}</span></td>
            <td><code style="color:var(--accent-primary)">${l.passId}</code></td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;

  createChart('adminLocationChart', {
    type: 'doughnut',
    data: {
      labels: ['Inside', 'Outside'],
      datasets: [{ data: [inside.length, outside.length],
        backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(239,68,68,0.85)'],
        borderColor: ['#10b981', '#ef4444'], borderWidth: 2
      }]
    },
    options: { responsive: true, maintainAspectRatio: true, cutout: '60%',
      plugins: { legend: { position: 'bottom', labels: { padding: 12, boxWidth: 10 } } }
    }
  });

  const statuses = { approved: 0, pending: 0, rejected: 0 };
  GatePasses.forEach(p => { if (statuses[p.status] !== undefined) statuses[p.status]++; });
  createChart('adminPassChart', {
    type: 'doughnut',
    data: {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{ data: [statuses.approved, statuses.pending, statuses.rejected],
        backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
        borderColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 2
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderCampusStatus() {
  const content = document.getElementById('page-content');
  const inside = Students.filter(s => s.status === 'inside');
  const outside = Students.filter(s => s.status === 'outside');

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700">🏫 Campus Status — Real Time</h2>
    </div>
    <div class="grid-2">
      <div class="card" style="border-color:rgba(16,185,129,0.3)">
        <div class="card-header">
          <span class="card-title" style="color:var(--accent-green)">✅ Inside Campus (${inside.length})</span>
        </div>
        ${inside.map(s => `<div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-md);margin-bottom:6px;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.1)">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--grad-green);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700">${s.avatar}</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${s.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${s.id} · ${s.room} · ${s.branch}</div>
          </div>
        </div>`).join('')}
      </div>
      <div class="card" style="border-color:rgba(239,68,68,0.3)">
        <div class="card-header">
          <span class="card-title" style="color:var(--accent-red)">🚶 Outside Campus (${outside.length})</span>
        </div>
        ${outside.length === 0 ? `<div class="empty-state"><div class="empty-icon">🏠</div><p>No students outside</p></div>` :
          outside.map(s => {
            const pass = GatePasses.find(p => p.studentId === s.id && p.status === 'approved');
            return `<div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-md);margin-bottom:6px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.1)">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700">${s.avatar}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${s.name}</div>
                <div style="font-size:11px;color:var(--text-muted)">${s.id} · ${pass ? pass.destination : 'N/A'}</div>
              </div>
              <div style="font-size:11px;color:var(--accent-orange)">Return: ${pass ? pass.to : 'N/A'}</div>
            </div>`;
          }).join('')
        }
      </div>
    </div>
  `;
}

function renderPendingAdmin() {
  const content = document.getElementById('page-content');
  const pending = GatePasses.filter(p => p.status === 'pending');
  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700">⏳ Pending Gate Passes</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-top:4px">${pending.length} requests awaiting warden review</p>
    </div>
    ${pending.length === 0 ? `<div class="empty-state"><div class="empty-icon">✅</div><p>All gate pass requests have been processed.</p></div>` :
      `<div class="card">
        <div class="table-wrapper"><table>
          <thead><tr><th>Pass ID</th><th>Student</th><th>Reason</th><th>Destination</th><th>Dates</th><th>Type</th><th>Submitted</th></tr></thead>
          <tbody>
            ${pending.map(p => `<tr>
              <td><code style="color:var(--accent-primary)">${p.id}</code></td>
              <td><strong>${p.studentName}</strong></td>
              <td>${p.reason}</td>
              <td>${p.destination}</td>
              <td style="font-size:12px">${p.from} → ${p.to}</td>
              <td>${p.type}</td>
              <td style="font-size:12px;color:var(--text-muted)">${p.createdAt}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>
      </div>`
    }
  `;
}

function renderAllStudents() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">👥 All Students</span>
        <span style="color:var(--text-muted);font-size:13px">${Students.length} students registered</span>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Name</th><th>Student ID</th><th>Room</th><th>Year</th><th>Branch</th><th>Phone</th><th>Campus Status</th><th>Gate Passes</th></tr></thead>
        <tbody>
          ${Students.map(s => {
            const passes = GatePasses.filter(p => p.studentId === s.id).length;
            return `<tr>
              <td><div style="display:flex;align-items:center;gap:8px">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${s.avatar}</div>
                <span style="font-weight:500">${s.name}</span>
              </div></td>
              <td><code style="color:var(--accent-primary)">${s.id}</code></td>
              <td>${s.room}</td>
              <td>${s.year}</td>
              <td>${s.branch}</td>
              <td style="font-size:12px">${s.phone}</td>
              <td>${statusDot(s.status)}${buildBadge(s.status)}</td>
              <td style="text-align:center">${passes}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

function renderMessStats() {
  const content = document.getElementById('page-content');
  let bCnt = 0, lCnt = 0, dCnt = 0, allSkip = 0;
  Object.values(MessBookings).forEach(b => {
    if (b.breakfast === 'booked') bCnt++;
    if (b.lunch === 'booked') lCnt++;
    if (b.dinner === 'booked') dCnt++;
    if (Object.values(b).every(v => v === 'skipped')) allSkip++;
  });

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700">🍽️ Mess Statistics</h2>
    </div>
    <div class="stats-grid">
      ${buildStatCard('🍳', 'orange', bCnt, 'Breakfast Bookings', `${Math.round(bCnt/Students.length*100)}% of students`, 'up', 'orange')}
      ${buildStatCard('🍛', 'cyan', lCnt, 'Lunch Bookings', `${Math.round(lCnt/Students.length*100)}% of students`, 'up', 'cyan')}
      ${buildStatCard('🍽️', 'purple', dCnt, 'Dinner Bookings', `${Math.round(dCnt/Students.length*100)}% of students`, 'up', '')}
      ${buildStatCard('⚠️', 'red', allSkip, 'All Meals Skipped', 'students today', allSkip > 0 ? 'up' : null, 'orange')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">📊 Today vs This Week Average</span></div>
        <div class="chart-container">
          <canvas id="messCompare"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">📈 Weekly Trend</span></div>
        <div class="chart-container">
          <canvas id="messAdminWeek"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">📋 Student Meal Preferences</span></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Student</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Meals/Day</th><th>Est. Cost</th></tr></thead>
        <tbody>
          ${Students.map(s => {
            const b = MessBookings[s.id] || {};
            const total = Object.values(b).filter(v => v === 'booked').length;
            const cost = total * 80;
            return `<tr>
              <td>${s.name}</td>
              <td>${b.breakfast === 'booked' ? '✅' : '❌'}</td>
              <td>${b.lunch === 'booked' ? '✅' : '❌'}</td>
              <td>${b.dinner === 'booked' ? '✅' : '❌'}</td>
              <td><span style="font-weight:700;color:${total>=2?'var(--accent-green)':'var(--accent-orange)'}">${total}</span></td>
              <td style="color:var(--accent-cyan)">₹${cost}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>
  `;

  const avgBreakfast = Math.round(MessWeekData.breakfast.reduce((a,b)=>a+b,0)/7);
  const avgLunch = Math.round(MessWeekData.lunch.reduce((a,b)=>a+b,0)/7);
  const avgDinner = Math.round(MessWeekData.dinner.reduce((a,b)=>a+b,0)/7);

  createChart('messCompare', {
    type: 'bar',
    data: {
      labels: ['Breakfast', 'Lunch', 'Dinner'],
      datasets: [
        { label: 'Today', data: [bCnt, lCnt, dCnt], backgroundColor: ['rgba(245,158,11,0.8)','rgba(6,182,212,0.8)','rgba(139,92,246,0.8)'], borderRadius: 6 },
        { label: 'Week Avg', data: [avgBreakfast, avgLunch, avgDinner], backgroundColor: ['rgba(245,158,11,0.2)','rgba(6,182,212,0.2)','rgba(139,92,246,0.2)'], borderRadius: 6 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });

  createChart('messAdminWeek', {
    type: 'line',
    data: {
      labels: MessWeekData.labels,
      datasets: [
        { label: 'Breakfast', data: MessWeekData.breakfast, borderColor: '#f59e0b', tension: 0.4, borderWidth: 2, pointBackgroundColor: '#f59e0b' },
        { label: 'Lunch', data: MessWeekData.lunch, borderColor: '#06b6d4', tension: 0.4, borderWidth: 2, pointBackgroundColor: '#06b6d4' },
        { label: 'Dinner', data: MessWeekData.dinner, borderColor: '#8b5cf6', tension: 0.4, borderWidth: 2, pointBackgroundColor: '#8b5cf6' },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

function renderReports() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700">📊 System Reports</h2>
    </div>
    <div class="grid-3">
      ${[
        { icon:'🎫', title:'Gate Pass Report', desc:'Monthly summary of all gate pass requests, approvals,  and rejections.', color:'purple' },
        { icon:'🍽️', title:'Mess Report', desc:'Weekly and monthly mess attendance, meal counts, and cost analysis.', color:'cyan' },
        { icon:'🔒', title:'Security Report', desc:'Entry/exit logs, guard activity, and anomaly detection summary.', color:'green' },
        { icon:'👥', title:'Student Report', desc:'Student-wise history, pass frequency, and mess engagement report.', color:'orange' },
        { icon:'📈', title:'Analytics Report', desc:'Trend analysis and pattern detection across all campus metrics.', color:'pink' },
        { icon:'⚙️', title:'System Audit', desc:'Admin actions, data changes, and security audit trail.', color:'red' },
      ].map(r => `
        <div class="stat-card" style="flex-direction:column;align-items:flex-start;gap:12px;cursor:pointer" onclick="showToast('Generating ${r.title}...','info')">
          <div class="stat-icon ${r.color}" style="font-size:28px;width:52px;height:52px">${r.icon}</div>
          <div>
            <div style="font-size:15px;font-weight:700">${r.title}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.5">${r.desc}</div>
          </div>
          <button class="btn btn-outline btn-sm" style="width:100%;margin-top:auto" onclick="event.stopPropagation();showToast('Downloading ${r.title}...','success')">⬇️ Download PDF</button>
        </div>
      `).join('')}
    </div>

    <div class="card" style="margin-top:4px">
      <div class="card-header"><span class="card-title">📆 Quick Stats Summary</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
        ${[
          ['Total Students', Students.length, '👥'],
          ['Total Gate Passes', GatePasses.length, '🎫'],
          ['Approved Passes', GatePasses.filter(p=>p.status==='approved').length, '✅'],
          ['Pending Passes', GatePasses.filter(p=>p.status==='pending').length, '⏳'],
          ['Rejected Passes', GatePasses.filter(p=>p.status==='rejected').length, '❌'],
          ['Campus Entries Today', EntryExitLogs.filter(l=>l.type==='entry').length, '⬅️'],
          ['Campus Exits Today', EntryExitLogs.filter(l=>l.type==='exit').length, '➡️'],
          ['Students Outside', Students.filter(s=>s.status==='outside').length, '🚶'],
        ].map(([label, val, icon]) => `
          <div style="text-align:center;padding:14px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md)">
            <div style="font-size:20px;margin-bottom:6px">${icon}</div>
            <div style="font-size:24px;font-weight:700;font-family:'Space Grotesk',sans-serif;color:var(--text-primary)">${val}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${label}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function renderUserMgmt() {
  const content = document.getElementById('page-content');
  const displayUsers = Users.length > 0 ? Users : [...Object.values(RoleUsers), ...Students];
  
  content.innerHTML = `
    <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <h2 style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700">👥 User Account Management</h2>
        <p style="color:var(--text-secondary);font-size:13px;margin-top:4px">Manage 50+ student identities, passwords, and roles.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openAddUserModal()">+ Add New User</button>
    </div>

    <div class="card">
      <div class="table-wrapper"><table>
        <thead><tr><th>Profile</th><th>Username</th><th>Password</th><th>Role</th><th>ID</th><th>Actions</th></tr></thead>
        <tbody id="user-mgmt-list">
          ${displayUsers.map(u => `
            <tr>
              <td><div style="display:flex;align-items:center;gap:8px">
                <div style="width:30px;height:30px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${(u.avatar || u.name[0] || '?').toUpperCase()}</div>
                <strong>${u.name || 'Unknown'}</strong>
              </div></td>
              <td><code>${u.username || (u.id ? u.id.toLowerCase() : 'N/A')}</code></td>
              <td><code>••••••••</code></td>
              <td>${buildBadge(u.role || 'student')}</td>
              <td><code>${u.id}</code></td>
              <td style="display:flex;gap:8px">
                <button class="btn btn-sm btn-outline" style="padding:4px 8px" onclick="openEditUserModal('${u.id}')">✏️ Edit</button>
                <button class="btn btn-sm btn-outline" style="padding:4px 8px;border-color:var(--accent-red);color:var(--accent-red)" onclick="deleteUser('${u.id}')">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

function openAddUserModal() {
  openModal(`
    <div class="modal" style="max-width:500px">
      <div class="modal-header">
        <span class="modal-title">👤 Add New User</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <form onsubmit="handleNewUser(event)">
        <div class="input-group">
          <label>Role</label>
          <select id="new-role" onchange="toggleStudentFields(this.value)">
            <option value="student">Student</option>
            <option value="warden">Warden</option>
            <option value="security">Security</option>
            <option value="mess">Mess Manager</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <div class="input-group"><label>Full Name</label><input id="new-name" placeholder="e.g. Rahul Sharma" required /></div>
        <div class="form-row">
          <div class="input-group"><label>Username</label><input id="new-user" placeholder="login username" required /></div>
          <div class="input-group"><label>Password</label><input id="new-pass" type="password" placeholder="••••••••" required /></div>
        </div>
        <div class="input-group"><label>User ID</label><input id="new-id" placeholder="e.g. S051" required /></div>
        
        <div id="student-only-fields">
          <div class="form-row">
            <div class="input-group"><label>Room No</label><input id="new-room" placeholder="e.g. 101" /></div>
            <div class="input-group"><label>Year</label><input id="new-year" placeholder="e.g. 3rd Year" /></div>
          </div>
          <div class="input-group"><label>Branch</label><input id="new-branch" placeholder="e.g. CSE" /></div>
        </div>

        <div class="modal-footer" style="padding:0">
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:12px">Register User 🚀</button>
        </div>
      </form>
    </div>
  `);
  // Default show student fields as student is selected by default
  toggleStudentFields('student');
}

function toggleStudentFields(role) {
  const fields = document.getElementById('student-only-fields');
  if (fields) {
    fields.style.display = role === 'student' ? 'block' : 'none';
  }
}

function handleNewUser(e) {
  e.preventDefault();
  const role = document.getElementById('new-role').value;
  const userData = {
    name: document.getElementById('new-name').value.trim(),
    username: document.getElementById('new-user').value.trim().toLowerCase(),
    password: document.getElementById('new-pass').value.trim(),
    id: document.getElementById('new-id').value.trim(),
    role: role
  };
  
  // Add optional student fields
  if (role === 'student') {
    userData.room = document.getElementById('new-room').value.trim() || 'N/A';
    userData.year = document.getElementById('new-year').value.trim() || 'N/A';
    userData.branch = document.getElementById('new-branch').value.trim() || 'N/A';
    userData.avatar = userData.name ? userData.name[0].toUpperCase() : 'S';
    userData.status = 'inside'; // Default for new students
  }

  if (socket) {
    socket.emit('ADD_USER', userData);
    showToast(`User ${userData.name} added!`, 'success');
  } else {
    // Fallback if socket is not connected
    showToast('Real-time connection missing. Adding to mock list.', 'warning');
    if (role === 'student') Students.push(userData);
    else RoleUsers[role] = userData;
  }
  
  closeModal();
  // Use navigateTo to refresh full state correctly
  setTimeout(() => navigateTo('user-mgmt'), 100);
}

function openEditUserModal(userId) {
  const u = (Users.length > 0 ? Users : [...Object.values(RoleUsers), ...Students]).find(x => x.id === userId);
  if (!u) return;
  openModal(`
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">✏️ Edit User: ${u.name}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <form onsubmit="handleUpdateUser(event, '${userId}')">
        <div class="input-group"><label>Full Name</label><input id="edit-name" value="${u.name}" required /></div>
        <div class="input-group"><label>New Password (leave blank to keep current)</label><input id="edit-pass" type="password" placeholder="••••••••" /></div>
        <div class="modal-footer"><button type="submit" class="btn btn-success" style="width:100%">Save Changes ✅</button></div>
      </form>
    </div>
  `);
}

function handleUpdateUser(e, id) {
  e.preventDefault();
  const n = document.getElementById('edit-name').value;
  const p = document.getElementById('edit-pass').value;
  if (socket) {
    socket.emit('UPDATE_USER', { id, name: n, password: p || undefined });
    showToast('User updated!', 'success');
  }
  closeModal();
  renderUserMgmt();
}

function deleteUser(id) {
  if (confirm('Delete this user account? This cannot be undone.')) {
    if (socket) socket.emit('DELETE_USER', id);
    showToast('User deleted.', 'error');
    renderUserMgmt();
  }
}
