// ============================================
//   SMART CAMPUS — FIREBASE ADAPTER
//   (Mimics Socket.io API for Firebase)
// ============================================

const firebaseAdapter = (() => {
  const listeners = {};

  // Initialize DB structure if empty (Migration helper)
  const initializeDB = (initialData) => {
    database.ref('/').once('value').then(snapshot => {
      if (!snapshot.exists()) {
        console.log("📦 Initializing Firebase with default data...");
        database.ref('/').set(initialData);
      }
    });
  };

  // The pseudo-socket object
  const socketMock = {
    connected: true,
    
    on: (event, callback) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
      
      // Helper to convert Firebase object to array
      const toArray = (obj) => obj ? Object.values(obj) : [];

      // Map specific Firebase paths to events
      if (event === 'SYNC_STATE') {
        database.ref('/').on('value', (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Ensure collections are arrays for the app
            const syncedData = {
              ...data,
              users: toArray(data.users),
              gatePasses: toArray(data.gatePasses),
              logs: toArray(data.logs),
              feedbacks: toArray(data.feedbacks),
              messBookings: data.messBookings || {},
              messMenu: data.messMenu || {}
            };
            callback(syncedData);
          }
        });
      }
      
      if (event === 'GATE_PASS_ADDED') {
        database.ref('gatePasses').on('child_added', (snapshot) => {
          callback(snapshot.val());
        });
      }

      if (event === 'GATE_PASS_UPDATED') {
        database.ref('gatePasses').on('child_changed', (snapshot) => {
          callback(snapshot.val());
        });
      }

      if (event === 'LOG_ADDED') {
        database.ref('logs').on('child_added', (snapshot) => {
          callback(snapshot.val());
        });
      }

      if (event === 'MENU_UPDATED') {
        database.ref('messMenu').on('value', (snapshot) => {
          callback(snapshot.val());
        });
      }

      if (event === 'FEEDBACK_ADDED') {
        database.ref('feedbacks').on('child_added', (snapshot) => {
          callback(snapshot.val());
        });
      }
    },

    emit: (event, data) => {
      console.log(`📡 Firebase Emit: ${event}`, data);
      
      switch(event) {
        case 'ADD_USER':
          database.ref('users').push(data);
          break;
        case 'UPDATE_USER':
          database.ref('users').once('value', (snapshot) => {
            snapshot.forEach((child) => {
              if (child.val().id === data.id) {
                child.ref.update(data);
              }
            });
          });
          break;
        case 'DELETE_USER':
          database.ref('users').once('value', (snapshot) => {
            snapshot.forEach((child) => {
              if (child.val().id === data) {
                child.ref.remove();
              }
            });
          });
          break;
        case 'GATE_PASS_REQUEST':
          database.ref('gatePasses').push(data);
          break;
        case 'UPDATE_PASS_STATUS':
          database.ref('gatePasses').once('value', (snapshot) => {
            snapshot.forEach((child) => {
              if (child.val().id === data.id) {
                child.ref.update({ 
                  status: data.status, 
                  wardenNote: data.wardenNote || '' 
                });
                
                // Create notification
                const pass = child.val();
                const notif = {
                  studentId: pass.studentId,
                  text: `Your gate pass ${pass.id} has been ${data.status}!`,
                  color: data.status === 'approved' ? 'green' : 'red',
                  timestamp: Date.now()
                };
                database.ref('notifications').push(notif);
              }
            });
          });
          break;
        case 'TOGGLE_MESS_BOOKING':
          const { studentId, meal, status } = data;
          database.ref(`messBookings/${studentId}/${meal}`).set(status);
          break;
        case 'SECURITY_LOG':
          database.ref('logs').push(data);
          // Also update student status and pass status
          const log = data;
          database.ref('users').once('value', (snapshot) => {
             snapshot.forEach(c => {
               if(c.val().id === log.studentId) {
                 c.ref.update({ status: log.type === 'entry' ? 'inside' : 'outside' });
               }
             });
          });
          database.ref('gatePasses').once('value', (snapshot) => {
            snapshot.forEach(c => {
              if(c.val().id === log.passId) {
                const update = log.type === 'exit' ? { exitTime: log.time, status: 'used' } : { entryTime: log.time, status: 'used' };
                c.ref.update(update);
              }
            });
          });
          break;
        case 'SUBMIT_FEEDBACK':
          const feedback = {
            ...data,
            id: `FB${Date.now()}`,
            createdAt: new Date().toISOString()
          };
          database.ref('feedbacks').push(feedback);
          break;
        case 'UPDATE_MENU':
          database.ref('messMenu').set(data);
          break;
      }
    }
  };

  // Special listener for notifications
  socketMock.on('NOTIFICATION', (callback) => {
    database.ref('notifications').on('child_added', (snapshot) => {
      const notif = snapshot.val();
      // Only trigger if it's recent (to avoid blast from history)
      if (notif.timestamp > Date.now() - 10000) {
        callback(notif);
      }
    });
  });

  return { socketMock, initializeDB };
})();

// Export globally
window.io = () => firebaseAdapter.socketMock;
