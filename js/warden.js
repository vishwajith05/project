// ============================================
//   WARDEN DASHBOARD PAGES
// ============================================

function renderWardenDashboard() {
  const content = document.getElementById('page-content');
  const pending = GatePasses.filter(p => p.status === 'pending');
  const approved = GatePasses.filter(p => p.status === 'approved');
  const rejected = GatePasses.filter(p => p.status === 'rejected');
  const outside = Students.filter(s => s.status === 'outside');

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700">Warden Dashboard 🏠</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-top:4px">Hostel A & B Block · ${new Date().toLocaleDateString('en-IN', {weekday:'long',day:'numeric',month:'long'})}</p>
    </div>

    <div class="stats-grid">
      ${buildStatCard('⏳', 'orange', pending.length, 'Pending Requests', 'needs review', pending.length > 0 ? 'up' : null, 'orange')}
      ${buildStatCard('✅', 'green', approved.length, 'Approved Passes', null, null, 'green')}
      ${buildStatCard('❌', 'red', rejected.length, 'Rejected Passes', null, null, 'orange')}
      ${buildStatCard('🚶', 'purple', outside.length, 'Students Outside', null, null, '')}
    </div>

    ${pending.length > 0 ? `
    <div class="card" style="border-color:rgba(245,158,11,0.3)">
      <div class="card-header">
        <span class="card-title">⚡ Action Required — Pending Passes</span>
        <span class="badge badge-pending">${pending.length} pending</span>
      </div>
      ${pending.slice(0,3).map(p => renderPassCard(p, true)).join('')}
      ${pending.length > 3 ? `<button class="btn btn-outline" style="width:100%;margin-top:8px" onclick="navigateTo('pending-passes')">View all ${pending.length} pending →</button>` : ''}
    </div>` : `<div class="alert alert-success">✅ All gate pass requests have been processed!</div>`}

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">📊 Pass Activity (7 days)</span></div>
        <div class="chart-container">
          <canvas id="wardenChart"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">👥 Student Location Status</span></div>
        <div style="text-align:center;padding:16px">
          <canvas id="locationChart"></canvas>
        </div>
        <div style="display:flex;justify-content:center;gap:24px;margin-top:8px">
          <div style="text-align:center"><div style="font-size:24px;font-weight:700;color:var(--accent-green)">${Students.filter(s=>s.status==='inside').length}</div><div style="font-size:12px;color:var(--text-muted)">Inside Campus</div></div>
          <div style="text-align:center"><div style="font-size:24px;font-weight:700;color:var(--accent-red)">${outside.length}</div><div style="font-size:12px;color:var(--text-muted)">Outside Campus</div></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">😴 Students Currently Outside</span></div>
      ${outside.length === 0 ? `<div class="empty-state"><div class="empty-icon">🏠</div><p>All students are on campus</p></div>` :
        `<div class="table-wrapper"><table>
          <thead><tr><th>Student</th><th>Room</th><th>Branch</th><th>Gate Pass</th><th>Status</th></tr></thead>
          <tbody>
            ${outside.map(s => {
              const pass = GatePasses.find(p => p.studentId === s.id && p.status === 'approved');
              return `<tr>
                <td><div style="display:flex;align-items:center;gap:8px"><div style="width:30px;height:30px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${s.avatar}</div>${s.name}</div></td>
                <td>${s.room}</td>
                <td>${s.branch}</td>
                <td><code style="color:var(--accent-primary)">${pass ? pass.id : 'N/A'}</code></td>
                <td>${buildBadge('outside')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table></div>`
      }
    </div>
  `;

  createChart('wardenChart', {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [
        { label: 'Submitted', data: [3,5,2,4,6,3,2], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', tension: 0.4, fill: true, borderWidth: 2 },
        { label: 'Approved', data: [2,4,2,3,5,3,1], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true, borderWidth: 2 },
        { label: 'Rejected', data: [1,1,0,1,1,0,1], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4, fill: true, borderWidth: 2 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }, plugins: { legend: { position: 'bottom' } }
    }
  });

  const inside = Students.filter(s => s.status === 'inside').length;
  createChart('locationChart', {
    type: 'doughnut',
    data: {
      labels: ['Inside Campus', 'Outside Campus'],
      datasets: [{ data: [inside, outside.length],
        backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'],
        borderColor: ['#10b981', '#ef4444'], borderWidth: 2
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '55%',
      plugins: { legend: { display: false } }
    }
  });
}

function renderPassCard(pass, withActions) {
  return `
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:16px;margin-bottom:10px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <code style="color:var(--accent-primary);font-size:13px">${pass.id}</code>
            ${buildBadge(pass.status)}
            <span class="badge" style="background:rgba(99,102,241,0.1);color:var(--accent-primary)">${pass.type}</span>
          </div>
          <div style="font-size:15px;font-weight:600;color:var(--text-primary)">${pass.studentName}</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:2px">📋 ${pass.reason}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">📍 ${pass.destination} &nbsp;·&nbsp; 📅 ${pass.from} → ${pass.to}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Submitted: ${pass.createdAt}</div>
        </div>
        ${withActions ? `
          <div style="display:flex;gap:8px;flex-direction:column;align-items:flex-end">
            <button class="btn btn-success btn-sm" onclick="approvePass('${pass.id}')">✅ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectPassModal('${pass.id}')">❌ Reject</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderPendingPasses() {
  const content = document.getElementById('page-content');
  const pending = GatePasses.filter(p => p.status === 'pending');

  content.innerHTML = `
    <div style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700">⏳ Pending Gate Pass Requests</h2>
      <span class="badge badge-pending">${pending.length} pending</span>
    </div>
    ${pending.length === 0 ?
      `<div class="empty-state"><div class="empty-icon">✅</div><p>No pending requests. All caught up!</p></div>` :
      pending.map(p => renderPassCard(p, true)).join('')
    }
  `;
}

function renderAllPasses() {
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">📋 All Gate Passes</span>
        <div style="display:flex;gap:8px">
          <select id="statusFilter" onchange="filterPasses()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:6px 10px;color:var(--text-primary);font-family:inherit;font-size:13px;outline:none">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div id="passes-list">
        ${GatePasses.map(p => renderPassCard(p, p.status === 'pending')).join('')}
      </div>
    </div>
  `;
}

function filterPasses() {
  const val = document.getElementById('statusFilter').value;
  const filtered = val === 'all' ? GatePasses : GatePasses.filter(p => p.status === val);
  document.getElementById('passes-list').innerHTML = filtered.map(p => renderPassCard(p, p.status === 'pending')).join('');
}

function renderStudentsPage() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">👥 All Students (Hostel A & B)</span>
        <span style="font-size:13px;color:var(--text-muted)">${Students.length} students</span>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Student</th><th>ID</th><th>Room</th><th>Year</th><th>Branch</th><th>Phone</th><th>Status</th></tr></thead>
        <tbody>
          ${Students.map(s => `<tr>
            <td><div style="display:flex;align-items:center;gap:10px">
              <div style="width:34px;height:34px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">${s.avatar}</div>
              <span style="font-weight:500">${s.name}</span>
            </div></td>
            <td><code style="color:var(--accent-primary)">${s.id}</code></td>
            <td>${s.room}</td>
            <td>${s.year}</td>
            <td>${s.branch}</td>
            <td style="font-size:12px">${s.phone}</td>
            <td>${statusDot(s.status)}${buildBadge(s.status)}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

function approvePass(passId) {
  const pass = GatePasses.find(p => p.id === passId);
  if (!pass) return;
  
  const updateData = {
    id: passId,
    status: 'approved',
    wardenNote: 'Approved. Have a safe trip.'
  };

  if (socket) {
    socket.emit('UPDATE_PASS_STATUS', updateData);
  } else {
    pass.status = 'approved';
    pass.wardenNote = updateData.wardenNote;
  }

  showToast(`Gate pass ${passId} approved!`, 'success');
  navigateTo(AppState.currentPage);
}

function rejectPassModal(passId) {
  openModal(`
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">❌ Reject Gate Pass</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px">Please provide a reason for rejection:</p>
      <div class="input-group">
        <label>Rejection Reason</label>
        <textarea id="reject-reason" placeholder="e.g., Insufficient reason, Missing documents..." rows="3"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="confirmReject('${passId}')">Reject Pass</button>
      </div>
    </div>
  `);
}

function confirmReject(passId) {
  const pass = GatePasses.find(p => p.id === passId);
  const reason = document.getElementById('reject-reason').value || 'No reason provided.';
  if (!pass) return;

  const updateData = {
    id: passId,
    status: 'rejected',
    wardenNote: reason
  };

  if (socket) {
    socket.emit('UPDATE_PASS_STATUS', updateData);
  } else {
    pass.status = 'rejected';
    pass.wardenNote = reason;
  }

  closeModal();
  showToast(`Gate pass ${passId} rejected.`, 'error');
  navigateTo(AppState.currentPage);
}
