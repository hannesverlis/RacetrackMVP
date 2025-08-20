// Socket.IO ühendus
const socket = io();

// Oleku andmed
let raceSessions = [];
let currentRace = null;
let raceMode = 'Danger';
let authenticated = false;
let remainingTime = 0;

// DOM elemendid
const authForm = document.getElementById('authForm');
const mainInterface = document.getElementById('mainInterface');
const authError = document.getElementById('authError');
const nextRaceInfo = document.getElementById('nextRaceInfo');
const startRaceBtn = document.getElementById('startRaceBtn');
const raceControls = document.getElementById('raceControls');
const raceTimer = document.getElementById('raceTimer');
const endSessionBtn = document.getElementById('endSessionBtn');
const currentRaceInfo = document.getElementById('currentRaceInfo');
const currentRaceDetails = document.getElementById('currentRaceDetails');

// Autentimine
function authenticate() {
    const accessKey = document.getElementById('accessKey').value;
    
    if (!accessKey) {
        showError('Palun sisesta ligipääsukood');
        return;
    }
    
    socket.emit('authenticate', {
        key: accessKey,
        interface: 'race-control'
    });
}

// Veateate kuvamine
function showError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
    setTimeout(() => {
        authError.style.display = 'none';
    }, 3000);
}

// Võidusõidu alustamine
function startRace() {
    socket.emit('startRace');
}

// Võidusõidu režiimi muutmine
function changeRaceMode(mode) {
    socket.emit('changeRaceMode', mode);
}

// Võidusõidu lõpetamine
function endRaceSession() {
    if (confirm('Kas oled kindel, et soovid võidusõidu lõpetada?')) {
        socket.emit('endRaceSession');
    }
}

// Aja vormindamine
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Järgmise võidusõidu info värskendamine
function updateNextRaceInfo() {
    const nextRace = raceSessions.find(race => race.status === 'upcoming');
    
    if (!nextRace) {
        nextRaceInfo.innerHTML = '<p>Järgmist võidusõitu pole planeeritud.</p>';
        startRaceBtn.style.display = 'none';
        return;
    }
    
    if (nextRace.drivers.length === 0) {
        nextRaceInfo.innerHTML = `
            <h3>${nextRace.name}</h3>
            <p>❌ Võidusõidus pole sõitjaid. Lisa sõitjad Front Desk-is.</p>
        `;
        startRaceBtn.style.display = 'none';
        return;
    }
    
    nextRaceInfo.innerHTML = `
        <h3>${nextRace.name}</h3>
        <p><strong>Sõitjad (${nextRace.drivers.length}):</strong></p>
        <table class="table">
            <thead>
                <tr>
                    <th>Auto</th>
                    <th>Sõitja</th>
                </tr>
            </thead>
            <tbody>
                ${nextRace.drivers.map(driver => `
                    <tr>
                        <td><strong>${driver.carNumber}</strong></td>
                        <td>${driver.name}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    startRaceBtn.style.display = 'block';
}

// Praeguse võidusõidu info värskendamine
function updateCurrentRaceInfo() {
    if (!currentRace) {
        currentRaceInfo.style.display = 'none';
        return;
    }
    
    currentRaceInfo.style.display = 'block';
    currentRaceDetails.innerHTML = `
        <h3>${currentRace.name}</h3>
        <p><strong>Režiim:</strong> ${raceMode}</p>
        <p><strong>Sõitjad:</strong> ${currentRace.drivers.length}</p>
        <p><strong>Järelejäänud aeg:</strong> ${formatTime(remainingTime)}</p>
    `;
}

// Socket.IO sündmused
socket.on('authenticated', (data) => {
    if (data.success) {
        authenticated = true;
        authForm.style.display = 'none';
        mainInterface.style.display = 'block';
        console.log('✅ Autentimine õnnestus');
    } else {
        showError(data.message || 'Vale ligipääsukood');
    }
});

socket.on('currentState', (state) => {
    raceSessions = state.raceSessions || [];
    currentRace = state.currentRace;
    raceMode = state.raceMode || 'Danger';
    remainingTime = state.remainingTime || 0;
    
    updateNextRaceInfo();
    updateCurrentRaceInfo();
    
    if (currentRace && currentRace.status === 'active') {
        raceControls.style.display = 'block';
        raceTimer.textContent = formatTime(remainingTime);
    } else {
        raceControls.style.display = 'none';
    }
});

socket.on('raceSessionsUpdated', (sessions) => {
    raceSessions = sessions;
    updateNextRaceInfo();
});

socket.on('raceStarted', (data) => {
    currentRace = data.currentRace;
    raceMode = data.raceMode;
    raceControls.style.display = 'block';
    updateCurrentRaceInfo();
    console.log('🏁 Võidusõit alustatud');
});

socket.on('raceModeChanged', (data) => {
    raceMode = data.raceMode;
    updateCurrentRaceInfo();
    
    if (raceMode === 'Finish') {
        endSessionBtn.style.display = 'block';
    } else {
        endSessionBtn.style.display = 'none';
    }
});

socket.on('timerUpdate', (data) => {
    remainingTime = data.remainingTime;
    raceTimer.textContent = formatTime(remainingTime);
    updateCurrentRaceInfo();
});

socket.on('raceSessionEnded', (data) => {
    currentRace = null;
    raceMode = data.raceMode;
    raceControls.style.display = 'none';
    endSessionBtn.style.display = 'none';
    updateCurrentRaceInfo();
    console.log('🏁 Võidusõit lõpetatud');
});

socket.on('error', (message) => {
    showError(message);
});

// Enter klahvi toetamine
document.getElementById('accessKey').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        authenticate();
    }
});

// Lehe laadimisel
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 Race Control kasutajaliides laaditud');
});
