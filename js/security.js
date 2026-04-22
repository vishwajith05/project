// ============================================
//   SECURITY DASHBOARD PAGES
// ============================================

function renderSecurityDashboard() {
  const content = document.getElementById('page-content');
  const todayLogs = EntryExitLogs.slice(0, 6);
  const exits = todayLogs.filter(l => l.type === 'exit').length;
  const entries = todayLogs.filter(l => l.type === 'entry').length;
  const activePasses = GatePasses.filter(p => p.status === 'approved');
  const outside = Students.filter(s => s.status === 'outside');

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700">Security Dashboard 🛡️</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-top:4px">Main Gate · <span id="liveTime"></span></p>
    </div>

    <div class="stats-grid">
      ${buildStatCard('🚶', 'red', outside.length, 'Students Outside', null, null, 'orange')}
      ${buildStatCard('✅', 'green', activePasses.length, 'Active Passes', null, null, 'green')}
      ${buildStatCard('➡️', 'cyan', exits, 'Today Exits', null, null, 'cyan')}
      ${buildStatCard('⬅️', 'purple', entries, 'Today Entries', null, null, '')}
    </div>

    <div class="grid-2">
      <div class="card" style="border-color:rgba(6,182,212,0.3);cursor:pointer" onclick="navigateTo('scanner')" onmouseenter="this.style.borderColor='var(--accent-cyan)'" onmouseleave="this.style.borderColor='rgba(6,182,212,0.3)'">
        <div style="display:flex;align-items:center;gap:16px;padding:8px">
          <div style="font-size:48px">📷</div>
          <div>
            <div style="font-size:18px;font-weight:700;font-family:'Space Grotesk',sans-serif;color:var(--text-primary)">Open QR Scanner</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">Scan student gate pass QR codes for entry/exit verification</div>
            <div class="btn btn-sm" style="background:linear-gradient(135deg, #06b6d4, #3b82f6);color:white;display:inline-flex;margin-top:10px;border:none;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600">
              Launch Scanner →
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">📊 Entry/Exit Activity Today</span></div>
        <div class="chart-container">
          <canvas id="securityChart"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">🕐 Recent Gate Activity</span>
        <button class="btn btn-sm btn-outline" onclick="navigateTo('entry-exit')">View All</button>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Time</th><th>Student</th><th>Pass ID</th><th>Type</th><th>Guard</th></tr></thead>
        <tbody>
          ${todayLogs.map(l => `<tr>
            <td style="font-variant-numeric:tabular-nums;font-size:13px">${l.time}</td>
            <td><strong>${l.studentName}</strong></td>
            <td><code style="color:var(--accent-primary)">${l.passId}</code></td>
            <td><span class="badge ${l.type === 'entry' ? 'badge-in' : 'badge-out'}">${l.type === 'entry' ? '⬅️ Entry' : '➡️ Exit'}</span></td>
            <td>${l.guard}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">🚨 Students Currently Outside Campus</span></div>
      ${outside.length === 0 ? `<div class="empty-state"><div class="empty-icon">🏠</div><p>All students are inside campus</p></div>` :
        `<div class="table-wrapper"><table>
          <thead><tr><th>Student</th><th>Room</th><th>Destination</th><th>Return By</th><th>Pass</th></tr></thead>
          <tbody>
            ${outside.map(s => {
              const pass = GatePasses.find(p => p.studentId === s.id && p.status === 'approved');
              return `<tr>
                <td><strong>${s.name}</strong> <span style="color:var(--text-muted);font-size:12px">(${s.id})</span></td>
                <td>${s.room}</td>
                <td>${pass ? pass.destination : 'Unknown'}</td>
                <td>${pass ? pass.to : 'N/A'}</td>
                <td><code style="color:var(--accent-green)">${pass ? pass.id : 'N/A'}</code></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table></div>`
      }
    </div>
  `;

  // Live time update
  const liveTime = document.getElementById('liveTime');
  if (liveTime) {
    const updateLive = () => { if (liveTime) liveTime.textContent = new Date().toLocaleTimeString('en-IN'); };
    updateLive();
    setInterval(updateLive, 1000);
  }

  createChart('securityChart', {
    type: 'bar',
    data: {
      labels: ['6AM','8AM','10AM','12PM','2PM','4PM','6PM','8PM','10PM'],
      datasets: [
        { label: 'Exits', data: [2,8,3,1,4,2,1,0,1], backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 },
        { label: 'Entries', data: [0,1,2,4,2,5,8,4,2], backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 4 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderScanner() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title">📷 QR Gate Pass Scanner</span>
          <button class="btn btn-sm btn-outline" id="toggle-camera-btn" onclick="toggleCamera()">Stop Camera</button>
        </div>
        <div class="scanner-area">
          <div id="reader" style="width:100%; border-radius: var(--radius-md); overflow: hidden;"></div>
          <p style="color:var(--text-secondary);font-size:13px;text-align:center;margin-top:10px">Position the QR code within the frame to scan</p>
          <div style="width:100%; margin-top: 15px;">
            <div class="input-group">
              <label>Or Enter QR Code / Pass ID Manually</label>
              <input type="text" id="manual-qr" placeholder="e.g., GP001" />
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary" style="flex:1" onclick="verifyInput()">🔍 Verify Pass</button>
              <button class="btn btn-outline" onclick="simulateSimple()">Quick Check</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card" id="scan-result-card">
        <div class="card-header"><span class="card-title">✅ Scan Result</span></div>
        <div id="scan-result" style="padding:20px">
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>Scan a QR code to see student details here</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">📋 Today's Scans Log</span>
        <span class="badge badge-active">${EntryExitLogs.length} scans</span>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Time</th><th>Student</th><th>Pass</th><th>Action</th><th>Guard</th></tr></thead>
        <tbody id="scan-log">
          ${EntryExitLogs.map(l => `<tr>
            <td style="font-size:12px">${l.time}</td>
            <td>${l.studentName}</td>
            <td><code style="color:var(--accent-primary)">${l.passId}</code></td>
            <td><span class="badge ${l.type==='entry'?'badge-in':'badge-out'}">${l.type==='entry'?'⬅️ Entry':'➡️ Exit'}</span></td>
            <td>${l.guard}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;

  // Start the scanner after rendering
  setTimeout(() => startScanner(), 100);
}

let html5QrCode;

function startScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      initScanner();
    }).catch(() => {
      initScanner();
    });
  } else {
    initScanner();
  }
}

