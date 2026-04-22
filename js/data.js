// ============================================
//   SMART CAMPUS — SHARED DATA & STATE
// ============================================

const AppState = {
  currentRole: 'student',
  currentUser: null,
  currentPage: 'dashboard',
};

// Mock student data
let Students = [
  { id: 'S001', name: 'Arjun Sharma', room: 'A-101', year: '3rd Year', branch: 'CSE', phone: '9876543210', status: 'inside', avatar: 'A' },
  { id: 'S002', name: 'Priya Patel', room: 'B-205', year: '2nd Year', branch: 'ECE', phone: '9876543211', status: 'outside', avatar: 'P' },
  { id: 'S003', name: 'Rahul Gupta', room: 'C-312', year: '4th Year', branch: 'ME', phone: '9876543212', status: 'inside', avatar: 'R' },
  { id: 'S004', name: 'Sneha Reddy', room: 'A-208', year: '1st Year', branch: 'CE', phone: '9876543213', status: 'outside', avatar: 'S' },
  { id: 'S005', name: 'Kiran Kumar', room: 'D-110', year: '2nd Year', branch: 'CSE', phone: '9876543214', status: 'inside', avatar: 'K' },
  { id: 'S006', name: 'Meera Nair', room: 'B-315', year: '3rd Year', branch: 'BT', phone: '9876543215', status: 'inside', avatar: 'M' },
  { id: 'S007', name: 'Vikram Singh', room: 'C-201', year: '4th Year', branch: 'EE', phone: '9876543216', status: 'outside', avatar: 'V' },
  { id: 'S008', name: 'Anaya Joshi', room: 'D-405', year: '1st Year', branch: 'CSE', phone: '9876543217', status: 'inside', avatar: 'A' },
];

// Mock gate pass data
const GatePasses = [
  { id: 'GP001', studentId: 'S001', studentName: 'Arjun Sharma', reason: 'Family function', destination: 'Home - Mumbai', from: '2026-03-15', to: '2026-03-17', type: 'day', status: 'approved', wardenNote: 'Approved. Have a safe trip.', createdAt: '2026-03-14', exitTime: '2026-03-15 08:30', entryTime: '2026-03-17 19:00', qrCode: 'GP001-S001-SECURE' },
  { id: 'GP002', studentId: 'S002', studentName: 'Priya Patel', reason: 'Medical appointment', destination: 'City Hospital', from: '2026-03-16', to: '2026-03-16', type: 'local', status: 'approved', wardenNote: '', createdAt: '2026-03-16', exitTime: '2026-03-16 10:00', entryTime: '', qrCode: 'GP002-S002-SECURE' },
  { id: 'GP003', studentId: 'S003', studentName: 'Rahul Gupta', reason: 'Research work', destination: 'State Library', from: '2026-03-18', to: '2026-03-18', type: 'local', status: 'pending', wardenNote: '', createdAt: '2026-03-16', exitTime: '', entryTime: '', qrCode: 'GP003-S003-SECURE' },
  { id: 'GP004', studentId: 'S004', studentName: 'Sneha Reddy', reason: 'Sports tournament', destination: 'Adjacent college', from: '2026-03-17', to: '2026-03-18', type: 'day', status: 'pending', wardenNote: '', createdAt: '2026-03-15', exitTime: '', entryTime: '', qrCode: 'GP004-S004-SECURE' },
  { id: 'GP005', studentId: 'S007', studentName: 'Vikram Singh', reason: 'Personal work', destination: 'City center', from: '2026-03-12', to: '2026-03-13', type: 'local', status: 'rejected', wardenNote: 'Insufficient reason. Please provide doctor note.', createdAt: '2026-03-11', exitTime: '', entryTime: '', qrCode: 'GP005-S007-SECURE' },
  { id: 'GP006', studentId: 'S001', studentName: 'Arjun Sharma', reason: 'Birthday at home', destination: 'Home - Mumbai', from: '2026-03-20', to: '2026-03-22', type: 'weekend', status: 'pending', wardenNote: '', createdAt: '2026-03-16', exitTime: '', entryTime: '', qrCode: 'GP006-S001-SECURE' },
];

