// Socket.IO ühendus
const socket = io();

// Oleku andmed
let currentRace = null;
let raceMode = 'Danger';
let authenticated = false;
let lapTimes = {};
let currentLaps = {};

// DOM elemendid
const authForm = document.getElementById('authForm');
const mainInterface = document.getElementById('mainInterface');
const authError = document.getElementById('authError');
const raceInfo = document.getElementById('raceInfo');
const lapButtons = document.getElementById('lapButtons');
const lapStats = document.getElementById('lapStats');

// Autentimine
function authenticate() {
    const accessKey = document.getElementById('accessKey').value;
    
    if (!accessKey) {
        showError('Palun sisesta ligipääsukood');
        return;
    }
    
    socket.emit('authenticate', {
        key: accessKey,
        interface: 'lap-line-tracker'
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

// Ringi registreerimine
function recordLap(carNumber) {
    socket.emit('recordLap', carNumber);
}

// Aja vormindamine
function formatTime(milliseconds) {
    if (!milliseconds) return '--:--';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Võidusõidu info värskendamine
function updateRaceInfo() {
    if (!currentRace) {
        raceInfo.innerHTML = '<p>Võidusõitu pole alustatud.</p>';
        return;
    }
    
    raceInfo.innerHTML = `
        <h3>${currentRace.name}</h3>
        <p><strong>Režiim:</strong> ${raceMode}</p>
        <p><strong>Sõitjad:</strong> ${currentRace.drivers.length}</p>
        <p><strong>Staatus:</strong> ${currentRace.status === 'active' ? '🟢 Aktiivne' : '🔴 Lõpetatud'}</p>
    `;
}

// Ringi nuppude värskendamine
function updateLapButtons() {
    if (!currentRace || currentRace.status !== 'active') {
        lapButtons.innerHTML = '<p>Ringi nupud ilmuvad võidusõidu alustamisel.</p>';
        return;
    }
    
    let html = '';
    currentRace.drivers.forEach(driver => {
        const carNumber = driver.carNumber;
        const lapCount = currentLaps[carNumber] || 0;
        const isDisabled = raceMode === 'Finish';
        
        html += `
            <button 
                onclick="recordLap(${carNumber})" 
                class="lap-btn ${isDisabled ? 'disabled' : ''}"
                ${isDisabled ? 'disabled' : ''}
            >
                <div>
                    <div style="font-size: 3rem; margin-bottom: 10px;">${carNumber}</div>
                    <div style="font-size: 1rem;">Ring: ${lapCount}</div>
                </div>
            </button>
        `;
    });
    
    lapButtons.innerHTML = html;
}

// Ringide statistika värskendamine
function updateLapStats() {
    if (!currentRace || Object.keys(lapTimes).length === 0) {
        lapStats.innerHTML = '<p>Statistikat pole veel saadaval.</p>';
        return;
    }
    
    let html = '<table class="table">';
    html += `
        <thead>
            <tr>
                <th>Auto</th>
                <th>Sõitja</th>
                <th>Ringid</th>
                <th>Kiireim ring</th>
                <th>Esimene ring</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    currentRace.drivers.forEach(driver => {
        const carNumber = driver.carNumber;
        const lapData = lapTimes[carNumber];
        const lapCount = currentLaps[carNumber] || 0;
        
        if (lapData) {
            html += `
                <tr>
                    <td><strong>${carNumber}</strong></td>
                    <td>${driver.name}</td>
                    <td>${lapCount}</td>
                    <td>${formatTime(lapData.fastestLap)}</td>
                    <td>${formatTime(lapData.firstLapTime)}</td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td><strong>${carNumber}</strong></td>
                    <td>${driver.name}</td>
                    <td>0</td>
                    <td>--:--</td>
                    <td>--:--</td>
                </tr>
            `;
        }
    });
    
    html += '</tbody></table>';
    lapStats.innerHTML = html;
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
    currentRace = state.currentRace;
    raceMode = state.raceMode || 'Danger';
    lapTimes = state.lapTimes || {};
    currentLaps = state.currentLaps || {};
    
    updateRaceInfo();
    updateLapButtons();
    updateLapStats();
});

socket.on('raceStarted', (data) => {
    currentRace = data.currentRace;
    raceMode = data.raceMode;
    lapTimes = {};
    currentLaps = {};
    
    updateRaceInfo();
    updateLapButtons();
    updateLapStats();
    console.log('🏁 Võidusõit alustatud');
});

socket.on('raceModeChanged', (data) => {
    raceMode = data.raceMode;
    updateRaceInfo();
    updateLapButtons();
});

socket.on('lapRecorded', (data) => {
    lapTimes = data.lapTimes;
    currentLaps = data.currentLaps;
    
    updateLapButtons();
    updateLapStats();
    console.log(`⏱️ Ring registreeritud: Auto ${data.carNumber}`);
});

socket.on('raceSessionEnded', (data) => {
    currentRace = null;
    raceMode = data.raceMode;
    
    updateRaceInfo();
    updateLapButtons();
    updateLapStats();
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
    console.log('⏱️ Lap-line Tracker kasutajaliides laaditud');
});