function initScanner() {
  html5QrCode = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  
  html5QrCode.start(
    { facingMode: "environment" }, 
    config, 
    onScanSuccess,
    onScanFailure
  ).catch(err => {
    console.error("Error starting scanner", err);
    document.getElementById('reader').innerHTML = `
      <div class="alert alert-error" style="margin:20px">
        ⚠️ Camera Access Error: ${err.message || 'Please ensure you have granted camera permissions.'}
      </div>
    `;
  });
}

function toggleCamera() {
  const btn = document.getElementById('toggle-camera-btn');
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().then(() => {
      btn.textContent = "Start Camera";
      document.getElementById('reader').style.display = 'none';
    });
  } else {
    startScanner();
    btn.textContent = "Stop Camera";
    document.getElementById('reader').style.display = 'block';
  }
}

function onScanSuccess(decodedText, decodedResult) {
  // Pause scanning for a moment
  html5QrCode.pause();
  
  // Clean up the text if it's our specialized format
  let input = decodedText;
  if (input.startsWith('CAMPUS-STUDENT:')) {
    // Extract Student ID
    input = input.split(':')[1];
  }
  
  document.getElementById('manual-qr').value = input;
  handleVerification(input);
  
  // Resume scanning after 3 seconds
  setTimeout(() => {
    if (html5QrCode && html5QrCode.getState() === Html5QrcodeScannerState.PAUSED) {
      html5QrCode.resume();
    }
  }, 3000);
}

function onScanFailure(error) {
  // Silent failure is okay for continuous scanning
}

function verifyInput() {
  const input = document.getElementById('manual-qr').value.trim();
  handleVerification(input);
}

