// Socket.IO ühendus
const socket = io();

// Oleku andmed
let currentRace = null;
let raceMode = 'Danger';
let remainingTime = 0;
let lapTimes = {};
let currentLaps = {};

// DOM elemendid
const raceTimer = document.getElementById('raceTimer');
const raceModeElement = document.getElementById('raceMode');
const leaderboard = document.getElementById('leaderboard');

// Aja vormindamine
function formatTime(milliseconds) {
    if (!milliseconds) return '--:--';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Võidusõidu režiimi värskendamine
function updateRaceMode() {
    const modeTexts = {
        'Safe': '🟢 TURVALINE',
        'Hazard': '🟡 OHT',
        'Danger': '🔴 OHULIK',
        'Finish': '🏁 LÕPETA'
    };
    
    raceModeElement.textContent = modeTexts[raceMode] || 'OOTAB VÕIDUSÕITU';
}

// Leaderboard värskendamine
function updateLeaderboard() {
    if (!currentRace) {
        leaderboard.innerHTML = '<p>Võidusõitu pole veel alustatud.</p>';
        return;
    }
    
    // Sorteeri sõitjad kiireima ringi järgi
    const sortedDrivers = [...currentRace.drivers].sort((a, b) => {
        const aTime = lapTimes[a.carNumber]?.fastestLap || Infinity;
        const bTime = lapTimes[b.carNumber]?.fastestLap || Infinity;
        return aTime - bTime;
    });
    
    let html = '<table class="table">';
    html += `
        <thead>
            <tr>
                <th>Koht</th>
                <th>Auto</th>
                <th>Sõitja</th>
                <th>Ringid</th>
                <th>Kiireim ring</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    sortedDrivers.forEach((driver, index) => {
        const carNumber = driver.carNumber;
        const lapData = lapTimes[carNumber];
        const lapCount = currentLaps[carNumber] || 0;
        const fastestLap = lapData?.fastestLap;
        
        const position = index + 1;
        const positionIcon = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
        
        html += `
            <tr>
                <td><strong>${positionIcon}</strong></td>
                <td><strong>${carNumber}</strong></td>
                <td>${driver.name}</td>
                <td>${lapCount}</td>
                <td>${formatTime(fastestLap)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    leaderboard.innerHTML = html;
}

// Täisekraani funktsionaalsus
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Täisekraani viga:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Socket.IO sündmused
socket.on('currentState', (state) => {
    currentRace = state.currentRace;
    raceMode = state.raceMode || 'Danger';
    remainingTime = state.remainingTime || 0;
    lapTimes = state.lapTimes || {};
    currentLaps = state.currentLaps || {};
    
    updateRaceMode();
    updateLeaderboard();
    raceTimer.textContent = formatTime(remainingTime);
});

socket.on('raceStarted', (data) => {
    currentRace = data.currentRace;
    raceMode = data.raceMode;
    lapTimes = {};
    currentLaps = {};
    
    updateRaceMode();
    updateLeaderboard();
    console.log('🏁 Võidusõit alustatud');
});

socket.on('raceModeChanged', (data) => {
    raceMode = data.raceMode;
    updateRaceMode();
});

socket.on('timerUpdate', (data) => {
    remainingTime = data.remainingTime;
    raceTimer.textContent = formatTime(remainingTime);
});

socket.on('lapRecorded', (data) => {
    lapTimes = data.lapTimes;
    currentLaps = data.currentLaps;
    updateLeaderboard();
});

socket.on('raceSessionEnded', (data) => {
    currentRace = null;
    raceMode = data.raceMode;
    
    updateRaceMode();
    updateLeaderboard();
    console.log('🏁 Võidusõit lõpetatud');
});

// Lehe laadimisel
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 Leader Board kasutajaliides laaditud');
});
