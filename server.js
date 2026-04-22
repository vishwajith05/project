const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 8002;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.static(path.join(__dirname, '.')));

let db = {
  users: [],
  gatePasses: [],
  logs: [],
  feedbacks: [],
  messBookings: {},
  messMenu: {
    breakfast: { name: 'Breakfast', time: '07:00 - 09:00', emoji: '🍳', items: ['Idli Sambar', 'Bread Butter', 'Corn Flakes', 'Boiled Eggs', 'Tea/Coffee', 'Fruit'] },
    lunch:     { name: 'Lunch',     time: '12:00 - 14:30', emoji: '🍛', items: ['Rice', 'Dal Makhani', 'Sabzi', 'Roti', 'Salad', 'Buttermilk'] },
    dinner:    { name: 'Dinner',    time: '19:00 - 21:30', emoji: '🍽️', items: ['Rice', 'Rajma', 'Paneer Butter Masala', 'Roti', 'Kheer', 'Pickle'] }
  }
};

// Daily Gate Pass Reset Logic
function ensureDailyPasses() {
  const today = new Date().toISOString().split('T')[0];
  let changed = false;

  db.users.forEach(user => {
    if (user.role === 'student') {
      // Check if student already has 2 passes for today
      const todayPasses = db.gatePasses.filter(p => p.studentId === user.id && p.createdAt === today && p.type === 'daily');
      
      if (todayPasses.length < 2) {
        for (let i = todayPasses.length; i < 2; i++) {
          const newPass = {
            id: `DP${user.id}${Date.now().toString().slice(-4)}${i}`,
            studentId: user.id,
            studentName: user.name,
            reason: 'Daily Gate Pass',
            destination: 'Local',
            from: today,
            to: today,
            type: 'daily',
            status: 'approved', // Pre-approved as they are "received" daily
            wardenNote: 'System generated daily pass',
            createdAt: today,
            exitTime: '',
            entryTime: '',
            qrCode: `DP-${user.id}-${today}-${i}`
          };
          db.gatePasses.push(newPass);
          changed = true;
        }
      }
    }
  });

  if (changed) {
    saveDB();
    io.emit('SYNC_STATE', db);
  }
}

// Run reset check every hour
setInterval(ensureDailyPasses, 3600000);
// Also run on startup
setTimeout(ensureDailyPasses, 5000);

// Persistence Logic
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    db = JSON.parse(data);
    console.log('✅ Database loaded from file');
  } catch (err) {
    console.error('Error loading DB:', err);
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current state to newly connected client
  socket.emit('SYNC_STATE', db);

  // Initial data sync from the first client to populate the server (if DB is empty)
  socket.on('INITIAL_DATA_SYNC', (data) => {
    if (db.gatePasses.length === 0 && data.gatePasses) {
      db.gatePasses = data.gatePasses;
      db.logs = data.logs || [];
      db.messBookings = data.messBookings || {};
      saveDB();
      console.log('Server state initialized from client');
      socket.broadcast.emit('SYNC_STATE', db);
    }
  });

  // Handle Gate Pass Requests
  socket.on('GATE_PASS_REQUEST', (newPass) => {
    db.gatePasses.push(newPass);
    saveDB();
    io.emit('GATE_PASS_ADDED', newPass);
  });

  // Handle Gate Pass Updates (Approval/Rejection)
  socket.on('UPDATE_PASS_STATUS', (data) => {
    const pass = db.gatePasses.find(p => p.id === data.id);
    if (pass) {
      pass.status = data.status;
      pass.wardenNote = data.wardenNote;
      saveDB();
      io.emit('GATE_PASS_UPDATED', pass);
      
      io.emit('NOTIFICATION', {
        studentId: pass.studentId,
        text: `Your gate pass ${pass.id} has been ${data.status}!`,
        color: data.status === 'approved' ? 'green' : 'red'
      });
    }
  });

  // Handle Mess Bookings
  socket.on('TOGGLE_MESS_BOOKING', (data) => {
    const { studentId, meal, status } = data;
    if (!db.messBookings[studentId]) db.messBookings[studentId] = {};
    db.messBookings[studentId][meal] = status;
    saveDB();
    io.emit('MESS_BOOKING_UPDATED', { studentId, meal, status });
  });

  // Handle Security Logs
  socket.on('SECURITY_LOG', (log) => {
    db.logs.unshift(log);
    const pass = db.gatePasses.find(p => p.id === log.passId);
    if (pass) {
      if (log.type === 'exit') {
        pass.exitTime = log.time;
        // Mark pass as used when exiting (or entering if it's a one-time pass)
        // For a daily pass, maybe it's "used" after one full cycle or immediately?
        // Requirement: "immediately marked as used/cancelled"
        pass.status = 'used'; 
      }
      if (log.type === 'entry') {
        pass.entryTime = log.time;
        // If it wasn't marked as used on exit, mark it now
        pass.status = 'used';
      }
    }
    
    // Update student status
    const student = db.users.find(u => u.id === log.studentId);
    if (student) {
      student.status = log.type === 'entry' ? 'inside' : 'outside';
    }

    saveDB();
    io.emit('LOG_ADDED', log);
    io.emit('SYNC_STATE', db); 
  });

  // Handle Feedback
  socket.on('SUBMIT_FEEDBACK', (feedback) => {
    feedback.id = `FB${Date.now()}`;
    feedback.createdAt = new Date().toISOString();
    db.feedbacks.unshift(feedback);
    saveDB();
    io.emit('FEEDBACK_ADDED', feedback);
    io.emit('SYNC_STATE', db);
  });

  // User Management
  socket.on('ADD_USER', (newUser) => {
    db.users.push(newUser);
    saveDB();
    io.emit('USER_ADDED', newUser);
    io.emit('SYNC_STATE', db); // Added sync broadcast
  });

  socket.on('UPDATE_USER', (updatedUser) => {
    const idx = db.users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updatedUser };
      saveDB();
      io.emit('USER_UPDATED', db.users[idx]);
      io.emit('SYNC_STATE', db); // Added sync broadcast
    }
  });

  socket.on('DELETE_USER', (userId) => {
    db.users = db.users.filter(u => u.id !== userId);
    saveDB();
    io.emit('USER_DELETED', userId);
    io.emit('SYNC_STATE', db); // Added sync broadcast
  });

  // Mess Menu Management
  socket.on('UPDATE_MENU', (newMenu) => {
    db.messMenu = newMenu;
    saveDB();
    io.emit('MENU_UPDATED', newMenu);
    io.emit('SYNC_STATE', db);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`
  🚀 SMART CAMPUS — REAL-TIME PRODUCTION SERVER
  -------------------------------------------
  Port: ${port}
  Mode: Production-Ready
  Persistence: Enabled (db.json)
  `);
});