function handleVerification(input) {
  if (!input) { showToast('Please enter a pass ID or QR code!', 'warning'); return; }

  // Search logic
  const pass = GatePasses.find(p =>
    p.qrCode === input || p.id === input.toUpperCase() || p.studentId === input.toUpperCase()
  );

  const student = Students.find(s => s.id === input.toUpperCase() || (pass && s.id === pass.studentId));

  if (!pass && !student) {
    document.getElementById('scan-result').innerHTML = `
      <div class="alert alert-error">❌ Invalid QR code or Student ID not found!</div>
      <div style="text-align:center;padding:20px">
        <div style="font-size:48px;margin-bottom:12px">🚫</div>
        <div style="font-size:16px;font-weight:600;color:var(--accent-red)">ACCESS DENIED</div>
        <p style="color:var(--text-muted);font-size:13px;margin-top:8px">No valid profile or gate pass found.</p>
      </div>
    `;
    showToast('Verification failed!', 'error');
    return;
  }

  // If we found a student but no active pass, show student info but indicate no valid pass
  const activePass = pass && pass.status === 'approved' ? pass : null;
  const isApproved = !!activePass;
  const action = student && student.status === 'inside' ? 'exit' : 'entry';

  document.getElementById('scan-result').innerHTML = `
    <div style="background:${isApproved ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'};border:1px solid ${isApproved ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};border-radius:var(--radius-md);padding:16px;margin-bottom:12px">
      <div style="font-size:32px;text-align:center;margin-bottom:8px">${isApproved ? '✅' : 'ℹ️'}</div>
      <div style="font-size:18px;font-weight:700;text-align:center;color:${isApproved ? 'var(--accent-green)' : 'var(--accent-orange)'}">${isApproved ? 'ACCESS GRANTED' : student ? 'STUDENT IDENTIFIED' : 'ACCESS DENIED'}</div>
      <div style="font-size:12px;text-align:center;color:var(--text-muted);margin-top:4px">${isApproved ? 'Pass Approved' : student ? 'No active gate pass found' : 'Invalid ID'}</div>
    </div>
    ${student ? `
    <div style="border:1px solid var(--border-color);border-radius:var(--radius-md);padding:14px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700">${student.avatar}</div>
        <div>
          <div style="font-size:16px;font-weight:700">${student.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">${student.id} · Room ${student.room}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
        <div style="padding:8px;background:var(--bg-card);border-radius:6px"><span style="color:var(--text-muted)">Pass ID:</span><br/><code style="color:var(--accent-primary)">${activePass ? activePass.id : 'N/A'}</code></div>
        <div style="padding:8px;background:var(--bg-card);border-radius:6px"><span style="color:var(--text-muted)">Type:</span><br/>${activePass ? activePass.type : 'N/A'}</div>
        <div style="padding:8px;background:var(--bg-card);border-radius:6px"><span style="color:var(--text-muted)">Valid Till:</span><br/>${activePass ? activePass.to : 'N/A'}</div>
        <div style="padding:8px;background:var(--bg-card);border-radius:6px"><span style="color:var(--text-muted)">Status:</span><br/>${student.status.toUpperCase()}</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-success" style="flex:1" onclick="recordScan('${student.id}', '${activePass ? activePass.id : 'STUDENT_ID'}', 'entry')">⬅️ Record ENTRY</button>
        <button class="btn btn-danger" style="flex:1" onclick="recordScan('${student.id}', '${activePass ? activePass.id : 'STUDENT_ID'}', 'exit')">➡️ Record EXIT</button>
      </div>
    </div>` : ''}
  `;

  if (isApproved) showToast('QR verified! Student: ' + (student ? student.name : pass.studentName), 'success');
  else if (student) showToast('Student identified: ' + student.name, 'info');
  else showToast('Access denied.', 'error');
}

function simulateSimple() {
  const passes = GatePasses.filter(p => p.status === 'approved');
  const pass = passes[Math.floor(Math.random() * passes.length)];
  if (pass) {
    document.getElementById('manual-qr').value = pass.id;
    simulateScan();
  }
}

function recordScan(studentId, passId, type) {
  const student = Students.find(s => s.id === studentId);
  const newLog = {
    id: `L${Date.now().toString().slice(-4)}`,
    studentId, studentName: student ? student.name : 'Unknown',
    passId, 
    time: new Date().toLocaleString('en-IN'), 
    type, 
    guard: 'Security Guard'
  };

  if (socket) {
    socket.emit('SECURITY_LOG', newLog);
  } else {
    if (student) student.status = type === 'entry' ? 'inside' : 'outside';
    EntryExitLogs.unshift(newLog);
  }

  showToast(`${type === 'entry' ? 'Entry' : 'Exit'} recorded for ${student ? student.name : studentId}!`, 'success');
  navigateTo('scanner');
}

function renderEntryExit() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">🔁 Entry / Exit Log</span>
        <span style="font-size:13px;color:var(--text-muted)">${EntryExitLogs.length} records total</span>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Date & Time</th><th>Student</th><th>ID</th><th>Pass ID</th><th>Type</th><th>Guard</th></tr></thead>
        <tbody>
          ${EntryExitLogs.map((l, i) => `<tr>
            <td style="color:var(--text-muted)">${i + 1}</td>
            <td style="font-size:12px;font-variant-numeric:tabular-nums">${l.time}</td>
            <td><strong>${l.studentName}</strong></td>
            <td><code style="color:var(--text-muted)">${l.studentId}</code></td>
            <td><code style="color:var(--accent-primary)">${l.passId}</code></td>
            <td><span class="badge ${l.type==='entry'?'badge-in':'badge-out'}">${l.type==='entry'?'⬅️ Entry':'➡️ Exit'}</span></td>
            <td>${l.guard}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

function renderActivePasses() {
  const content = document.getElementById('page-content');
  const active = GatePasses.filter(p => p.status === 'approved');
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">✅ Active Gate Passes</span>
        <span class="badge badge-active">${active.length} active</span>
      </div>
      ${active.length === 0 ? `<div class="empty-state"><div class="empty-icon">🎫</div><p>No active passes</p></div>` :
        `<div class="table-wrapper"><table>
          <thead><tr><th>Pass ID</th><th>Student</th><th>Destination</th><th>Valid From</th><th>Valid Till</th><th>Type</th><th>Action</th></tr></thead>
          <tbody>
            ${active.map(p => `<tr>
              <td><code style="color:var(--accent-primary)">${p.id}</code></td>
              <td>${p.studentName}</td>
              <td>${p.destination}</td>
              <td>${p.from}</td>
              <td>${p.to}</td>
              <td>${p.type}</td>
              <td>
                <button class="btn btn-sm btn-outline" onclick="document.getElementById('manual-qr') && (document.getElementById('manual-qr').value='${p.id}'); navigateTo('scanner');">Scan</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table></div>`
      }
    </div>
  `;
}
