// Socket.IO ühendus
const socket = io();

// Oleku andmed
let raceSessions = [];
let authenticated = false;

// DOM elemendid
const authForm = document.getElementById('authForm');
const mainInterface = document.getElementById('mainInterface');
const authError = document.getElementById('authError');
const raceSessionsList = document.getElementById('raceSessionsList');
const selectedRaceSelect = document.getElementById('selectedRace');

// Autentimine
function authenticate() {
    const accessKey = document.getElementById('accessKey').value;
    
    if (!accessKey) {
        showError('Palun sisesta ligipääsukood');
        return;
    }
    
    socket.emit('authenticate', {
        key: accessKey,
        interface: 'front-desk'
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

// Võidusõidu lisamine
function addRaceSession() {
    const raceName = document.getElementById('raceName').value.trim();
    
    if (!raceName) {
        showError('Palun sisesta võidusõidu nimi');
        return;
    }
    
    socket.emit('addRaceSession', { name: raceName });
    document.getElementById('raceName').value = '';
}

// Sõitja lisamine
function addDriver() {
    const sessionId = selectedRaceSelect.value;
    const driverName = document.getElementById('driverName').value.trim();
    
    if (!sessionId) {
        showError('Palun vali võidusõit');
        return;
    }
    
    if (!driverName) {
        showError('Palun sisesta sõitja nimi');
        return;
    }
    
    socket.emit('addDriver', {
        sessionId: sessionId,
        name: driverName
    });
    
    document.getElementById('driverName').value = '';
}

// Sõitja kustutamine
function removeDriver(sessionId, driverName) {
    if (confirm(`Kas oled kindel, et soovid sõitja "${driverName}" kustutada?`)) {
        socket.emit('removeDriver', {
            sessionId: sessionId,
            name: driverName
        });
    }
}

// Võidusõidu kustutamine
function deleteRaceSession(sessionId, raceName) {
    if (confirm(`Kas oled kindel, et soovid võidusõidu "${raceName}" kustutada?`)) {
        socket.emit('deleteRaceSession', sessionId);
    }
}

// Võidusõitude nimekirja värskendamine
function updateRaceSessionsList() {
    const upcomingRaces = raceSessions.filter(race => race.status === 'upcoming');
    
    if (upcomingRaces.length === 0) {
        raceSessionsList.innerHTML = '<p>Võidusõite pole veel lisatud.</p>';
        return;
    }
    
    let html = '';
    upcomingRaces.forEach(race => {
        html += `
            <div class="card" style="margin-bottom: 15px;">
                <div class="card-header">
                    <h4 style="margin: 0; color: #74b9ff;">${race.name}</h4>
                    <button onclick="deleteRaceSession('${race.id}', '${race.name}')" class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;">
                        🗑️ Kustuta
                    </button>
                </div>
                <div>
                    <p><strong>Sõitjad (${race.drivers.length}):</strong></p>
                    ${race.drivers.length === 0 ? '<p>Pole sõitjaid</p>' : `
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Auto</th>
                                    <th>Sõitja</th>
                                    <th>Tegevus</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${race.drivers.map(driver => `
                                    <tr>
                                        <td><strong>${driver.carNumber}</strong></td>
                                        <td>${driver.name}</td>
                                        <td>
                                            <button onclick="removeDriver('${race.id}', '${driver.name}')" class="btn btn-danger" style="padding: 3px 8px; font-size: 0.7rem;">
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `}
                </div>
            </div>
        `;
    });
    
    raceSessionsList.innerHTML = html;
}

// Võidusõitude valiku värskendamine
function updateRaceSelect() {
    const upcomingRaces = raceSessions.filter(race => race.status === 'upcoming');
    
    selectedRaceSelect.innerHTML = '<option value="">Vali võidusõit...</option>';
    upcomingRaces.forEach(race => {
        selectedRaceSelect.innerHTML += `<option value="${race.id}">${race.name}</option>`;
    });
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
    updateRaceSessionsList();
    updateRaceSelect();
});

socket.on('raceSessionsUpdated', (sessions) => {
    raceSessions = sessions;
    updateRaceSessionsList();
    updateRaceSelect();
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

document.getElementById('raceName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addRaceSession();
    }
});

document.getElementById('driverName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addDriver();
    }
});

// Lehe laadimisel
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 Front Desk kasutajaliides laaditud');
});
