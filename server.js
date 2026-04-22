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
  users: [
    // Default demo users
    { id: 'S001', username: 'student1', password: 'password', name: 'Arjun Sharma', role: 'student', room: '101' },
    { id: 'W001', username: 'warden1', password: 'password', name: 'Dr. Ramesh Rao', role: 'warden' },
    { id: 'SEC01', username: 'security1', password: 'password', name: 'Duty Guard #1', role: 'security' },
    { id: 'M001', username: 'mess1', password: 'password', name: 'Chef Mohan', role: 'mess' },
    { id: 'ADM01', username: 'admin', password: 'password', name: 'System Admin', role: 'admin' }
  ],
  gatePasses: [],
  logs: [],
  messBookings: {},
  messMenu: {
    breakfast: { name: 'Breakfast', time: '07:00 - 09:00', emoji: '🍳', items: ['Idli Sambar', 'Bread Butter', 'Corn Flakes', 'Boiled Eggs', 'Tea/Coffee', 'Fruit'] },
    lunch:     { name: 'Lunch',     time: '12:00 - 14:30', emoji: '🍛', items: ['Rice', 'Dal Makhani', 'Sabzi', 'Roti', 'Salad', 'Buttermilk'] },
    dinner:    { name: 'Dinner',    time: '19:00 - 21:30', emoji: '🍽️', items: ['Rice', 'Rajma', 'Paneer Butter Masala', 'Roti', 'Kheer', 'Pickle'] }
  }
};

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
      if (log.type === 'exit') pass.exitTime = log.time;
      if (log.type === 'entry') pass.entryTime = log.time;
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