// Mock entry/exit logs
const EntryExitLogs = [
  { id: 'L001', studentId: 'S001', studentName: 'Arjun Sharma', passId: 'GP001', time: '2026-03-15 08:30', type: 'exit', guard: 'Guard Kumar' },
  { id: 'L002', studentId: 'S002', studentName: 'Priya Patel', passId: 'GP002', time: '2026-03-16 10:15', type: 'exit', guard: 'Guard Ravi' },
  { id: 'L003', studentId: 'S003', studentName: 'Rahul Gupta', passId: 'GP001', time: '2026-03-14 17:30', type: 'entry', guard: 'Guard Kumar' },
  { id: 'L004', studentId: 'S005', studentName: 'Kiran Kumar', passId: 'GP003', time: '2026-03-14 09:00', type: 'entry', guard: 'Guard Suresh' },
  { id: 'L005', studentId: 'S001', studentName: 'Arjun Sharma', passId: 'GP001', time: '2026-03-17 19:00', type: 'entry', guard: 'Guard Ravi' },
  { id: 'L006', studentId: 'S007', studentName: 'Vikram Singh', passId: 'GP002', time: '2026-03-13 08:00', type: 'exit', guard: 'Guard Kumar' },
];

// Mock mess data
const MessSchedule = {
  breakfast: { name: 'Breakfast', time: '07:00 - 09:00', emoji: '🍳', items: ['Idli Sambar', 'Bread Butter', 'Corn Flakes', 'Boiled Eggs', 'Tea/Coffee', 'Fruit'] },
  lunch:     { name: 'Lunch',     time: '12:00 - 14:30', emoji: '🍛', items: ['Rice', 'Dal Makhani', 'Sabzi', 'Roti', 'Salad', 'Buttermilk'] },
  dinner:    { name: 'Dinner',    time: '19:00 - 21:30', emoji: '🍽️', items: ['Rice', 'Rajma', 'Paneer Butter Masala', 'Roti', 'Kheer', 'Pickle'] },
};

const MessBookings = {
  'S001': { breakfast: 'booked', lunch: 'booked', dinner: 'skipped' },
  'S002': { breakfast: 'booked', lunch: 'skipped', dinner: 'booked' },
  'S003': { breakfast: 'skipped', lunch: 'booked', dinner: 'booked' },
  'S004': { breakfast: 'booked', lunch: 'booked', dinner: 'booked' },
  'S005': { breakfast: 'booked', lunch: 'booked', dinner: 'booked' },
  'S006': { breakfast: 'skipped', lunch: 'booked', dinner: 'skipped' },
  'S007': { breakfast: 'booked', lunch: 'skipped', dinner: 'booked' },
  'S008': { breakfast: 'booked', lunch: 'booked', dinner: 'booked' },
};

// Weekly mess attendance
const MessWeekData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  breakfast: [180, 170, 185, 160, 175, 120, 100],
  lunch:     [220, 215, 225, 210, 218, 180, 150],
  dinner:    [200, 195, 210, 190, 205, 160, 130],
};

