const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Keskkonnamuutujate kontroll
const requiredEnvVars = [
  'RECEPTIONIST_KEY',
  'SAFETY_OFFICIAL_KEY', 
  'LAP_LINE_OBSERVER_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Vajalikud keskkonnamuutujad puuduvad:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n💡 Näide keskkonnamuutujate seadistamiseks:');
  console.error('export RECEPTIONIST_KEY=8ded6076');
  console.error('export SAFETY_OFFICIAL_KEY=a2d393bc');
  console.error('export LAP_LINE_OBSERVER_KEY=662e0f6c');
  console.error('npm start');
  process.exit(1);
}

// Staatiliste failide serveerimine
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Võidusõidu andmed
let raceSessions = [];
let currentRace = null;
let raceTimer = null;
let raceMode = 'Danger'; // Safe, Hazard, Danger, Finish
let lapTimes = {};
let currentLaps = {};

// Keskkonnamuutujad
const RACE_DURATION = process.env.RACE_DURATION ? parseInt(process.env.RACE_DURATION) : 600000; // 10 minutit või 1 minut dev režiimis

// Socket.IO ühenduste haldamine
io.on('connection', (socket) => {
  console.log('🔌 Uus ühendus:', socket.id);

  // Saada praegune olek uuele ühendusele
  socket.emit('currentState', {
    raceSessions,
    currentRace,
    raceMode,
    lapTimes,
    currentLaps,
    remainingTime: currentRace ? Math.max(0, RACE_DURATION - (Date.now() - currentRace.startTime)) : 0
  });

  // Front Desk - võidusõitude haldamine
  socket.on('authenticate', (data) => {
    const { key, interface } = data;
    let isValid = false;
    
    switch(interface) {
      case 'front-desk':
        isValid = key === process.env.RECEPTIONIST_KEY;
        break;
      case 'race-control':
        isValid = key === process.env.SAFETY_OFFICIAL_KEY;
        break;
      case 'lap-line-tracker':
        isValid = key === process.env.LAP_LINE_OBSERVER_KEY;
        break;
    }

    if (isValid) {
      socket.authenticated = true;
      socket.interface = interface;
      socket.emit('authenticated', { success: true });
      console.log(`✅ Autentimine õnnestus: ${interface}`);
    } else {
      setTimeout(() => {
        socket.emit('authenticated', { success: false, message: 'Vale ligipääsukood' });
      }, 500);
      console.log(`❌ Autentimine ebaõnnestus: ${interface}`);
    }
  });

  // Võidusõidu lisamine
  socket.on('addRaceSession', (data) => {
    if (!socket.authenticated || socket.interface !== 'front-desk') return;
    
    const newSession = {
      id: Date.now().toString(),
      name: data.name,
      drivers: [],
      status: 'upcoming'
    };
    
    raceSessions.push(newSession);
    io.emit('raceSessionsUpdated', raceSessions);
    console.log('🏁 Uus võidusõit lisatud:', newSession.name);
  });

  // Võidusõidu kustutamine
  socket.on('deleteRaceSession', (sessionId) => {
    if (!socket.authenticated || socket.interface !== 'front-desk') return;
    
    raceSessions = raceSessions.filter(session => session.id !== sessionId);
    io.emit('raceSessionsUpdated', raceSessions);
    console.log('🗑️ Võidusõit kustutud:', sessionId);
  });

  // Sõitja lisamine
  socket.on('addDriver', (data) => {
    if (!socket.authenticated || socket.interface !== 'front-desk') return;
    
    const session = raceSessions.find(s => s.id === data.sessionId);
    if (!session) return;
    
    // Kontrolli, kas sõitja nimi on juba olemas
    if (session.drivers.some(d => d.name === data.name)) {
      socket.emit('error', 'Sõitja nimi peab olema unikaalne');
      return;
    }
    
    // Määra auto number
    const carNumber = session.drivers.length + 1;
    
    session.drivers.push({
      name: data.name,
      carNumber: carNumber
    });
    
    io.emit('raceSessionsUpdated', raceSessions);
    console.log(`👤 Sõitja lisatud: ${data.name} (Auto ${carNumber})`);
  });

  // Sõitja kustutamine
  socket.on('removeDriver', (data) => {
    if (!socket.authenticated || socket.interface !== 'front-desk') return;
    
    const session = raceSessions.find(s => s.id === data.sessionId);
    if (!session) return;
    
    session.drivers = session.drivers.filter(d => d.name !== data.name);
    
    // Taaskorda auto numbrid
    session.drivers.forEach((driver, index) => {
      driver.carNumber = index + 1;
    });
    
    io.emit('raceSessionsUpdated', raceSessions);
    console.log(`👤 Sõitja kustutud: ${data.name}`);
  });

  // Võidusõidu alustamine
  socket.on('startRace', () => {
    if (!socket.authenticated || socket.interface !== 'race-control') return;
    
    const nextRace = raceSessions.find(s => s.status === 'upcoming');
    if (!nextRace || nextRace.drivers.length === 0) {
      socket.emit('error', 'Pole võidusõitu alustada');
      return;
    }
    
    currentRace = {
      ...nextRace,
      startTime: Date.now(),
      status: 'active'
    };
    
    nextRace.status = 'active';
    raceMode = 'Safe';
    lapTimes = {};
    currentLaps = {};
    
    // Alusta ajastit
    if (raceTimer) clearInterval(raceTimer);
    raceTimer = setInterval(() => {
      const remainingTime = Math.max(0, RACE_DURATION - (Date.now() - currentRace.startTime));
      
      if (remainingTime <= 0) {
        finishRace();
      } else {
        io.emit('timerUpdate', { remainingTime });
      }
    }, 1000);
    
    io.emit('raceStarted', { currentRace, raceMode });
    console.log('🏁 Võidusõit alustatud:', currentRace.name);
  });

  // Võidusõidu režiimi muutmine
  socket.on('changeRaceMode', (mode) => {
    if (!socket.authenticated || socket.interface !== 'race-control') return;
    if (!currentRace || currentRace.status !== 'active') return;
    
    raceMode = mode;
    io.emit('raceModeChanged', { raceMode });
    console.log('🚩 Võidusõidu režiim muudetud:', mode);
    
    if (mode === 'Finish') {
      finishRace();
    }
  });

  // Võidusõidu lõpetamine
  socket.on('endRaceSession', () => {
    if (!socket.authenticated || socket.interface !== 'race-control') return;
    if (!currentRace || raceMode !== 'Finish') return;
    
    // Märgi võidusõit lõpetatuks
    const sessionIndex = raceSessions.findIndex(s => s.id === currentRace.id);
    if (sessionIndex !== -1) {
      raceSessions[sessionIndex].status = 'finished';
    }
    
    currentRace = null;
    raceMode = 'Danger';
    
    if (raceTimer) {
      clearInterval(raceTimer);
      raceTimer = null;
    }
    
    io.emit('raceSessionEnded', { raceMode });
    console.log('🏁 Võidusõit lõpetatud');
  });

  // Ringi registreerimine
  socket.on('recordLap', (carNumber) => {
    if (!socket.authenticated || socket.interface !== 'lap-line-tracker') return;
    if (!currentRace || currentRace.status !== 'active') return;
    
    const now = Date.now();
    const lapNumber = (currentLaps[carNumber] || 0) + 1;
    currentLaps[carNumber] = lapNumber;
    
    if (lapNumber === 1) {
      // Esimene ring
      lapTimes[carNumber] = {
        firstLapTime: now - currentRace.startTime,
        fastestLap: null,
        driver: currentRace.drivers.find(d => d.carNumber === carNumber)?.name || 'Tundmatu'
      };
    } else {
      // Järgnevad ringid
      const lastLapTime = lapTimes[carNumber].lastLapTime || currentRace.startTime;
      const lapDuration = now - lastLapTime;
      
      if (!lapTimes[carNumber].fastestLap || lapDuration < lapTimes[carNumber].fastestLap) {
        lapTimes[carNumber].fastestLap = lapDuration;
      }
    }
    
    lapTimes[carNumber].lastLapTime = now;
    
    io.emit('lapRecorded', { carNumber, lapTimes, currentLaps });
    console.log(`⏱️ Ring registreeritud: Auto ${carNumber}, Ring ${lapNumber}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Ühendus katkestatud:', socket.id);
  });
});

// Võidusõidu lõpetamise funktsioon
function finishRace() {
  if (!currentRace) return;
  
  raceMode = 'Finish';
  io.emit('raceModeChanged', { raceMode });
  console.log('🏁 Võidusõit lõpetatud ajastiga');
}

// HTML lehtede marsruudid
app.get('/front-desk', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'front-desk.html'));
});

app.get('/race-control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'race-control.html'));
});

app.get('/lap-line-tracker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'lap-line-tracker.html'));
});

app.get('/leader-board', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'leader-board.html'));
});

app.get('/next-race', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'next-race.html'));
});

app.get('/race-countdown', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'race-countdown.html'));
});

app.get('/race-flags', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'race-flags.html'));
});

// Serveri käivitamine
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Beachside Racetrack MVP server käivitatud!');
  console.log(`🌐 Server töötab: http://localhost:${PORT}`);
  console.log('📱 Kasutajaliidesed:');
  console.log(`   Front Desk: http://localhost:${PORT}/front-desk`);
  console.log(`   Race Control: http://localhost:${PORT}/race-control`);
  console.log(`   Lap-line Tracker: http://localhost:${PORT}/lap-line-tracker`);
  console.log(`   Leader Board: http://localhost:${PORT}/leader-board`);
  console.log(`   Next Race: http://localhost:${PORT}/next-race`);
  console.log(`   Race Countdown: http://localhost:${PORT}/race-countdown`);
  console.log(`   Race Flags: http://localhost:${PORT}/race-flags`);
});
