// Socket.IO ühendus
const socket = io();

// Oleku andmed
let currentRace = null;
let remainingTime = 0;

// DOM elemendid
const raceTimer = document.getElementById('raceTimer');
const raceInfo = document.getElementById('raceInfo');

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
        raceInfo.textContent = 'Ootab võidusõitu...';
        return;
    }
    
    raceInfo.textContent = `${currentRace.name} - ${currentRace.drivers.length} sõitjat`;
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
    remainingTime = state.remainingTime || 0;
    
    updateRaceInfo();
    raceTimer.textContent = formatTime(remainingTime);
});

socket.on('raceStarted', (data) => {
    currentRace = data.currentRace;
    
    updateRaceInfo();
    console.log('🏁 Võidusõit alustatud');
});

socket.on('timerUpdate', (data) => {
    remainingTime = data.remainingTime;
    raceTimer.textContent = formatTime(remainingTime);
});

socket.on('raceSessionEnded', (data) => {
    currentRace = null;
    
    updateRaceInfo();
    console.log('🏁 Võidusõit lõpetatud');
});

// Lehe laadimisel
document.addEventListener('DOMContentLoaded', () => {
    console.log('⏰ Race Countdown kasutajaliides laaditud');
});
