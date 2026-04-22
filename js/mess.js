// ============================================
//   MESS MANAGER DASHBOARD PAGES
// ============================================

function renderMessDashboard() {
  const content = document.getElementById('page-content');

  // Count bookings
  let bCnt = 0, lCnt = 0, dCnt = 0;
  Object.values(MessBookings).forEach(b => {
    if (b.breakfast === 'booked') bCnt++;
    if (b.lunch === 'booked') lCnt++;
    if (b.dinner === 'booked') dCnt++;
  });
  const totalStudents = Students.length;

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700">Mess Dashboard 🍽️</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-top:4px">Campus Mess Hall · Today's Operations</p>
    </div>

    <div class="stats-grid">
      ${buildStatCard('🍳', 'orange', bCnt, 'Breakfast Count', `${Math.round(bCnt/totalStudents*100)}% attendance`, bCnt > totalStudents * 0.5 ? 'up' : 'down', 'orange')}
      ${buildStatCard('🍛', 'cyan', lCnt, 'Lunch Count', `${Math.round(lCnt/totalStudents*100)}% attendance`, 'up', 'cyan')}
      ${buildStatCard('🍽️', 'purple', dCnt, 'Dinner Count', `${Math.round(dCnt/totalStudents*100)}% attendance`, 'up', '')}
      ${buildStatCard('👥', 'green', totalStudents, 'Total Students', null, null, 'green')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">📊 Today's Meal Distribution</span></div>
        <div class="chart-container">
          <canvas id="messDistChart"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">📈 Attendance Rate</span></div>
        <div style="padding:12px;display:flex;flex-direction:column;gap:16px">
          ${[['🍳 Breakfast', bCnt, totalStudents, 'orange'],
             ['🍛 Lunch', lCnt, totalStudents, 'cyan'],
             ['🍽️ Dinner', dCnt, totalStudents, 'purple']].map(([name, count, total, color]) => `
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <span style="font-size:13px;color:var(--text-secondary)">${name}</span>
                <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${count}/${total} <span style="color:var(--text-muted)">(${Math.round(count/total*100)}%)</span></span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar ${color}" style="width:${Math.round(count/total*100)}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">📅 Weekly Attendance Trend</span></div>
        <div class="chart-container">
          <canvas id="messWeekChart"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🍽️ Today's Menu</span></div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${Object.entries(MessSchedule).map(([key, m]) => `
            <div style="display:flex;gap:12px;padding:12px;background:var(--bg-card);border-radius:var(--radius-md);border:1px solid var(--border-color)">
              <div style="font-size:24px">${m.emoji}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${m.name} <span style="font-size:11px;font-weight:400;color:var(--text-muted);">${m.time}</span></div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${m.items.slice(0,4).join(' · ')}...</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  createChart('messDistChart', {
    type: 'bar',
    data: {
      labels: ['Breakfast', 'Lunch', 'Dinner'],
      datasets: [
        { label: 'Booked', data: [bCnt, lCnt, dCnt], backgroundColor: ['rgba(245,158,11,0.8)', 'rgba(6,182,212,0.8)', 'rgba(139,92,246,0.8)'], borderRadius: 6 },
        { label: 'Skipped/Not Booked', data: [totalStudents-bCnt, totalStudents-lCnt, totalStudents-dCnt], backgroundColor: ['rgba(245,158,11,0.15)', 'rgba(6,182,212,0.15)', 'rgba(139,92,246,0.15)'], borderRadius: 6 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { stacked: true, max: totalStudents, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });

  createChart('messWeekChart', {
    type: 'line',
    data: {
      labels: MessWeekData.labels,
      datasets: [
        { label: 'Breakfast', data: MessWeekData.breakfast, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.4, fill: true, borderWidth: 2, pointBackgroundColor: '#f59e0b' },
        { label: 'Lunch', data: MessWeekData.lunch, borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)', tension: 0.4, fill: true, borderWidth: 2, pointBackgroundColor: '#06b6d4' },
        { label: 'Dinner', data: MessWeekData.dinner, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', tension: 0.4, fill: true, borderWidth: 2, pointBackgroundColor: '#8b5cf6' },
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

function renderMealCounts() {
  const content = document.getElementById('page-content');

  // Build per-student booking table
  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">📊 Today's Meal Counts</span>
        <div class="date-pill">📅 ${new Date().toLocaleDateString('en-IN')}</div>
      </div>

      <div class="stats-grid" style="margin-bottom:20px">
        ${Object.entries(MessSchedule).map(([key, m]) => {
          const count = Object.values(MessBookings).filter(b => b[key] === 'booked').length;
          const skipped = Object.values(MessBookings).filter(b => b[key] === 'skipped').length;
          return `<div class="stat-card">
            <div class="stat-icon" style="background:rgba(99,102,241,0.1);font-size:24px">${m.emoji}</div>
            <div class="stat-info">
              <div class="stat-value" style="color:var(--accent-green)">${count}</div>
              <div class="stat-label">${m.name}</div>
              <div style="font-size:11px;color:var(--accent-red);margin-top:2px">❌ Skipped: ${skipped}</div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="card-header"><span class="card-title">📋 Student-wise Booking Status</span></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Student</th><th>ID</th><th>🍳 Breakfast</th><th>🍛 Lunch</th><th>🍽️ Dinner</th><th>Total Meals</th></tr></thead>
        <tbody>
          ${Students.map(s => {
            const b = MessBookings[s.id] || {};
            const total = Object.values(b).filter(v => v === 'booked').length;
            return `<tr>
              <td><strong>${s.name}</strong></td>
              <td><code style="color:var(--text-muted)">${s.id}</code></td>
              <td><span class="badge ${b.breakfast === 'booked' ? 'badge-approved' : b.breakfast === 'skipped' ? 'badge-rejected' : 'badge-pending'}">${b.breakfast || 'pending'}</span></td>
              <td><span class="badge ${b.lunch === 'booked' ? 'badge-approved' : b.lunch === 'skipped' ? 'badge-rejected' : 'badge-pending'}">${b.lunch || 'pending'}</span></td>
              <td><span class="badge ${b.dinner === 'booked' ? 'badge-approved' : b.dinner === 'skipped' ? 'badge-rejected' : 'badge-pending'}">${b.dinner || 'pending'}</span></td>
              <td><span style="font-size:14px;font-weight:700;color:${total === 3 ? 'var(--accent-green)' : total === 0 ? 'var(--accent-red)' : 'var(--accent-orange)'}">${total}/3</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

function renderAttendance() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">📈 Weekly Attendance Chart</span></div>
        <div class="chart-container tall">
          <canvas id="attendWeekChart"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🍽️ Meal-wise Distribution</span></div>
        <div class="chart-container tall">
          <canvas id="mealPieChart"></canvas>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">📊 Monthly Overview</span></div>
      <div class="chart-container tall">
        <canvas id="monthlyChart"></canvas>
      </div>
    </div>
  `;

  createChart('attendWeekChart', {
    type: 'bar',
    data: {
      labels: MessWeekData.labels,
      datasets: [
        { label: 'Breakfast', data: MessWeekData.breakfast, backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4 },
        { label: 'Lunch', data: MessWeekData.lunch, backgroundColor: 'rgba(6,182,212,0.7)', borderRadius: 4 },
        { label: 'Dinner', data: MessWeekData.dinner, backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 4 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });

  createChart('mealPieChart', {
    type: 'pie',
    data: {
      labels: ['Breakfast', 'Lunch', 'Dinner'],
      datasets: [{
        data: [
          MessWeekData.breakfast.reduce((a,b) => a+b, 0),
          MessWeekData.lunch.reduce((a,b) => a+b, 0),
          MessWeekData.dinner.reduce((a,b) => a+b, 0),
        ],
        backgroundColor: ['rgba(245,158,11,0.8)', 'rgba(6,182,212,0.8)', 'rgba(139,92,246,0.8)'],
        borderColor: ['#f59e0b', '#06b6d4', '#8b5cf6'], borderWidth: 2
      }]
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });

  const monthLabels = Array.from({length:16}, (_,i) => `Mar ${i+1}`);
  createChart('monthlyChart', {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [
        { label: 'Breakfast', data: monthLabels.map(() => 140+Math.random()*60|0), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)', tension: 0.4, fill: true },
        { label: 'Lunch', data: monthLabels.map(() => 180+Math.random()*60|0), borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.05)', tension: 0.4, fill: true },
        { label: 'Dinner', data: monthLabels.map(() => 160+Math.random()*60|0), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.05)', tension: 0.4, fill: true },
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

function renderMenuMgmt() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">📅 Edit Today's Menu</span></div>
        <form onsubmit="saveMenu(event)">
          ${Object.entries(MessSchedule).map(([key, m]) => `
            <div class="input-group">
              <label>${m.emoji} ${m.name} Menu</label>
              <input type="text" id="menu-${key}" value="${m.items.join(', ')}" placeholder="e.g., Idli, Sambar, Tea" />
            </div>
          `).join('')}
          <button type="submit" class="btn btn-primary">💾 Save Menu</button>
        </form>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">📋 Special Events</span></div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
          ${[
            { date: 'Mar 18', event: 'Special Biryani Lunch', badge: 'badge-approved' },
            { date: 'Mar 21', event: 'Holi Special Sweets', badge: 'badge-active' },
            { date: 'Mar 25', event: 'Faculty Dinner', badge: 'badge-pending' },
          ].map(ev => `<div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md)">
            <div style="font-size:11px;font-weight:700;background:var(--grad-primary);padding:4px 8px;border-radius:6px;color:white;white-space:nowrap">${ev.date}</div>
            <div style="font-size:13px;flex:1">${ev.event}</div>
            <span class="badge ${ev.badge}">${ev.badge.includes('approved') ? 'confirmed' : ev.badge.includes('active') ? 'planned' : 'pending'}</span>
          </div>`).join('')}
        </div>
        <button class="btn btn-primary btn-sm">+ Add Special Event</button>
      </div>
    </div>
  `;
}

function saveMenu(e) {
  e.preventDefault();
  Object.keys(MessSchedule).forEach(key => {
    const val = document.getElementById(`menu-${key}`).value;
    MessSchedule[key].items = val.split(',').map(s => s.trim());
  });
  
  if (socket) {
    socket.emit('UPDATE_MENU', MessSchedule);
  }
  
  showToast('Menu updated successfully!', 'success');
}

function renderFeedback() {
  const content = document.getElementById('page-content');
  const feedbacks = Feedbacks || [];
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((a, f) => a + Number(f.rating), 0) / feedbacks.length).toFixed(1) : "0.0";

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700">Mess Feedback Portal 💬</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-top:4px">Anonymous Student Feedback & Ratings</p>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
      ${buildStatCard('⭐', 'orange', avgRating, 'Average Rating', null, null, 'orange')}
      ${buildStatCard('💬', 'purple', feedbacks.length, 'Total Feedback', null, null, '')}
      ${buildStatCard('😍', 'green', feedbacks.filter(f=>f.rating>=4).length, 'Positive Reviews', null, null, 'green')}
      ${buildStatCard('😔', 'red', feedbacks.filter(f=>f.rating<=2).length, 'Needs Improvement', null, null, 'orange')}
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">💬 Recent Feedback (Anonymous)</span>
        <span class="badge badge-pending">Privacy Mode: ON</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;padding:12px">
      ${feedbacks.length === 0 ? `<div class="empty-state"><p>No feedback received yet.</p></div>` : 
        feedbacks.map(f => `
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:14px;transition:var(--transition)" onmouseenter="this.style.borderColor='var(--accent-primary)'" onmouseleave="this.style.borderColor='var(--border-color)'">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;opacity:0.7">?</div>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text-primary)">Anonymous Student</div>
                <div style="font-size:11px;color:var(--text-muted)">${new Date(f.createdAt).toLocaleDateString('en-IN')} · ${f.topic || 'General'}</div>
              </div>
            </div>
            <div style="background:rgba(245,158,11,0.1);padding:4px 10px;border-radius:20px;display:flex;align-items:center;gap:4px">
              <span style="color:#f59e0b;font-weight:700;font-size:14px">${f.rating}</span>
              <span style="color:#f59e0b;font-size:14px">⭐</span>
            </div>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.5">${f.comment}</p>
        </div>
      `).join('')}
      </div>
    </div>
  `;
}