// Notifications per role
const Notifications = {
  student: [
    { text: 'Your gate pass GP001 has been approved!', time: 'Just now', color: 'green' },
    { text: 'Mess breakfast menu updated for tomorrow.', time: '1h ago', color: 'cyan' },
    { text: 'Reminder: Submit mess preference by 6 PM.', time: '3h ago', color: 'orange' },
  ],
  warden: [
    { text: 'New gate pass request from Priya Patel.', time: '10m ago', color: 'orange' },
    { text: 'Gate pass GP004 awaiting your approval.', time: '1h ago', color: 'orange' },
    { text: 'Monthly hostel report is ready.', time: '5h ago', color: 'cyan' },
  ],
  security: [
    { text: 'Arjun Sharma (S001) exit scanned at 08:30.', time: '2h ago', color: 'green' },
    { text: 'Invalid QR scan attempt at Gate 2.', time: '3h ago', color: 'red' },
    { text: 'Shift change at 22:00. Please handover.', time: '5h ago', color: 'cyan' },
  ],
  mess: [
    { text: '320 students booked for today\'s lunch.', time: '1h ago', color: 'green' },
    { text: 'Low stock alert: Vegetables.', time: '2h ago', color: 'orange' },
    { text: 'Special menu approved for Friday.', time: '1d ago', color: 'cyan' },
  ],
  admin: [
    { text: '2 gate passes pending warden approval.', time: '30m ago', color: 'orange' },
    { text: 'Mess attendance dropped 15% this week.', time: '2h ago', color: 'red' },
    { text: 'Security audit report submitted.', time: '1d ago', color: 'cyan' },
  ],
};

// Nav menus per role
const NavMenus = {
  student: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', section: 'MAIN' },
    { id: 'gate-pass', icon: '🎫', label: 'Gate Pass', section: '' },
    { id: 'gate-history', icon: '📋', label: 'My History', section: '' },
    { id: 'qr-pass', icon: '📱', label: 'QR Gate Pass', section: '' },
    { id: 'mess-booking', icon: '🍽️', label: 'Mess Booking', section: 'MESS' },
    { id: 'mess-menu', icon: '📅', label: 'Mess Menu', section: '' },
    { id: 'feedback', icon: '💬', label: 'Feedback & Testimony', section: 'SUPPORT' },
  ],
  warden: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', section: 'MAIN' },
    { id: 'pending-passes', icon: '⏳', label: 'Pending Requests', section: '' },
    { id: 'all-passes', icon: '📋', label: 'All Gate Passes', section: '' },
    { id: 'students', icon: '👥', label: 'Students', section: 'MANAGEMENT' },
  ],
  security: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', section: 'MAIN' },
    { id: 'scanner', icon: '📷', label: 'QR Scanner', section: '' },
    { id: 'entry-exit', icon: '🔁', label: 'Entry / Exit Log', section: '' },
    { id: 'active-passes', icon: '✅', label: 'Active Passes', section: '' },
  ],
  mess: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', section: 'MAIN' },
    { id: 'meal-counts', icon: '📊', label: 'Meal Counts', section: '' },
    { id: 'attendance', icon: '📈', label: 'Attendance Charts', section: '' },
    { id: 'menu-mgmt', icon: '📅', label: 'Menu Management', section: 'TOOLS' },
    { id: 'feedback', icon: '💬', label: 'Feedback', section: '' },
  ],
  admin: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', section: 'MAIN' },
    { id: 'campus-status', icon: '🏫', label: 'Campus Status', section: '' },
    { id: 'pending-admin', icon: '⏳', label: 'Pending Passes', section: '' },
    { id: 'all-students', icon: '👥', label: 'All Students', section: 'MANAGEMENT' },
    { id: 'mess-stats', icon: '🍽️', label: 'Mess Stats', section: 'MESS' },
    { id: 'user-mgmt', icon: '👥', label: 'User Management', section: 'SYSTEM' },
    { id: 'reports', icon: '📊', label: 'Reports', section: '' },
  ],
};

// Role display names
const RoleNames = {
  student: 'Student',
  warden: 'Warden',
  security: 'Security Guard',
  mess: 'Mess Manager',
  admin: 'Administrator',
};

const RoleUsers = {
  student: { name: 'Arjun Sharma', id: 'S001', username: 'student1', password: 'password' },
  warden: { name: 'Dr. R.K. Verma', id: 'W01', username: 'warden1', password: 'password' },
  security: { name: 'Kumar Ravi', id: 'SEC01', username: 'security1', password: 'password' },
  mess: { name: 'Chef Mohan', id: 'MESS01', username: 'mess1', password: 'password' },
  admin: { name: 'Admin Office', id: 'ADM01', username: 'admin', password: 'password' },
};
