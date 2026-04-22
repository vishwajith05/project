// ============================================
//   STUDENT DASHBOARD PAGES
// ============================================

function renderStudentDashboard() {
  const content = document.getElementById('page-content');
  const student = Students.find(s => s.id === AppState.currentUser.id) || Students[0];
  const myPasses = GatePasses.filter(p => p.studentId === student.id);
  const approved = myPasses.filter(p => p.status === 'approved').length;
  const pending = myPasses.filter(p => p.status === 'pending').length;
  const booking = MessBookings[student.id] || {};
  const mealsToday = Object.values(booking).filter(v => v === 'booked').length;

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:var(--text-primary)">
        Good ${getGreeting()}, ${student.name.split(' ')[0]}! 👋
      </h2>
      <p style="color:var(--text-secondary);margin-top:4px;font-size:14px">
        <span class="date-pill">📅 ${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</span>
      </p>
    </div>

    <div class="stats-grid">
      ${buildStatCard('🎫', 'purple', myPasses.length, 'Total Gate Passes', 'All time', 'up', '')}
      ${buildStatCard('✅', 'green', approved, 'Approved Passes', null, null, 'green')}
      ${buildStatCard('⏳', 'orange', pending, 'Pending Approval', null, null, 'orange')}
      ${buildStatCard('🍽️', 'cyan', mealsToday, 'Meals Today', null, null, 'cyan')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title">📋 Recent Gate Passes</span>
          <button class="btn btn-sm btn-outline" onclick="navigateTo('gate-pass')">+ New Pass</button>
        </div>
        ${myPasses.length === 0 ? `<div class="empty-state"><div class="empty-icon">🎫</div><p>No gate passes yet</p></div>` :
          `<div class="table-wrapper"><table>
            <thead><tr><th>Pass ID</th><th>Reason</th><th>Dates</th><th>Status</th></tr></thead>
            <tbody>
              ${myPasses.slice(0,4).map(p => `<tr>
                <td><code style="color:var(--accent-primary)">${p.id}</code></td>
                <td>${p.reason}</td>
                <td style="font-size:12px">${p.from} → ${p.to}</td>
                <td>${buildBadge(p.status)}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>`
        }
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">📊 Pass Status Overview</span>
        </div>
        <div class="chart-container">
          <canvas id="passChart"></canvas>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title">🍽️ Today's Meals</span>
          <button class="btn btn-sm btn-outline" onclick="navigateTo('mess-booking')">Manage</button>
        </div>
        <div class="meal-booking-grid">
          ${['breakfast','lunch','dinner'].map(meal => {
            const m = MessSchedule[meal];
            const status = booking[meal] || 'pending';
            return `<div class="meal-card ${status}" onclick="quickToggleMeal('${meal}','${student.id}')">
              <div class="meal-emoji">${m.emoji}</div>
              <div class="meal-name">${m.name}</div>
              <div class="meal-time">${m.time}</div>
              <div class="meal-status ${status}">${status === 'booked' ? '✅ Booked' : status === 'skipped' ? '❌ Skipped' : '🔘 Pending'}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">🕐 Recent Activity</span>
        </div>
        <div class="timeline">
          ${EntryExitLogs.filter(l => l.studentId === student.id).slice(0,4).map(log => `
            <div class="timeline-item">
              <div class="timeline-line">
                <div class="timeline-dot ${log.type === 'entry' ? 'green' : 'red'}"></div>
                <div class="timeline-connector"></div>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">${log.type === 'entry' ? '🔵 Entered Campus' : '🔴 Exit Campus'}</div>
                <div class="timeline-sub">${log.time} · ${log.guard}</div>
              </div>
            </div>
          `).join('') || '<p style="color:var(--text-muted);font-size:13px">No recent activity</p>'}
        </div>
      </div>
    </div>

    <div class="card" style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1));border-color:rgba(99,102,241,0.3)">
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <div style="font-size:48px">📱</div>
        <div style="flex:1">
          <div style="font-size:18px;font-weight:700;font-family:'Space Grotesk',sans-serif;color:var(--text-primary)">Your QR Gate Pass</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">Show this QR code at the security gate for quick entry/exit verification.</div>
        </div>
        <button class="btn btn-primary" onclick="navigateTo('qr-pass')">View QR Pass →</button>
      </div>
    </div>
  `;

  // Pass status chart
  const statuses = { approved: 0, pending: 0, rejected: 0 };
  myPasses.forEach(p => { if (statuses[p.status] !== undefined) statuses[p.status]++; });
  createChart('passChart', {
    type: 'doughnut',
    data: {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{ data: [statuses.approved || 0, statuses.pending || 0, statuses.rejected || 0],
        backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
        borderColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 2,
        hoverBorderWidth: 3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position: 'bottom', labels: { padding: 16, boxWidth: 10 } } }
    }
  });
}

function quickToggleMeal(meal, studentId) {
  const booking = MessBookings[studentId] || {};
  const cur = booking[meal] || 'pending';
  const newStatus = cur === 'booked' ? 'skipped' : 'booked';
  
  // Real-time emit
  if (socket) {
    socket.emit('TOGGLE_MESS_BOOKING', { studentId, meal, status: newStatus });
  }

  MessBookings[studentId] = booking;
  booking[meal] = newStatus; // Optimistic update
  showToast(`${MessSchedule[meal].name} ${newStatus === 'booked' ? 'booked' : 'cancelled'}!`, newStatus === 'booked' ? 'success' : 'info');
  renderStudentDashboard();
}

function renderGatePassPage() {
  const content = document.getElementById('page-content');
  const student = Students.find(s => s.id === AppState.currentUser.id) || Students[0];
  const myPasses = GatePasses.filter(p => p.studentId === student.id);

  content.innerHTML = `
    <div class="grid-2">
      <div>
        <div class="card">
          <div class="card-header"><span class="card-title">🎫 Request New Gate Pass</span></div>
          <div class="alert alert-info">📌 Submit at least 24 hours before your planned departure.</div>
          <form onsubmit="submitGatePass(event)">
            <div class="input-group">
              <label>Pass Type</label>
              <select id="gp-type">
                <option value="local">Local (within city)</option>
                <option value="day">Day Out</option>
                <option value="weekend">Weekend Pass</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div class="input-group">
              <label>Reason for Going Out *</label>
              <textarea id="gp-reason" placeholder="Describe your reason clearly..." rows="3" required></textarea>
            </div>
            <div class="input-group">
              <label>Destination</label>
              <input type="text" id="gp-dest" placeholder="e.g., City Hospital, Home - Mumbai" required />
            </div>
            <div class="form-row">
              <div class="input-group" style="margin-bottom:0">
                <label>From Date</label>
                <input type="date" id="gp-from" required />
              </div>
              <div class="input-group" style="margin-bottom:0">
                <label>To Date</label>
                <input type="date" id="gp-to" required />
              </div>
            </div>
            <div class="input-group" style="margin-top:16px">
              <label>Parent/Guardian Contact</label>
              <input type="tel" id="gp-contact" placeholder="+91 XXXXXXXXXX" />
            </div>
            <div style="margin-top:8px;display:flex;gap:12px">
              <button type="submit" class="btn btn-primary">Submit Request 🚀</button>
              <button type="reset" class="btn btn-outline">Clear</button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><span class="card-title">📋 My Gate Passes</span></div>
          ${myPasses.length === 0 ? `<div class="empty-state"><div class="empty-icon">🎫</div><p>No gate passes yet</p></div>` :
            myPasses.map(p => `
              <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:14px;margin-bottom:10px;transition:var(--transition)" onmouseenter="this.style.borderColor='var(--border-accent)'" onmouseleave="this.style.borderColor='var(--border-color)'">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                  <code style="color:var(--accent-primary);font-size:13px">${p.id}</code>
                  ${buildBadge(p.status)}
                </div>
                <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px">${p.reason}</div>
                <div style="font-size:12px;color:var(--text-secondary)">📍 ${p.destination}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px">📅 ${p.from} → ${p.to} &nbsp;·&nbsp; ${p.type}</div>
                ${p.wardenNote ? `<div style="margin-top:8px;font-size:12px;color:var(--accent-orange);background:rgba(245,158,11,0.08);padding:8px;border-radius:var(--radius-sm)">💬 ${p.wardenNote}</div>` : ''}
                ${p.status === 'approved' ? `
                <div style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--border-color);text-align:center">
                  <div style="background:white;padding:12px;border-radius:8px;display:inline-block;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
                    <div id="inlineQR_${p.id}" style="width: 120px; height: 120px; margin: 0 auto;"></div>
                  </div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:8px;font-weight:600">Scan at Security Gate</div>
                </div>` : `
                <div style="margin-top:12px;padding:20px;border-top:1px dashed var(--border-color);background:rgba(255,255,255,0.02);border-radius:0 0 var(--radius-md) var(--radius-md);text-align:center">
                  <div style="font-size:32px;opacity:0.4;margin-bottom:8px">⏳</div>
                  <div style="font-size:12px;color:var(--text-muted)">QR Code will be generated here<br/>once the warden approves your request.</div>
                </div>
                `}
              </div>
            `).join('')
          }
        </div>
      </div>
    </div>
  `;

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('gp-from').value = today;
  document.getElementById('gp-to').value = today;

  // Generate the inline QR codes for approved passes
  setTimeout(() => {
    myPasses.forEach(p => {
      if (p.status === 'approved') {
        const container = document.getElementById(`inlineQR_${p.id}`);
        if (container) {
          try {
            container.innerHTML = '';
            const qrCode = new QRCodeStyling({
                width: 120, height: 120,
                type: "canvas",
                data: p.qrCode,
                dotsOptions: { color: "#065f46", type: "rounded" },
                backgroundOptions: { color: "#ffffff" },
                imageOptions: { crossOrigin: "anonymous", margin: 0 }
            });
            qrCode.append(container);
          } catch(e) { console.error('QR error:', e); }
        }
      }
    });
  }, 100);
}

function submitGatePass(e) {
  e.preventDefault();
  const reason = document.getElementById('gp-reason').value;
  const dest = document.getElementById('gp-dest').value;
  const from = document.getElementById('gp-from').value;
  const to = document.getElementById('gp-to').value;
  const type = document.getElementById('gp-type').value;
  const student = Students.find(s => s.id === AppState.currentUser.id) || Students[0];
  
  const newPass = {
    id: `GP${String(Date.now()).slice(-4)}`, // More unique ID
    studentId: student.id, studentName: student.name,
    reason, destination: dest, from, to, type,
    status: 'pending', wardenNote: '', createdAt: new Date().toISOString().split('T')[0],
    exitTime: '', entryTime: '', qrCode: `GP-${student.id}-${Date.now()}`
  };

  if (socket) {
    socket.emit('GATE_PASS_REQUEST', newPass);
  } else {
    GatePasses.push(newPass);
  }

  showToast('Gate pass request submitted! Awaiting warden approval.', 'success');
  renderGatePassPage();
}

function renderGateHistory() {
  const content = document.getElementById('page-content');
  const student = Students.find(s => s.id === AppState.currentUser.id) || Students[0];
  const logs = EntryExitLogs.filter(l => l.studentId === student.id);
  const myPasses = GatePasses.filter(p => p.studentId === student.id);

  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">🕐 Entry / Exit History</span>
        <span style="font-size:13px;color:var(--text-muted)">${logs.length} records</span>
      </div>
      ${logs.length === 0 ? `<div class="empty-state"><div class="empty-icon">📋</div><p>No history yet</p></div>` :
        `<div class="table-wrapper"><table>
          <thead><tr><th>Date & Time</th><th>Type</th><th>Pass ID</th><th>Guard</th></tr></thead>
          <tbody>
            ${logs.map(l => `<tr>
              <td>${l.time}</td>
              <td><span class="badge ${l.type === 'entry' ? 'badge-in' : 'badge-out'}">${l.type === 'entry' ? '⬅️ Entry' : '➡️ Exit'}</span></td>
              <td><code style="color:var(--accent-primary)">${l.passId}</code></td>
              <td>${l.guard}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>`
      }
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">📊 Pass History (All Time)</span></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Pass ID</th><th>Type</th><th>Reason</th><th>Destination</th><th>Dates</th><th>Status</th></tr></thead>
        <tbody>
          ${myPasses.map(p => `<tr>
            <td><code style="color:var(--accent-primary)">${p.id}</code></td>
            <td>${p.type}</td>
            <td>${p.reason}</td>
            <td>${p.destination}</td>
            <td style="font-size:12px">${p.from} → ${p.to}</td>
            <td>${buildBadge(p.status)}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

function renderQRPage() {
  const content = document.getElementById('page-content');
  const student = Students.find(s => s.id === AppState.currentUser.id) || Students[0];
  const myPasses = GatePasses.filter(p => p.studentId === student.id && p.status === 'approved');

  content.innerHTML = `
    <div class="grid-2">
      <div class="card" style="text-align:center">
        <div class="card-header"><span class="card-title">📱 Student ID QR</span></div>
        <div class="qr-container">
          <div id="studentQR" style="width: 200px; height: 200px; background: white; padding: 12px; border-radius: var(--radius-md);"></div>
          <div class="qr-id">${student.id}</div>
          <div class="qr-label">
            <strong style="color:var(--text-primary)">${student.name}</strong><br/>
            Room ${student.room} · ${student.branch} · ${student.year}
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-top:12px">Show this QR to the security guard for identification.</p>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">🎫 Approved Pass QRs</span></div>
        ${myPasses.length === 0 ? `<div class="empty-state"><div class="empty-icon">🎫</div><p>No approved gate passes</p></div>` :
          myPasses.map((p, i) => `
            <div style="border:1px solid var(--border-color);border-radius:var(--radius-md);padding:16px;margin-bottom:12px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <code style="color:var(--accent-primary)">${p.id}</code>
                ${buildBadge(p.status)}
              </div>
              <div style="text-align:center">
                <div id="passQR${i}" style="width: 160px; height: 160px; margin: 0 auto; background: white; padding: 12px; border-radius: var(--radius-md);"></div>
              </div>
              <div style="margin-top:10px;font-size:12px;color:var(--text-secondary);text-align:center">
                <div>${p.reason}</div>
                <div>📅 ${p.from} → ${p.to}</div>
                <div>📍 ${p.destination}</div>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;

  // Generate QR codes
  setTimeout(() => {
    try {
      const studentContainer = document.getElementById('studentQR');
      if (studentContainer) {
          studentContainer.innerHTML = '';
          const studentQrGen = new QRCodeStyling({
            width: 176, height: 176, type: "canvas", // 176 + 24 padding = 200
            data: `CAMPUS-STUDENT:${student.id}:${student.name}:${student.room}`,
            dotsOptions: { color: "#1e3a8a", type: "rounded" },
            backgroundOptions: { color: "#ffffff" }
          });
          studentQrGen.append(studentContainer);
      }

      myPasses.forEach((p, i) => {
        const container = document.getElementById(`passQR${i}`);
        if (container) {
          container.innerHTML = '';
          const passQrGen = new QRCodeStyling({
            width: 136, height: 136, type: "canvas",
            data: p.qrCode,
            dotsOptions: { color: "#065f46", type: "rounded" },
            backgroundOptions: { color: "#ffffff" }
          });
          passQrGen.append(container);
        }
      });
    } catch(e) { console.error('QR error:', e); }
  }, 100);
}

function renderMessBooking() {
  const content = document.getElementById('page-content');
  const student = Students.find(s => s.id === AppState.currentUser.id) || Students[0];
  const booking = MessBookings[student.id] || { breakfast: 'pending', lunch: 'pending', dinner: 'pending' };

  content.innerHTML = `
    <div class="grid-2">
      <div>
        <div class="card">
          <div class="card-header"><span class="card-title">🍽️ Today's Mess Booking</span></div>
          <div class="alert alert-info">Booking window: Open until 30 minutes before each meal.</div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${['breakfast','lunch','dinner'].map(meal => {
              const m = MessSchedule[meal];
              const status = booking[meal] || 'pending';
              const colors = { booked: 'var(--accent-green)', skipped: 'var(--accent-red)', pending: 'var(--accent-orange)' };
              return `<div style="background:var(--bg-card);border:1px solid ${status === 'booked' ? 'rgba(16,185,129,0.3)' : status === 'skipped' ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'};border-radius:var(--radius-md);padding:16px">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div style="font-size:28px">${m.emoji}</div>
                    <div>
                      <div style="font-size:15px;font-weight:600;color:var(--text-primary)">${m.name}</div>
                      <div style="font-size:12px;color:var(--text-muted)">${m.time}</div>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:13px;font-weight:600;color:${colors[status]}">${status === 'booked' ? '✅ Booked' : status === 'skipped' ? '❌ Skipped' : '⏳ Pending'}</span>
                    <button class="btn btn-sm ${status === 'booked' ? 'btn-danger' : 'btn-success'}" onclick="toggleMealBooking('${meal}','${student.id}')">
                      ${status === 'booked' ? 'Skip' : 'Book'}
                    </button>
                  </div>
                </div>
                <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.06);padding-top:10px">
                  <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Today's Menu</div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px">
                    ${m.items.map(item => `<span style="font-size:11px;padding:3px 8px;border-radius:20px;background:rgba(255,255,255,0.06);color:var(--text-secondary)">${item}</span>`).join('')}
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><span class="card-title">📊 This Week's Meal Summary</span></div>
          <div class="chart-container">
            <canvas id="mealWeekChart"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">💡 Mess Info</span></div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-card);border-radius:var(--radius-md)"><span>🏠</span><span style="font-size:13px;color:var(--text-secondary)">Mess Hall: Block C, Ground Floor</span></div>
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-card);border-radius:var(--radius-md)"><span>📞</span><span style="font-size:13px;color:var(--text-secondary)">Contact: +91-9876543300</span></div>
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-card);border-radius:var(--radius-md)"><span>💳</span><span style="font-size:13px;color:var(--text-secondary)">Monthly Plan: ₹3,500 / month</span></div>
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-card);border-radius:var(--radius-md)"><span>⚡</span><span style="font-size:13px;color:var(--text-secondary)">Late entry allowed till 30 min after opening</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Week chart
  createChart('mealWeekChart', {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [
        { label: 'Breakfast', data: [1,1,0,1,1,1,0], backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4 },
        { label: 'Lunch', data: [1,1,1,1,1,0,1], backgroundColor: 'rgba(6,182,212,0.7)', borderRadius: 4 },
        { label: 'Dinner', data: [1,0,1,1,1,1,1], backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 4 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { max: 1, ticks: { stepSize: 1, callback: v => v === 1 ? '✅' : '❌', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }, plugins: { legend: { position: 'bottom' } } }
  });
}

function toggleMealBooking(meal, studentId) {
  const booking = MessBookings[studentId] || {};
  const status = booking[meal] || 'pending';
  const newStatus = status === 'booked' ? 'skipped' : 'booked';

  if (socket) {
    socket.emit('TOGGLE_MESS_BOOKING', { studentId, meal, status: newStatus });
  }

  booking[meal] = newStatus;
  MessBookings[studentId] = booking;
  showToast(`${MessSchedule[meal].name} ${newStatus === 'booked' ? 'booked' : 'cancelled'}!`, newStatus === 'booked' ? 'success' : 'info');
  renderMessBooking();
}

function renderMessMenu() {
  const content = document.getElementById('page-content');
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const menus = {
    Monday: { breakfast: 'Idli Sambar, Tea', lunch: 'Rice, Dal Makhani, Aloo Gobi', dinner: 'Roti, Paneer Butter Masala, Kheer' },
    Tuesday: { breakfast: 'Poha, Coffee', lunch: 'Rice, Rajma, Salad', dinner: 'Roti, Dal Tadka, Raita' },
    Wednesday: { breakfast: 'Upma, Tea', lunch: 'Rice, Chole, Roti', dinner: 'Biryani, Raita, Gulab Jamun' },
    Thursday: { breakfast: 'Paratha, Curd', lunch: 'Rice, Dal Fry, Mixed Veg', dinner: 'Roti, Chicken Curry, Salad' },
    Friday: { breakfast: 'Dosa Sambar, Tea', lunch: 'Fried Rice, Manchurian', dinner: 'Roti, Kadai Paneer, Ice Cream' },
    Saturday: { breakfast: 'Bread Toast, Omelette', lunch: 'Rice, Fish Curry, Dal', dinner: 'Pizza, Fries, Soft Drinks' },
    Sunday: { breakfast: 'Puri Bhaji, Halwa', lunch: 'Special Thali', dinner: 'Roti, Dal, Pulao, Payasam' },
  };
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  content.innerHTML = `
    <div class="card">
      <div class="card-header"><span class="card-title">📅 Weekly Mess Menu</span></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Day</th><th>🍳 Breakfast</th><th>🍛 Lunch</th><th>🍽️ Dinner</th></tr></thead>
        <tbody>
          ${days.map(day => `<tr style="${day === today ? 'background:rgba(99,102,241,0.08)' : ''}">
            <td><strong style="color:${day === today ? 'var(--accent-primary)' : 'inherit'}">${day} ${day === today ? '← Today' : ''}</strong></td>
            <td style="font-size:13px">${menus[day].breakfast}</td>
            <td style="font-size:13px">${menus[day].lunch}</td>
            <td style="font-size:13px">${menus[day].dinner}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

function renderFeedback() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">💬 Share Your Experience</span></div>
        <div class="alert alert-info">Tell us what you think! Your feedback helps us build a better campus experience.</div>
        <form onsubmit="submitTestimony(event)">
          <div class="input-group">
            <label>Overall Rating</label>
            <div style="display:flex;gap:15px;margin:10px 0" id="rating-stars">
              ${[1,2,3,4,5].map(i => `<span style="font-size:28px;cursor:pointer;color:var(--text-muted)" onclick="setRating(${i},this)">⭐</span>`).join('')}
            </div>
            <input type="hidden" id="feedback-rating" value="0" />
          </div>
          <div class="input-group">
            <label>Feedback Topic</label>
            <select id="feedback-topic">
              <option value="Hostel Life">Hostel Life</option>
              <option value="Gate Pass System">Gate Pass System</option>
              <option value="Mess Quality">Mess Quality</option>
              <option value="Security">Security</option>
            </select>
          </div>
          <div class="input-group">
            <label>Your Comments / Testimony</label>
            <textarea id="feedback-comment" placeholder="Tell us about your experience..." rows="5" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%">Submit Feedback ✨</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">📣 Recent Community Feedback</span></div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[
            { name: 'Arjun', rating: 5, text: 'The new gate pass system is so smooth!' },
            { name: 'Priya', rating: 4, text: 'Love the meal booking feature.' },
            { name: 'Sunny', rating: 5, text: 'Security team is very helpful.' }
          ].map(f => `<div style="background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:14px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <strong>${f.name}</strong>
              <div style="font-size:12px">${'⭐'.repeat(f.rating)}</div>
            </div>
            <p style="font-size:13px;color:var(--text-secondary);font-style:italic">"${f.text}"</p>
          </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function setRating(val) {
  const stars = document.getElementById('rating-stars').querySelectorAll('span');
  document.getElementById('feedback-rating').value = val;
  stars.forEach((s, i) => { s.style.color = i < val ? 'var(--accent-orange)' : 'var(--text-muted)'; });
}

function submitTestimony(e) {
  e.preventDefault();
  const r = document.getElementById('feedback-rating').value;
  if (r === "0") { showToast('Please select a rating!', 'warning'); return; }
  showToast('Thank you for your testimony!', 'success');
  e.target.reset();
  setRating(0);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
