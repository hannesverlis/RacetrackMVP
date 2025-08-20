// Socket.IO ühendus
const socket = io();

// DOM elemendid
const flagDisplay = document.getElementById('flagDisplay');
const flagText = document.getElementById('flagText');

// Lippude värskendamine
function updateFlag(mode) {
    // Eemalda kõik olemasolevad klassid
    flagDisplay.className = 'flag-display';
    
    // Lisa uus klass ja tekst vastavalt režiimile
    switch(mode) {
        case 'Safe':
            flagDisplay.classList.add('flag-safe');
            flagText.textContent = 'TURVALINE';
            break;
        case 'Hazard':
            flagDisplay.classList.add('flag-hazard');
            flagText.textContent = 'OHT';
            break;
        case 'Danger':
            flagDisplay.classList.add('flag-danger');
            flagText.textContent = 'OHULIK';
            break;
        case 'Finish':
            flagDisplay.classList.add('flag-finish');
            flagText.textContent = 'LÕPETA';
            break;
        default:
            flagDisplay.classList.add('flag-danger');
            flagText.textContent = 'OOTAB VÕIDUSÕITU';
    }
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
    const raceMode = state.raceMode || 'Danger';
    updateFlag(raceMode);
});

socket.on('raceModeChanged', (data) => {
    updateFlag(data.raceMode);
});

socket.on('raceSessionEnded', (data) => {
    updateFlag(data.raceMode);
});

// Lehe laadimisel
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚩 Race Flags kasutajaliides laaditud');
});
