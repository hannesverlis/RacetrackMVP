// Socket.IO ühendus
const socket = io();

// Oleku andmed
let raceSessions = [];
let currentRace = null;
let raceMode = 'Danger';

// DOM elemendid
const nextRaceInfo = document.getElementById('nextRaceInfo');
const driversList = document.getElementById('driversList');
const message = document.getElementById('message');
const messageContent = document.getElementById('messageContent');

// Järgmise võidusõidu info värskendamine
function updateNextRaceInfo() {
    const nextRace = raceSessions.find(race => race.status === 'upcoming');
    
    if (!nextRace) {
        nextRaceInfo.innerHTML = '<p>Järgmist võidusõitu pole planeeritud.</p>';
        return;
    }
    
    nextRaceInfo.innerHTML = `
        <h3>${nextRace.name}</h3>
        <p><strong>Staatus:</strong> Ootab alustamist</p>
        <p><strong>Sõitjad:</strong> ${nextRace.drivers.length}</p>
    `;
}

// Sõitjate nimekirja värskendamine
function updateDriversList() {
    const nextRace = raceSessions.find(race => race.status === 'upcoming');
    
    if (!nextRace || nextRace.drivers.length === 0) {
        driversList.innerHTML = '<p>Sõitjaid pole veel registreeritud.</p>';
        return;
    }
    
    let html = '<table class="table">';
    html += `
        <thead>
            <tr>
                <th>Auto</th>
                <th>Sõitja</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    nextRace.drivers.forEach(driver => {
        html += `
            <tr>
                <td><strong>${driver.carNumber}</strong></td>
                <td>${driver.name}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    driversList.innerHTML = html;
}

// Teate kuvamine
function showMessage(text) {
    messageContent.textContent = text;
    message.style.display = 'block';
}

// Teate peitmine
function hideMessage() {
    message.style.display = 'none';
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
    raceSessions = state.raceSessions || [];
    currentRace = state.currentRace;
    raceMode = state.raceMode || 'Danger';
    
    updateNextRaceInfo();
    updateDriversList();
    hideMessage();
});

socket.on('raceSessionsUpdated', (sessions) => {
    raceSessions = sessions;
    updateNextRaceInfo();
    updateDriversList();
});

socket.on('raceStarted', (data) => {
    currentRace = data.currentRace;
    raceMode = data.raceMode;
    
    updateNextRaceInfo();
    updateDriversList();
    console.log('🏁 Võidusõit alustatud');
});

socket.on('raceSessionEnded', (data) => {
    currentRace = null;
    raceMode = data.raceMode;
    
    updateNextRaceInfo();
    updateDriversList();
    showMessage('🚨 MINE PADDOCKI! 🚨');
    console.log('🏁 Võidusõit lõpetatud');
});

// Lehe laadimisel
document.addEventListener('DOMContentLoaded', () => {
    console.log('⏭️ Next Race kasutajaliides laaditud');
});
