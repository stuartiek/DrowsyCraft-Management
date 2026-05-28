// Authentication check - redirect to login if no auth token is stored
if (!localStorage.getItem('authToken')) {
    window.location.href = '/';
}

const AUTH_TOKEN = localStorage.getItem('authToken');
const API_URL = `/api`;
let userPermissions = new Set();
let currentUserName = "WebAdmin";
let punishmentsInterval = null;
let chatRefreshInterval = null;
let serverLogsInterval = null;
const UNSUPPORTED_TABS = new Set(['roleplay', 'voterewards']);

async function loadUserDetails() {
    try {
        const userDetails = await apiCall('/me');
        if (userDetails && userDetails.permissions) {
            userPermissions = new Set(userDetails.permissions);
            document.title = `Realm Tool - ${userDetails.username}`;
            currentUserName = userDetails.username;
            applyPermissions();
        } else {
            // If we can't get user details, the token is likely invalid
            // logout(); // Don't logout on generic errors (like 503)
            console.warn("Failed to load user details. Server might be unreachable.");
        }
    } catch (e) {
        console.error("Failed to load user details", e);
        // logout(); // Don't logout on generic errors
        console.warn("Error loading user details.");
    }
}

function applyPermissions() {
    const adminPermission = "webapp.admin";
    if (userPermissions.has(adminPermission)) {
        console.log("Admin user, all elements visible.");
    } else {
        document.querySelectorAll('[data-permission]').forEach(elem => {
            const requiredPermission = elem.getAttribute('data-permission');
            if (!userPermissions.has(requiredPermission)) {
                elem.style.display = 'none';
            }
        });
    }

    document.querySelectorAll('.nav-btn, .nav-group-btn').forEach(elem => {
        const onClick = elem.getAttribute('onclick') || '';
        for (const tabName of UNSUPPORTED_TABS) {
            if (onClick.includes(`switchTab('${tabName}'`)) {
                elem.style.display = 'none';
            }
        }
    });

    // Hide empty nav groups
    document.querySelectorAll('.nav-group').forEach(group => {
        const items = group.querySelector('.nav-group-items');
        if (items) {
            const visibleItems = Array.from(items.children).filter(child => child.style.display !== 'none');
            if (visibleItems.length === 0) {
                group.style.display = 'none';
            }
        }
    });
}

function toggleNavGroup(button) {
    const items = button.nextElementSibling;
    const isCollapsed = items.classList.contains('collapsed');
    
    if (isCollapsed) {
        items.classList.remove('collapsed');
        button.classList.add('expanded');
        button.classList.remove('collapsed');
    } else {
        items.classList.add('collapsed');
        button.classList.remove('expanded');
        button.classList.add('collapsed');
    }
}

function switchTab(name, button) {
    if (UNSUPPORTED_TABS.has(name)) {
        alert('This panel is not available in the current plugin build.');
        return;
    }

    // Clear any running auto-refresh intervals from other tabs
    if (punishmentsInterval) clearInterval(punishmentsInterval);
    if (chatRefreshInterval) clearInterval(chatRefreshInterval);
    if (serverLogsInterval) clearInterval(serverLogsInterval);
    punishmentsInterval = null;
    chatRefreshInterval = null;
    serverLogsInterval = null;

    // Hide all tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    // Show selected tab
    const tabElement = document.getElementById(name);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Remove active from all buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    // Add active to clicked button
    if (!button && event && event.currentTarget) {
        button = event.currentTarget;
    }
    if (button && button.classList) {
        button.classList.add('active');
    }

    // Persist active tab in localStorage
    localStorage.setItem('activeTab', name);
    
    // Load tab-specific data
    if (name === 'overview') {
        updateOverview();
        loadNetworkOverviewStatus();
    }
    if (name === 'players') loadPlayers();
    if (name === 'tickets') loadTickets();
    if (name === 'moderation') loadBanned();
    if (name === 'chat') {
        refreshChat();
        chatRefreshInterval = setInterval(refreshChat, 3000);
    }
    if (name === 'whitelist') loadWhitelist();
    if (name === 'mutes') loadMuted();
    if (name === 'templates') loadTemplates();
    if (name === 'worlds') loadWorlds();
    if (name === 'plugins') loadPlugins();
    if (name === 'gamerules') loadGameRules();
    if (name === 'reports') loadReports();
    if (name === 'map') initMap();
    if (name === 'performance') loadPerformance();
    if (name === 'blocklog') loadBlockLog();
    if (name === 'reputation') loadReputation();
    if (name === 'permissions') loadPermissions();
    if (name === 'punishments') {
        loadPunishments();
        punishmentsInterval = setInterval(loadPunishments, 5000);
    }
    if (name === 'auditlog') loadAuditLog();
    if (name === 'afk') loadAFKPlayers();
    if (name === 'discord') loadDiscordSettings();
    if (name === 'kits') loadKits();
    if (name === 'ranks') loadRanks();
    if (name === 'player-analytics') loadPlayerAnalytics();
    if (name === 'leaderboards') loadLeaderboards();
    if (name === 'economy') loadEconomy();
    if (name === 'serverlogs') {
        loadServerLogs();
        serverLogsInterval = setInterval(loadServerLogs, 3000);
    }
    if (name === 'appeals') loadAppeals();
    if (name === 'announcements') loadAnnouncements();
    if (name === 'backups') loadBackups();
    if (name === 'scheduler') loadScheduledCommands();
    if (name === 'maintenance') loadMaintenanceMode();
    if (name === 'landc-claims') loadLandClaims();
    if (name === 'roleplay') loadRoleplayCommands();
    if (name === 'voterewards') loadVoteRewards();
    if (name === 'crates') loadCrates();
    if (name === 'bounties') loadBounties();
    if (name === 'shops') loadShops();
    if (name === 'quests') loadQuests();
    if (name === 'enchantments') loadEnchantments();
    if (name === 'applications') loadApplications();
    if (name === 'polls') loadPolls();
    if (name === 'automod') loadAutomod();
    if (name === 'playtime-rewards') loadPlaytimeRewards();
    if (name === 'motd') loadMotd();
    if (name === 'daily-login') loadDailyLogin();
    if (name === 'auction-house') loadAuctions();
    if (name === 'nicknames') loadNicknames();
    if (name === 'chat-tags') loadChatTags();
    if (name === 'server-rules') loadServerRules();
    if (name === 'player-warps') loadPlayerWarps();
    if (name === 'custom-recipes') loadCustomRecipes();
    if (name === 'pvp-stats') loadPvpStats();
    if (name === 'achievements-tab') loadAchievements();
    if (name === 'duels') loadDuels();
    if (name === 'welcome-settings') loadWelcomeSettings();
    if (name === 'inactive-alerts') loadInactiveAlerts();
    if (name === 'sched-announcements') loadSchedAnnouncements();
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/';
}

async function apiCall(endpoint, method = 'GET', params = null, suppressError = false) {
    const url = (method === 'GET' && params) ? `${API_URL}${endpoint}?${new URLSearchParams(params).toString()}` : `${API_URL}${endpoint}`;
    const options = {
        method,
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    };
    
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') && params) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(params);
    }
    
    try {
        const response = await fetch(url, options);
        if (response.status === 401) {
            logout();
            return null;
        }
        
        const text = await response.text();
        if (!response.ok) {
            if (!suppressError) console.warn(`API Request to ${endpoint} failed: ${response.status} ${response.statusText}`);
            return null;
        }
        try {
            return text ? JSON.parse(text) : null;
        } catch (e) {
            // If JSON parsing fails, return the raw text.
            return text;
        }
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

async function updateOverview() {
    const response = await apiCall('/players');
    const players = response && response.players ? response.players : [];
    const tickets = await apiCall('/tickets');
    const muted = await apiCall('/muted');
    
    let punished = 0;
    if (players && players.length > 0) {
        updatePlayerDatalist(players.map(p => p.name));
        players.forEach(p => { if (p.punished) punished++; });
        document.getElementById('stat-players').textContent = players.length;
    }
    document.getElementById('stat-punished').textContent = punished;
    const ticketList = Array.isArray(tickets) ? tickets : (tickets && Array.isArray(tickets.tickets) ? tickets.tickets : []);
    const mutedList = Array.isArray(muted) ? muted : (muted && Array.isArray(muted.players) ? muted.players : []);
    document.getElementById('stat-tickets').textContent = ticketList.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    document.getElementById('stat-muted').textContent = mutedList.length;
}

async function loadNetworkOverviewStatus() {
    const network = await apiCall('/network', 'GET', null, true);
    renderNetworkOverviewStatus(network && network.runtime ? network.runtime : null);
}

function renderNetworkOverviewStatus(runtime) {
    const profileBackend = document.getElementById('stat-network-profile-backend');
    const tokenBackend = document.getElementById('stat-network-token-backend');
    const moderationBackend = document.getElementById('stat-network-moderation-backend');
    const profileMode = document.getElementById('stat-network-profile-mode');
    const tokenMode = document.getElementById('stat-network-token-mode');
    const moderationMode = document.getElementById('stat-network-moderation-mode');

    if (!profileBackend || !tokenBackend || !moderationBackend || !profileMode || !tokenMode || !moderationMode) {
        return;
    }

    if (!runtime) {
        profileBackend.textContent = 'Unavailable';
        tokenBackend.textContent = 'Unavailable';
        moderationBackend.textContent = 'Unavailable';
        profileMode.textContent = 'Network API unavailable';
        tokenMode.textContent = 'Network API unavailable';
        moderationMode.textContent = 'Network API unavailable';
        profileMode.style.color = '#d7ba7d';
        tokenMode.style.color = '#d7ba7d';
        moderationMode.style.color = '#d7ba7d';
        return;
    }

    const profileShared = runtime.profileSharedBackendActive === true;
    const tokenShared = runtime.tokenSharedBackendActive === true;
    const moderationShared = runtime.moderationSharedBackendActive === true;

    profileBackend.textContent = runtime.profileBackend || 'Unavailable';
    tokenBackend.textContent = runtime.tokenBackend || 'Unavailable';
    moderationBackend.textContent = runtime.moderationBackend || 'Unavailable';
    profileMode.textContent = profileShared ? 'Shared backend active' : 'Local fallback active';
    tokenMode.textContent = tokenShared ? 'Shared backend active' : 'Local fallback active';
    moderationMode.textContent = moderationShared ? 'Shared backend active' : 'Local fallback active';
    profileMode.style.color = profileShared ? '#4ec9b0' : '#d7ba7d';
    tokenMode.style.color = tokenShared ? '#4ec9b0' : '#d7ba7d';
    moderationMode.style.color = moderationShared ? '#4ec9b0' : '#d7ba7d';
}



async function broadcast() {
    const msg = document.getElementById('broadcast-msg').value;
    if (!msg) return alert('Enter a message');
    await apiCall('/actions/broadcast', 'POST', { message: msg });
    document.getElementById('broadcast-msg').value = '';
    alert('Broadcast sent!');
}

async function loadPlayers() {
    const response = await apiCall('/players');
    const players = response && response.players ? response.players : [];
    const playerNames = players.map(p => p.name);
    updatePlayerDatalist(playerNames);
    const html = players.length > 0 ? players.map(p => `
        <tr class="${p.punished ? 'punished' : ''}">
            <td>
                <img src="https://mc-heads.net/avatar/${p.name}/32" alt="${p.name}" style="width: 24px; height: 24px; border-radius: 3px; margin-right: 8px; vertical-align: middle; background: #444;">
                <span class="player-status"></span>${p.name}
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="display: inline-block; color: ${p.rankColor || '#d4d4d4'}; font-weight: 600;">${p.rank || 'Unranked'}</span>
                    <span style="color: #969696; font-size: 12px;">${p.discord ? p.discord : 'Discord not linked'}</span>
                </div>
            </td>
            <td>${p.health}/20</td>
            <td>${p.world} (${p.x}, ${p.y}, ${p.z})</td>
            <td>${p.warnings || 0}</td>
            <td>${p.playtime || 0} h</td>
            <td>${p.punished ? '⏸️ Punished' : '✅ OK'}</td>
            <td>
                <button onclick="kickPlayer('${p.name}')" style="padding: 4px 8px; font-size: 11px;">Kick</button>
                <button onclick="healPlayer('${p.name}')" style="padding: 4px 8px; font-size: 11px;">Heal</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="8">No players online</td></tr>';
    document.getElementById('players-list').innerHTML = html;
}

function updatePlayerDatalist(playerNames) {
    const datalist = document.getElementById('players-datalist');
    if (!datalist) {
        console.error('Datalist element not found');
        return;
    }
    if (!playerNames || playerNames.length === 0) {
        console.warn('No player names to add to datalist');
        return;
    }
    datalist.innerHTML = playerNames.map(name => `<option value="${name}">`).join('');
    console.log('Updated datalist with players:', playerNames);
}

function filterPlayers() {
    const search = document.getElementById('player-search').value.toLowerCase();
    document.querySelectorAll('#players-list tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(search) ? '' : 'none';
    });
}

async function kickPlayer(player) {
    await apiCall('/actions/kick', 'POST', { player });
    loadPlayers();
}

async function healPlayer(player) {
    await apiCall('/actions/heal', 'POST', { player });
    loadPlayers();
}

async function loadTickets() {
    const statusFilter = document.getElementById('ticket-status-filter')?.value || '';
    const priorityFilter = document.getElementById('ticket-priority-filter')?.value || '';
    const url = '/tickets' + (statusFilter || priorityFilter ? '?' + new URLSearchParams({
        status: statusFilter, priority: priorityFilter
    }) : '');
    const tickets = await apiCall(url);
    
    const getPriorityColor = (p) => {
        const colors = { critical: '#F44336', high: '#FF9800', medium: '#FFC107', low: '#4CAF50' };
        return colors[p] || '#999';
    };
    
    const getCategoryLabel = (c) => {
        const labels = { bug: 'Bug', griefing: 'Griefing', chat: 'Chat', item_loss: 'Item Loss', pvp: 'PvP', other: 'Other' };
        return labels[c] || 'Unknown';
    };
    
    const getStatusBadge = (s) => {
        const colors = { open: '#FF9800', in_progress: '#2196F3', resolved: '#4CAF50', closed: '#666' };
        return `<span style="background: ${colors[s] || '#999'}; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${s}</span>`;
    };

    const html = tickets ? tickets.map(t => `
        <tr onclick="openTicketModal(${t.id})" style="cursor: pointer;">
            <td>${t.id}</td>
            <td>${t.player}</td>
            <td><span style="background: ${getPriorityColor(t.priority)}; padding: 2px 6px; border-radius: 3px; font-size: 11px; color: white;">${t.priority}</span></td>
            <td>${getCategoryLabel(t.category)}</td>
            <td>${getStatusBadge(t.status)}</td>
            <td>${t.assignee || '<span style="color:#666">—</span>'}</td>
            <td>${t.message.substring(0, 40)}${t.message.length > 40 ? '...' : ''}</td>
            <td>${t.time}</td>
            <td onclick="event.stopPropagation();"><button onclick="closeTicket(${t.id})" style="padding: 4px 8px; font-size: 11px; background: #388e3c;">Close</button></td>
        </tr>
    `).join('') : '<tr><td colspan="9">No tickets</td></tr>';
    document.getElementById('tickets-list').innerHTML = html;
}

async function openTicketModal(ticketId) {
    const ticket = await apiCall(`/ticket/${ticketId}`);
    if (!ticket) return alert('Ticket not found');
    
    document.getElementById('modal-ticket-id').textContent = `Ticket #${ticket.id}`;
    document.getElementById('modal-player').textContent = ticket.player;
    document.getElementById('modal-message').textContent = ticket.message;
    document.getElementById('modal-status').value = ticket.status;
    document.getElementById('modal-priority').value = ticket.priority;
    document.getElementById('modal-category').value = ticket.category;
    document.getElementById('modal-assignee').value = ticket.assignee || '';
    document.getElementById('modal-resolution-reason').value = ticket.resolution || '';
    
    // Show location if available
    const locRow = document.getElementById('modal-location-row');
    if (ticket.location) {
        locRow.style.display = '';
        document.getElementById('modal-location').textContent = `${ticket.location.world} (${ticket.location.x}, ${ticket.location.y}, ${ticket.location.z})`;
    } else {
        locRow.style.display = 'none';
    }
    
    window.currentTicketId = ticketId;
    
    const responsesHtml = ticket.responses && ticket.responses.length > 0 ?
        ticket.responses.map(r => `
            <div style="background: #2a2a2a; padding: 8px; margin-bottom: 8px; border-left: 3px solid #2196F3; border-radius: 3px;">
                <strong>${r.admin}</strong> <span style="color: #999; font-size: 11px;">${r.timestamp}</span><br>
                <span style="color: #bbb;">${r.message}</span>
            </div>
        `).join('') :
        '<p style="color: #999;">No responses yet</p>';
    
    document.getElementById('modal-responses').innerHTML = responsesHtml;
    document.getElementById('modal-response-text').value = '';
    
    document.getElementById('ticket-modal').style.display = 'block';
}

async function updateTicketFields() {
    const ticketId = window.currentTicketId;
    const priority = document.getElementById('modal-priority').value;
    const category = document.getElementById('modal-category').value;
    const status = document.getElementById('modal-status').value;
    const assignee = document.getElementById('modal-assignee').value;

    if (!ticketId) {
        return alert('No ticket selected.');
    }

    const result = await apiCall(`/ticket/${ticketId}`, 'PATCH', { priority, category, status, assignee });
    if (!result) {
        return alert('Failed to update ticket.');
    }

    loadTickets();
    document.getElementById('ticket-modal').style.display = 'none';
}

async function addTicketResponse() {
    const ticketId = window.currentTicketId;
    const message = document.getElementById('modal-response-text').value;
    if (!message) return alert('Enter a response');
    
    const admin = document.getElementById('modal-admin-name').value || 'Admin';
    
    await apiCall(`/ticket/${ticketId}/response`, 'POST', { admin, message });
    document.getElementById('modal-response-text').value = '';
    openTicketModal(ticketId);
}

async function resolveTicket() {
    const ticketId = window.currentTicketId;
    const reason = document.getElementById('modal-resolution-reason').value;
    
    if (!reason) return alert('Select a resolution reason');
    
    await apiCall(`/ticket/${ticketId}/resolve`, 'POST', { reason });
    document.getElementById('ticket-modal').style.display = 'none';
    loadTickets();
}

async function closeTicket(id) {
    await apiCall(`/ticket/close/${id}`, 'POST');
    loadTickets();
}

async function addNote() {
    const player = document.getElementById('note-player').value;
    const text = document.getElementById('note-text').value;
    const category = document.getElementById('note-category').value;
    if (!player || !text) return alert('Fill in player name and note content');
    await apiCall('/actions/addnote', 'POST', { player, note: text, category });
    document.getElementById('note-text').value = '';
    alert('Note added!');
    const searchPlayer = document.getElementById('note-search-player').value;
    if (searchPlayer && searchPlayer.toLowerCase() === player.toLowerCase()) searchNotes();
}

async function loadAllNotes() {
    const players = await apiCall('/notes');
    if (!players || !players.length) {
        document.getElementById('notes-summary').style.display = 'none';
        document.getElementById('notes-display').innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No player notes found</p>';
        return;
    }
    const summaryHtml = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 20px;">
            ${players.map(p => `
                <div onclick="document.getElementById('note-search-player').value='${p.player}';searchNotes();" 
                     style="background: #2d2d30; padding: 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; border-left: 3px solid #4ec9b0; display: flex; align-items: center; gap: 10px;"
                     onmouseover="this.style.background='#3a3a40';this.style.transform='translateY(-2px)'" 
                     onmouseout="this.style.background='#2d2d30';this.style.transform='none'">
                    <img src="https://mc-heads.net/avatar/${encodeURIComponent(p.player)}/32" style="width:32px;height:32px;border-radius:4px;" onerror="this.style.display='none'">
                    <div>
                        <div style="color: #4ec9b0; font-weight: bold;">${p.player}</div>
                        <div style="color: #999; font-size: 11px;">${p.count} note${p.count !== 1 ? 's' : ''} · ${p.lastUpdated}</div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    document.getElementById('notes-summary').style.display = 'block';
    document.getElementById('notes-summary').innerHTML = summaryHtml;
    document.getElementById('notes-display').innerHTML = '';
}

function getCategoryStyle(cat) {
    const c = (cat || 'INFO').toUpperCase();
    if (c === 'WARNING') return { color: '#ff9800', bg: '#3d2e00', icon: '⚠️', border: '#ff9800' };
    if (c === 'IMPORTANT') return { color: '#f44336', bg: '#3d0000', icon: '❗', border: '#f44336' };
    if (c === 'POSITIVE') return { color: '#4caf50', bg: '#003d00', icon: '✅', border: '#4caf50' };
    return { color: '#4ec9b0', bg: '#002d26', icon: 'ℹ️', border: '#4ec9b0' };
}

async function searchNotes() {
    const player = document.getElementById('note-search-player').value;
    if (!player) { document.getElementById('notes-display').innerHTML = ''; return; }
    document.getElementById('notes-summary').style.display = 'none';
    const notes = await apiCall('/notes', 'GET', { player });
    
    if (!notes || !notes.length) {
        document.getElementById('notes-display').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <img src="https://mc-heads.net/avatar/${encodeURIComponent(player)}/48" style="width:48px;height:48px;border-radius:6px;margin-bottom:10px;" onerror="this.style.display='none'">
                <p>No notes found for <strong style="color: #4ec9b0;"></strong></p>
            </div>`;
        return;
    }
    
    const html = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; padding: 10px; background: #252526; border-radius: 6px;">
            <img src="https://mc-heads.net/avatar/${encodeURIComponent(player)}/40" style="width:40px;height:40px;border-radius:6px;" onerror="this.style.display='none'">
            <div>
                <div style="color: #4ec9b0; font-weight: bold; font-size: 16px;">${player}</div>
                <div style="color: #999; font-size: 12px;">${notes.length} note${notes.length !== 1 ? 's' : ''}</div>
            </div>
        </div>
        ${notes.map(n => {
            const s = getCategoryStyle(n.category);
            return `
            <div class="note-card" data-player="${player}" data-index="${n.index}" 
                 style="background: ${s.bg}; padding: 14px; margin: 8px 0; border-radius: 6px; border-left: 4px solid ${s.border}; transition: all 0.2s;"
                 onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="color: ${s.color}; font-weight: bold; font-size: 12px;">${s.icon} ${n.category || 'INFO'}</span>
                    <span style="color: #777; font-size: 11px;">${n.timestamp || ''}</span>
                </div>
                <p style="margin: 0; color: #ddd; line-height: 1.5;">${n.text}</p>
                <div style="margin-top: 8px; display: flex; gap: 8px;">
                    <span style="color: #999; font-size: 11px; cursor: pointer; text-decoration: underline;" onclick="openNoteModal('${player}', ${n.index})">Edit</span>
                    <span style="color: #d32f2f; font-size: 11px; cursor: pointer; text-decoration: underline;" onclick="quickDeleteNote('${player}', ${n.index})">Delete</span>
                </div>
            </div>`;
        }).join('')}`;
    document.getElementById('notes-display').innerHTML = html;
}

async function quickDeleteNote(player, index) {
    if (!confirm('Delete this note?')) return;
    await apiCall(`/note/${player}/${index}`, 'DELETE');
    searchNotes();
}

async function openNoteModal(player, index) {
    document.getElementById('modal-note-player').textContent = player;
    const notes = await apiCall('/notes', 'GET', { player });
    if (!notes || !notes[index]) return alert('Note not found');
    document.getElementById('modal-note-text').value = notes[index].text;
    window.currentNotePlayer = player;
    window.currentNoteIndex = index;
    document.getElementById('note-modal').style.display = 'block';
}

async function saveNoteEdit() {
    const player = window.currentNotePlayer;
    const index = window.currentNoteIndex;
    const newText = document.getElementById('modal-note-text').value;
    if (!newText) return alert('Note cannot be empty');
    const params = new URLSearchParams({ text: newText });
    await apiCall(`/note/${player}/${index}?${params}`, 'PATCH');
    document.getElementById('note-modal').style.display = 'none';
    searchNotes();
}

async function deleteNoteFromModal() {
    const player = window.currentNotePlayer;
    const index = window.currentNoteIndex;
    if (!confirm('Are you sure you want to delete this note?')) return;
    await apiCall(`/note/${player}/${index}`, 'DELETE');
    document.getElementById('note-modal').style.display = 'none';
    searchNotes();
}

async function loadHistory() {
    const history = await apiCall('/history');
    const html = history ? history.map(h => `
        <tr>
            <td>${h.timestamp}</td>
            <td>${h.admin}</td>
            <td>${h.action}</td>
            <td>${h.target}</td>
        </tr>
    `).join('') : '<tr><td colspan="4">No history</td></tr>';
    document.getElementById('history-list').innerHTML = html;
}

function getChatAvatar(player) {
    const name = (player || '').toLowerCase();
    if (name === 'system') return '<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:#d32f2f;border-radius:4px;font-size:14px;vertical-align:middle;margin-right:6px;">⚙️</span>';
    if (name === 'webapp' || name === 'web') return '<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;background:#0e639c;border-radius:4px;font-size:14px;vertical-align:middle;margin-right:6px;">🌐</span>';
    return `<img src="https://mc-heads.net/avatar/${encodeURIComponent(player)}/24" style="width:24px;height:24px;border-radius:4px;vertical-align:middle;margin-right:6px;" onerror="this.style.display='none'">`;
}

async function refreshChat() {
    const chat = await apiCall('/chat');
    const html = (chat || []).map(c => {
        const avatar = getChatAvatar(c.player);
        return `<div style="padding: 8px; border-bottom: 1px solid #444; display: flex; align-items: center;">
            
            <span style="color: #999; font-size: 11px; margin-right: 8px; white-space: nowrap;">${c.timestamp || ''}</span>
            <strong style="color: #4ec9b0; margin-right: 6px; white-space: nowrap;">${c.player || 'Unknown'}:</strong>
            <span style="color: #ccc;">${c.message || ''}</span>
        </div>`;
    }).join('');
    const chatDisplay = document.getElementById('chat-display');
    chatDisplay.innerHTML = html || '<div style="padding: 8px; color: #999;">No chat messages yet</div>';
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

async function banPlayer() {
    const player = document.getElementById('mod-ban-player').value;
    const reason = document.getElementById('mod-ban-reason').value;
    if (!player) return alert('Enter player name');
    await apiCall('/actions/ban', 'POST', { player, reason: reason || 'No reason' });
    document.getElementById('mod-ban-player').value = '';
    document.getElementById('mod-ban-reason').value = '';
    alert('Player banned!');
    loadBanned();
}

async function warnPlayer() {
    const player = document.getElementById('mod-warn-player').value;
    const reason = document.getElementById('mod-warn-reason').value;
    if (!player) return alert('Enter player name');
    await apiCall('/actions/warn', 'POST', { player, reason: reason || 'No reason' });
    document.getElementById('mod-warn-player').value = '';
    document.getElementById('mod-warn-reason').value = '';
    alert('Player warned!');
}

async function punishPlayer(minutes, inputId, reasonInputId) {
    const playerInput = inputId ? document.getElementById(inputId) : document.getElementById(`mod-punish${minutes/60}h-player`);
    const reasonInput = reasonInputId ? document.getElementById(reasonInputId) : null;
    if (!playerInput) return alert('Input field not found');
    const player = playerInput.value;
    const reason = reasonInput ? reasonInput.value : 'No reason provided';
    if (!player) return alert('Enter player name');
    await apiCall('/actions/punish', 'POST', { player, minutes, reason });
    setCachedPunishment(player, reason, minutes);
    playerInput.value = '';
    if (reasonInput) reasonInput.value = '';
    alert('Player punished!');
}

async function loadBanned() {
    const banned = await apiCall('/banned');
    const html = banned ? banned.map(b => `
        <tr>
            <td>${b}</td>
            <td>N/A</td>
            <td><button onclick="unbanPlayer('${b}')" style="padding: 4px 8px; font-size: 11px;" class="btn-success">Unban</button></td>
        </tr>
    `).join('') : '<tr><td colspan="3">No banned players</td></tr>';
    document.getElementById('banned-list').innerHTML = html;
}

async function unbanPlayer(player) {
    await apiCall('/actions/unban', 'POST', { player });
    loadBanned();
}

async function addToWhitelist() {
    const player = document.getElementById('whitelist-player').value;
    if (!player) return alert('Enter player name');
    await apiCall('/whitelist/add', 'POST', { player });
    document.getElementById('whitelist-player').value = '';
    alert('Added to whitelist!');
    loadWhitelist();
}

async function loadWhitelist() {
    const whitelist = await apiCall('/whitelist');
    const html = whitelist ? whitelist.map(p => `
        <tr>
            <td>${p}</td>
            <td><button onclick="removeFromWhitelist('${p}')" style="padding: 4px 8px; font-size: 11px;" class="btn-danger">Remove</button></td>
        </tr>
    `).join('') : '<tr><td colspan="2">Whitelist empty</td></tr>';
    document.getElementById('whitelist-list').innerHTML = html;
}

async function removeFromWhitelist(player) {
    await apiCall('/whitelist/remove', 'POST', { player });
    loadWhitelist();
}

async function mutePlayer() {
    const player = document.getElementById('mute-player').value;
    const reason = document.getElementById('mute-reason').value;
    if (!player) return alert('Enter player name');
    await apiCall('/mute', 'POST', { player, reason: reason || 'No reason' });
    document.getElementById('mute-player').value = '';
    document.getElementById('mute-reason').value = '';
    alert('Player muted!');
    loadMuted();
}

async function loadMuted() {
    const muted = await apiCall('/muted');
    const html = muted && muted.length ? muted.map(m => `
            <tr>
                <td>${m.name || 'Unknown'}</td>
                <td>${m.reason || 'No reason'}</td>
                <td><button onclick="unmutePlayer('${m.name}')" style="padding: 4px 8px; font-size: 11px;" class="btn-success">Unmute</button></td>
            </tr>
        `).join('') : '<tr><td colspan="3">No muted players</td></tr>';
    document.getElementById('muted-list').innerHTML = html;
}

async function unmutePlayer(player) {
    await apiCall('/unmute', 'POST', { player });
    loadMuted();
}

async function searchIPs() {
    const player = document.getElementById('ip-search-player').value;
    if (!player) return alert('Enter player name');
    const ips = await apiCall('/ips', 'GET', { player });
    const html = ips && ips.length ? ips.map(ip => `<div style="background: #2d2d30; padding: 10px; margin: 5px 0; border-radius: 4px;">${ip}</div>`).join('') : 'No IPs recorded';
    document.getElementById('ips-display').innerHTML = html;
}

async function searchSessions() {
    const player = document.getElementById('session-search-player').value;
    if (!player) return alert('Enter player name');
    const sessions = await apiCall('/sessions', 'GET', { player });
    const html = sessions && sessions.length ? sessions.map(s => `<div style="background: #2d2d30; padding: 10px; margin: 5px 0; border-radius: 4px;">${s}</div>`).join('') : 'No sessions found';
    document.getElementById('sessions-display').innerHTML = html;
}

async function saveTemplate() {
    const name = document.getElementById('template-name').value;
    const content = document.getElementById('template-content').value;
    if (!name || !content) return alert('Fill in all fields');
    await apiCall('/template/save', 'POST', { name, content });
    document.getElementById('template-name').value = '';
    document.getElementById('template-content').value = '';
    alert('Template saved!');
    loadTemplates();
}

async function loadTemplates() {
    const templates = await apiCall('/templates');
    let html = '';
    if (templates && Object.keys(templates).length > 0) {
        html = Object.entries(templates).map(([name, content]) => `
            <div style="background: #2d2d30; padding: 15px; margin: 10px 0; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin-bottom: 5px;">${name}</h4>
                    <p style="color: #ccc;">${content}</p>
                </div>
                <div style="display: flex; gap: 5px; flex-shrink: 0;">
                    <button onclick="useTemplate('${content.replace(/'/g, "\'")}')" class="btn-success" style="padding: 6px 12px; font-size: 11px;">📋 Use</button>
                    <button onclick="deleteTemplate('${name.replace(/'/g, "\'")}')" class="btn-danger" style="padding: 6px 12px; font-size: 11px;">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    } else {
        html = 'No templates saved';
    }
    document.getElementById('templates-list').innerHTML = html;
}

function useTemplate(content) {
    navigator.clipboard.writeText(content).then(() => {
        alert('Template copied to clipboard!');
    }).catch(() => {
        // Fallback: fill into broadcast field if clipboard fails
        const broadcastField = document.getElementById('broadcast-msg');
        if (broadcastField) broadcastField.value = content;
        alert('Template pasted into broadcast field!');
    });
}

async function deleteTemplate(name) {
    if (!confirm('Delete template "' + name + '"?')) return;
    try {
        const url = `${API_URL}/template/delete`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        loadTemplates();
    } catch (e) { console.error('Error deleting template:', e); }
}

async function loadWorlds() {
    const worlds = await apiCall('/worlds');
    const html = worlds ? worlds.map(w => `
        <tr>
            <td>${w.name}</td>
            <td>${w.players}</td>
            <td>${w.environment}</td>
            <td>${w.difficulty}</td>
        </tr>
    `).join('') : '<tr><td colspan="4">No worlds</td></tr>';
    document.getElementById('worlds-list').innerHTML = html;
}

async function loadPlugins() {
    const plugins = await apiCall('/plugins');
    const html = plugins ? plugins.map(p => {
        const parts = p.split(' v');
        return `<tr><td>${parts[0]}</td><td>${parts[1] || 'Unknown'}</td></tr>`;
    }).join('') : '<tr><td colspan="2">No plugins</td></tr>';
    document.getElementById('plugins-list').innerHTML = html;
}

async function loadGameRules() {
    const rules = await apiCall('/gamerules');
    if (rules) {
        document.getElementById('gamerule-pvp').textContent = rules.pvp ? '✅ Enabled' : '❌ Disabled';
        document.getElementById('gamerule-difficulty').textContent = rules.difficulty || 'Unknown';
    }
}

async function setGameRule(rule, value) {
    await apiCall('/gamerule', 'POST', { rule, value });
    loadGameRules();
}

async function executeBulkAction() {
    const players = document.getElementById('bulk-players').value;
    const action = document.getElementById('bulk-action').value;
    const reason = document.getElementById('bulk-reason').value;
    if (!players) return alert('Enter player list');
    
    const response = await apiCall('/bulk', 'POST', { players, action, reason: reason || 'Bulk action' });
    if (response === 'OK' || (response && !response.error)) {
        alert('Bulk action executed successfully!');
        document.getElementById('bulk-players').value = '';
        document.getElementById('bulk-reason').value = '';
    } else {
        alert('Failed to execute bulk action. Check server console.');
    }
}

async function submitReport() {
    const reporter = document.getElementById('report-reporter').value;
    const reported = document.getElementById('report-reported').value;
    const reason = document.getElementById('report-reason').value;
    if (!reporter || !reported || !reason) return alert('Fill in all fields');
    await apiCall('/report', 'POST', { reporter, reported, reason });
    document.getElementById('report-reporter').value = '';
    document.getElementById('report-reported').value = '';
    document.getElementById('report-reason').value = '';
    alert('Report submitted!');
    loadReports();
}

async function loadReports() {
    const reports = await apiCall('/reports');
    const html = reports ? reports.map(r => `<div style="background: #2d2d30; padding: 10px; margin: 5px 0; border-radius: 4px;">${r}</div>`).join('') : 'No reports';
    document.getElementById('reports-display').innerHTML = html;
}

async function scheduleRestart() {
    const delay = document.getElementById('restart-delay').value;
    if (!delay) return alert('Enter delay');
    await apiCall('/restart', 'POST', { delay });
    document.getElementById('restart-status').textContent = `Restart scheduled in ${delay} minutes!`;
}

async function triggerBackup() {
    await apiCall('/backup', 'POST');
    document.getElementById('backup-status').textContent = 'Backup triggered!';
}

async function executeCommand() {
    const cmd = document.getElementById('console-cmd').value;
    if (!cmd) return;
    await apiCall('/command', 'POST', { command: cmd });
    document.getElementById('console-cmd').value = '';
    document.getElementById('console-output').innerHTML += `<div>&gt; ${cmd}</div>`;
}

// --- OVERVIEW MAP FUNCTIONS ---
let overviewMapCanvas, overviewMapCtx, overviewMapPlayers = [];
const overviewMapScale = 0.5; // pixels per block

function initOverviewMap() {
    overviewMapCanvas = document.getElementById('overview-map-canvas');
    if (!overviewMapCanvas) return;
    
    overviewMapCtx = overviewMapCanvas.getContext('2d');
    
    // Get dimensions from the element's computed size
    const rect = overviewMapCanvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 500;
    const height = rect.height > 0 ? rect.height : 300;
    
    // Set canvas resolution (in pixels)
    overviewMapCanvas.width = width;
    overviewMapCanvas.height = height;
    
    drawOverviewMap();
}

function drawOverviewMap() {
    if (!overviewMapCanvas || !overviewMapCtx) return;
    
    // Clear canvas
    overviewMapCtx.fillStyle = '#1a1a1a';
    overviewMapCtx.fillRect(0, 0, overviewMapCanvas.width, overviewMapCanvas.height);
    
    if (overviewMapPlayers.length === 0) {
        overviewMapCtx.fillStyle = '#666';
        overviewMapCtx.font = '14px monospace';
        overviewMapCtx.textAlign = 'center';
        overviewMapCtx.fillText('No players online', overviewMapCanvas.width / 2, overviewMapCanvas.height / 2);
        return;
    }
    
    // Calculate bounds
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    overviewMapPlayers.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minZ = Math.min(minZ, p.z);
        maxZ = Math.max(maxZ, p.z);
    });
    
    // Add padding
    const padding = 50;
    const worldWidth = Math.max(maxX - minX, 100);
    const worldHeight = Math.max(maxZ - minZ, 100);
    const scaleX = (overviewMapCanvas.width - padding * 2) / worldWidth;
    const scaleY = (overviewMapCanvas.height - padding * 2) / worldHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Draw grid
    overviewMapCtx.strokeStyle = 'rgba(62, 62, 66, 0.3)';
    overviewMapCtx.lineWidth = 0.5;
    const gridSpacing = 100 * scale;
    for (let i = padding; i < overviewMapCanvas.width; i += gridSpacing) {
        overviewMapCtx.beginPath();
        overviewMapCtx.moveTo(i, 0);
        overviewMapCtx.lineTo(i, overviewMapCanvas.height);
        overviewMapCtx.stroke();
    }
    for (let i = padding; i < overviewMapCanvas.height; i += gridSpacing) {
        overviewMapCtx.beginPath();
        overviewMapCtx.moveTo(0, i);
        overviewMapCtx.lineTo(overviewMapCanvas.width, i);
        overviewMapCtx.stroke();
    }
    
    // Draw players
    overviewMapPlayers.forEach(p => {
        const canvasX = padding + (p.x - minX) * scale;
        const canvasY = padding + (p.z - minZ) * scale;
        
        // Player marker
        const rankColor = (p.rank && p.rank.color) ? p.rank.color : '#0e639c';
        overviewMapCtx.fillStyle = rankColor;
        overviewMapCtx.beginPath();
        overviewMapCtx.arc(canvasX, canvasY, 6, 0, Math.PI * 2);
        overviewMapCtx.fill();
        
        // Player name
        overviewMapCtx.fillStyle = '#4ec9b0';
        overviewMapCtx.font = '10px monospace';
        overviewMapCtx.textAlign = 'center';
        overviewMapCtx.textBaseline = 'top';
        overviewMapCtx.fillText(p.name, canvasX, canvasY + 10);
    });
}

// --- LIVE MAP FUNCTIONS ---
let mapCanvas, mapCtx, mapPlayers = [], mapZoom = 1, mapOffset = { x: 0, y: 0 }, mapRefreshInterval;
const mapScale = 1; // pixels per block at zoom 1x
const mapCenterX = () => mapCanvas.width / 2;
const mapCenterY = () => mapCanvas.height / 2;
let playerHeadCache = {};
let cachedWorldMap = null;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragDistance = 0;

async function initMap() {
    mapCanvas = document.getElementById('map-canvas');
    mapCtx = mapCanvas.getContext('2d');
    
    // Set canvas to fill container
    const container = mapCanvas.parentElement;
    mapCanvas.width = container.clientWidth - 4;
    mapCanvas.height = container.clientHeight - 90; // Account for controls
    
    // Make canvas fill remaining space
    mapCanvas.style.width = '100%';
    mapCanvas.style.height = (container.clientHeight - 90) + 'px';
    
    // Add mouse drag listeners
    mapCanvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragDistance = 0;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        mapCanvas.style.cursor = 'grabbing';
    });
    
    mapCanvas.addEventListener('mousemove', (e) => {
        if (!isDragging) {
            mapCanvas.style.cursor = 'grab';
            return;
        }
        
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Update map offset (inverted so dragging right moves view left)
        mapOffset.x -= deltaX / (mapZoom * mapScale);
        mapOffset.y -= deltaY / (mapZoom * mapScale);
        
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        
        drawMap();
    });
    
    mapCanvas.addEventListener('mouseup', () => {
        isDragging = false;
        mapCanvas.style.cursor = 'grab';
    });
    
    mapCanvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    // Setup world filter dropdown
    const worldSelect = document.getElementById('map-world-filter');
    worldSelect.innerHTML = '<option value="">All Worlds</option>';
    
    const response = await apiCall('/players');
    if (response && response.players) {
        const worlds = [...new Set(response.players.map(p => p.world))].sort();
        worlds.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            worldSelect.appendChild(opt);
        });
    }

    // Clear old interval
    if (mapRefreshInterval) clearInterval(mapRefreshInterval);
    
    // Initial map draw and auto-refresh
    updateMap();
    mapRefreshInterval = setInterval(updateMap, 1500);
}

async function updateMap() {
    try {
        const worldFilter = document.getElementById('map-world-filter')?.value || '';
        const response = await apiCall('/players');
        console.log('Players API response:', response);
        
        let players = response && response.players ? response.players : [];
        console.log('All players:', players);
        
        if (worldFilter) {
            players = players.filter(p => p.world === worldFilter);
        }
        mapPlayers = players;

        // Update player count
        document.getElementById('map-player-count').textContent = players.length;

        // Populate player sidebar
        const playerListHtml = players.length ? players.map(p => {
            const rankColor = (p.rank && p.rank.color) ? p.rank.color : '#0e639c';
            const rankName = (p.rank && p.rank.name) ? p.rank.name : 'Player';
            return `
                <div onclick="centerOnPlayer('${p.name}', ${p.x}, ${p.z})" 
                     style="padding: 12px; margin-bottom: 8px; background: #2d2d30; border-left: 4px solid ; cursor: pointer; border-radius: 3px; transition: all 0.2s; user-select: none;"
                     onmouseover="this.style.background='#3e3e42'" onmouseout="this.style.background='#2d2d30'">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <div style="width: 32px; height: 32px; background: #3e3e42; border-radius: 3px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <img src="https://mc-heads.net/avatar/${p.name}/32" style="width: 32px; height: 32px; border-radius: 2px;" onerror="this.style.display='none'">
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: #e0e0e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                            <div style="font-size: 11px; color: #969696;"></div>
                        </div>
                    </div>
                    <div style="font-size: 11px; color: #969696; line-height: 1.3;">
                        <div>📍 [${Math.round(p.x)}, ${Math.round(p.z)}]</div>
                        <div>🌍 ${p.world}</div>
                    </div>
                </div>
            `;
        }).join('') : '<div style="padding: 12px; color: #969696; text-align: center; font-size: 12px;">No players online</div>';
        
        document.getElementById('map-players-list').innerHTML = playerListHtml;
        document.getElementById('map-player-info').textContent = players.length + ' player' + (players.length !== 1 ? 's' : '');

        // Determine which world to show map for
        let mapWorld = worldFilter;
        if (!mapWorld && players.length > 0) {
            mapWorld = players[0].world; // Use first player's world
        } else if (!mapWorld) {
            mapWorld = 'world'; // Default to main world
        }

        // Fetch world map data (optional - don't block on failure)
        try {
            const mapData = await apiCall('/worldmap', 'GET', { 
                world: mapWorld, 
                x: Math.round(mapOffset.x), 
                z: Math.round(mapOffset.y), 
                size: 256 
            });
            if (mapData && !mapData.error) {
                cachedWorldMap = mapData;
                console.log('World map loaded for', mapWorld);
            }
        } catch (e) {
            console.log('World map failed, continuing without it:', e);
        }
        
        drawMap();
    } catch (e) {
        console.error('updateMap error:', e);
        document.getElementById('map-players-list').innerHTML = '<div style="padding: 12px; color: #d32f2f;">Error loading players</div>';
    }
}

function worldToCanvas(x, z) {
    // Calculate distance from center
    const canvasX = mapCenterX() + (x - mapOffset.x) * mapZoom * mapScale;
    const canvasY = mapCenterY() + (z - mapOffset.y) * mapZoom * mapScale;
    return { x: canvasX, y: canvasY };
}

function drawMap() {
    if (!mapCanvas || !mapCtx) {
        console.log('Canvas not initialized yet');
        return;
    }

    // Clear canvas
    mapCtx.fillStyle = '#1a1a1a';
    mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

    // Draw world blocks if available
    if (cachedWorldMap && cachedWorldMap.grid) {
        const blockSize = 4 * mapZoom; // Block size scales with zoom
        const grid = cachedWorldMap.grid;
        
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const canvasX = (col - grid[row].length/2) * blockSize + mapCenterX();
                const canvasY = (row - grid.length/2) * blockSize + mapCenterY();
                
                if (canvasX > -blockSize && canvasX < mapCanvas.width && 
                    canvasY > -blockSize && canvasY < mapCanvas.height) {
                    mapCtx.fillStyle = grid[row][col];
                    mapCtx.fillRect(canvasX, canvasY, blockSize, blockSize);
                }
            }
        }
    }

    // Draw grid overlay
    const gridSpacing = 100 * mapZoom * mapScale;
    mapCtx.strokeStyle = 'rgba(62, 62, 66, 0.4)';
    mapCtx.lineWidth = 0.5;

    for (let i = Math.floor(-mapCenterX() / gridSpacing) * gridSpacing; i < mapCanvas.width + gridSpacing; i += gridSpacing) {
        mapCtx.beginPath();
        mapCtx.moveTo(i, 0);
        mapCtx.lineTo(i, mapCanvas.height);
        mapCtx.stroke();
    }

    for (let i = Math.floor(-mapCenterY() / gridSpacing) * gridSpacing; i < mapCanvas.height + gridSpacing; i += gridSpacing) {
        mapCtx.beginPath();
        mapCtx.moveTo(0, i);
        mapCtx.lineTo(mapCanvas.width, i);
        mapCtx.stroke();
    }

    // Draw axis labels
    mapCtx.fillStyle = '#969696';
    mapCtx.font = '11px monospace';
    mapCtx.textAlign = 'center';
    mapCtx.fillText('X →', mapCanvas.width - 30, 15);
    mapCtx.save();
    mapCtx.translate(15, mapCanvas.height / 2);
    mapCtx.rotate(-Math.PI / 2);
    mapCtx.fillText('← Z', 0, 0);
    mapCtx.restore();

    // Draw players
    if (mapPlayers.length === 0) {
        console.log('No players to draw');
        return;
    }

    mapPlayers.forEach(p => {
        try {
            const pos = worldToCanvas(p.x, p.z);

            // Draw rank-colored marker circle
            const rankColor = (p.rank && p.rank.color) ? p.rank.color : '#0e639c';
            mapCtx.fillStyle = rankColor;
            mapCtx.beginPath();
            mapCtx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
            mapCtx.fill();

            // Try to load and draw player head
            const headKey = p.name;
            if (!playerHeadCache[headKey]) {
                playerHeadCache[headKey] = new Image();
                playerHeadCache[headKey].src = `https://mc-heads.net/avatar/${p.name}/32`;
            }

            const img = playerHeadCache[headKey];
            if (img.complete && img.naturalHeight > 0) {
                const size = 20 * mapZoom;
                mapCtx.drawImage(img, pos.x - size/2, pos.y - size/2, size, size);
            } else {
                // Fallback: draw initial
                mapCtx.fillStyle = '#e0e0e0';
                mapCtx.font = 'bold ' + Math.max(9, 12 * mapZoom) + 'px monospace';
                mapCtx.textAlign = 'center';
                mapCtx.textBaseline = 'middle';
                mapCtx.fillText(p.name.charAt(0).toUpperCase(), pos.x, pos.y);
            }

            // Draw player name
            mapCtx.fillStyle = '#4ec9b0';
            mapCtx.font = Math.max(10, 11 * mapZoom) + 'px monospace';
            mapCtx.textAlign = 'center';
            mapCtx.textBaseline = 'top';
            mapCtx.fillText(p.name, pos.x, pos.y + 16 * mapZoom);
        } catch (e) {
            console.log('Error drawing player', p.name, e);
        }
    });

    // Draw active event effects on top
    drawActiveEventEffects();
}

function drawActiveEventEffects() {
    if (!mapCanvas || !mapCtx) return;

    for (const [eventName, isActive] of Object.entries(activeEffects)) {
        if (!isActive) continue;

        if (eventName === 'christmas') {
            drawSnow(mapCtx, mapCanvas, eventName);
        } else if (eventName === 'halloween') {
            drawSpiders(mapCtx, mapCanvas, eventName);
        } else if (eventName === 'newyear') {
            drawFireworks(mapCtx, mapCanvas, eventName);
        } else if (eventName === 'valentine') {
            drawHearts(mapCtx, mapCanvas, eventName);
        } else if (eventName === 'spring') {
            drawPetals(mapCtx, mapCanvas, eventName);
        } else if (eventName === 'summer') {
            drawSunParticles(mapCtx, mapCanvas, eventName);
        }
    }
}

function centerMap() {
    if (mapPlayers.length > 0) {
        const avgX = mapPlayers.reduce((a, p) => a + p.x, 0) / mapPlayers.length;
        const avgZ = mapPlayers.reduce((a, p) => a + p.z, 0) / mapPlayers.length;
        mapOffset.x = avgX;
        mapOffset.y = avgZ;
        updateMap();
    }
}

function centerOnPlayer(playerName, x, z) {
    // Ignore click if user was dragging the map
    if (dragDistance > 5) {
        dragDistance = 0;
        return;
    }
    mapOffset.x = x;
    mapOffset.y = z;
    drawMap();
}

function zoomMap(factor) {
    mapZoom *= factor;
    mapZoom = Math.max(0.5, Math.min(4, mapZoom)); // Clamp between 0.5x and 4x
    document.getElementById('zoom-display').textContent = mapZoom.toFixed(1) + 'x';
    drawMap();
}

function toggleMapSidebar() {
    const sidebar = document.getElementById('map-sidebar');
    const currentTransform = sidebar.style.transform || 'translateX(0)';
    const isVisible = currentTransform === 'translateX(0)' || currentTransform === '';
    sidebar.style.transform = isVisible ? 'translateX(100%)' : 'translateX(0)';
}

setInterval(updateOverview, 30000);
setInterval(() => {
    (async () => {
        const response = await apiCall('/players');
        if (response && response.players && response.players.length > 0) {
            updatePlayerDatalist(response.players.map(p => p.name));
        }
    })();
}, 5000);

// --- NEW FEATURES ---

async function loadPerformance() {
    const perf = await apiCall('/performance');
    if (perf) {
        document.getElementById('stat-tps').textContent = (perf.tps || 20).toFixed(1);
        document.getElementById('stat-memory').textContent = (perf.memory || 0) + '%';
        document.getElementById('stat-playercount').textContent = perf.playercount || 0;
        const hours = Math.floor(perf.uptime / 3600);
        const mins = Math.floor((perf.uptime % 3600) / 60);
        document.getElementById('stat-uptime').textContent = hours + 'h ' + mins + 'm';
        
        const joinHtml = perf.joinHistory ? perf.joinHistory.map(j => 
            `<div style="padding: 8px; border-bottom: 1px solid #444;"><strong>${j.player}</strong> joined at ${j.time}</div>`
        ).join('') : '<div style="color: #999;">No join history</div>';
        document.getElementById('join-history').innerHTML = joinHtml;
    }
}

async function loadBlockLog() {
    const player = document.getElementById('blocklog-player').value;
    const block = document.getElementById('blocklog-block').value;
    const logs = await apiCall('/blocklog', 'GET', { player, block });
    
    const html = logs && logs.length ? logs.map(l => `
        <tr>
            <td>${l.time}</td>
            <td>${l.player}</td>
            <td>${l.action}</td>
            <td>${l.block}</td>
            <td>[${Math.round(l.x)}, ${Math.round(l.y)}, ${Math.round(l.z)}]</td>
        </tr>
    `).join('') : '<tr><td colspan="5">No block changes logged</td></tr>';
    document.getElementById('blocklog-list').innerHTML = html;
}

async function loadReputation() {
    const players = await apiCall('/reputation');
    const html = players && players.length ? players.map(p => `
        <tr>
            <td>${p.name}</td>
            <td><span style="color: ${p.score >= 0 ? '#4ec9b0' : '#d32f2f'};">${p.score}</span></td>
            <td>${p.warnings || 0}</td>
            <td>${p.bans || 0}</td>
            <td>${p.score >= 50 ? '✅ Good' : (p.score <= -50 ? '❌ Bad' : '⚠️ Neutral')}</td>
            <td><button onclick="viewPlayerReputation('${p.name}')" style="padding: 4px 8px; font-size: 11px;">View</button></td>
        </tr>
    `).join('') : '<tr><td colspan="6">No reputation data</td></tr>';
    document.getElementById('reputation-list').innerHTML = html;
}

function searchReputation() {
    const search = document.getElementById('reputation-search').value.toLowerCase();
    document.querySelectorAll('#reputation-list tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(search) ? '' : 'none';
    });
}

async function loadPermissions() {
    try {
        const data = await apiCall('/groups');
        const container = document.getElementById('groups-container');
        const groupSelect = document.getElementById('group-select');
        if (!data || !data.groups || data.groups.length === 0) {
            container.innerHTML = '<p style="color:#888;">No groups created yet.</p>';
            if (groupSelect) groupSelect.innerHTML = '<option value="">Select Group</option>';
            return;
        }
        container.innerHTML = data.groups.map(g => {
            const permsList = g.permissions && g.permissions.length > 0
                ? g.permissions.map(p => `<span style="display:inline-flex;align-items:center;background:#1e1e2e;padding:3px 8px;border-radius:4px;margin:2px;font-size:12px;">${p} <button onclick="removeGroupPermission('${g.name}','${p}')" style="background:none;border:none;color:#e74c3c;cursor:pointer;margin-left:4px;font-size:14px;">&times;</button></span>`).join('')
                : '<span style="color:#888;font-size:12px;">No permissions</span>';
            const membersList = g.members && g.members.length > 0
                ? g.members.map(m => `<span style="display:inline-flex;align-items:center;background:#1e1e2e;padding:3px 8px;border-radius:4px;margin:2px;font-size:12px;">${m.name} <button onclick="removeGroupMember('${g.name}','${m.uuid}')" style="background:none;border:none;color:#e74c3c;cursor:pointer;margin-left:4px;font-size:14px;">&times;</button></span>`).join('')
                : '<span style="color:#888;font-size:12px;">No members</span>';
            return `<div style="background:#1a1a2e;border-left:4px solid ${g.color};border-radius:8px;padding:15px;margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <h3 style="margin:0;color:${g.color};">${g.name}${g.prefix ? ' <span style="font-size:12px;color:#888;">Prefix: ' + g.prefix + '</span>' : ''}</h3>
                    <button onclick="deleteGroup('${g.name}')" class="btn-danger" style="font-size:11px;padding:4px 10px;">🗑️ Delete</button>
                </div>
                <div style="margin-bottom:10px;">
                    <strong style="font-size:13px;">Permissions</strong>
                    <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:2px;">${permsList}</div>
                    <div style="margin-top:8px;display:flex;gap:8px;">
                        <input type="text" placeholder="permission.node" id="add-perm-${g.name}" style="flex:1;padding:6px;font-size:12px;">
                        <button onclick="addGroupPermission('${g.name}')" class="btn-success" style="font-size:11px;padding:4px 10px;">+ Add</button>
                    </div>
                </div>
                <div>
                    <strong style="font-size:13px;">Members</strong>
                    <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:2px;">${membersList}</div>
                    <div style="margin-top:8px;display:flex;gap:8px;">
                        <input type="text" placeholder="Player name..." id="add-member-${g.name}" style="flex:1;padding:6px;font-size:12px;">
                        <button onclick="addGroupMember('${g.name}')" class="btn-success" style="font-size:11px;padding:4px 10px;">+ Add</button>
                    </div>
                </div>
            </div>`;
        }).join('');
        // Update group-select dropdown
        if (groupSelect) {
            groupSelect.innerHTML = '<option value="">Select Group</option>' +
                data.groups.map(g => `<option value="${g.name}">${g.name}</option>`).join('');
        }
    } catch (e) { console.error('Failed to load groups:', e); }
}

async function assignPlayerToGroup() {
    const playerInput = document.getElementById('player-group-assign');
    const groupSelect = document.getElementById('group-select');
    const player = playerInput?.value;
    const group = groupSelect?.value;
    if (!player || !group) return alert('Select player and group');
    
    const res = await apiCall('/groups/members/add', 'POST', { name: group, player });
    if (res && res.success) {
        playerInput.value = '';
        groupSelect.value = '';
    } else {
        alert('Failed to assign player: ' + (res?.error || 'Unknown error'));
    }
    loadPermissions();
}

function getCachedPunishment(player) {
    try { return JSON.parse(localStorage.getItem('punish_cache_' + player)); } catch (e) { return null; }
}

function setCachedPunishment(player, reason, minutes) {
    const data = { reason, end: Date.now() + (minutes * 60000) };
    localStorage.setItem('punish_cache_' + player, JSON.stringify(data));
}

function removeCachedPunishment(player) {
    localStorage.removeItem('punish_cache_' + player);
}

async function loadPunishments() {
    let punishments = await apiCall('/punishments', 'GET', null, true);
    
    // Fallback: If /punishments API is missing (404), check online players
    if (!punishments) {
        const response = await apiCall('/players');
        if (response && response.players) {
            const players = response.players.filter(p => p.punished);
            const activeList = [];

            for (const p of players) {
                const cached = getCachedPunishment(p.name);
                const punishmentEnd = p.punishmentEnd || (cached ? cached.end : null);

                if (punishmentEnd && Date.now() > punishmentEnd) {
                    await apiCall('/actions/unpunish', 'POST', { player: p.name });
                    removeCachedPunishment(p.name);
                } else {
                    activeList.push(p);
                }
            }

            punishments = activeList.map(p => {
                const cached = getCachedPunishment(p.name);
                let endsAt = 'Manual removal required';
                let duration = 'Active';
                const punishmentEnd = p.punishmentEnd || (cached ? cached.end : null);
                
                if (punishmentEnd) {
                    const endDate = new Date(punishmentEnd);
                    endsAt = endDate.toLocaleString();
                    const minutesLeft = Math.max(0, Math.round((endDate - Date.now()) / 60000));
                    duration = `${minutesLeft} min left`;
                }
                return {
                    player: p.name,
                    duration: duration,
                    reason: p.punishmentReason || p.reason || (cached ? cached.reason : 'Unknown (Check logs)'),
                    endsAt: endsAt
                };
            });
        }
    }

    const html = punishments && punishments.length ? punishments.map(p => `
        <tr>
            <td>${p.player}</td>
            <td>${p.duration}${typeof p.duration === 'number' ? ' min' : ''}</td>
            <td>${p.reason}</td>
            <td>${p.endsAt}</td>
            <td><button onclick="removePunishment('${p.player}')" style="padding: 4px 8px; font-size: 11px; background: #d32f2f;">Remove</button></td>
        </tr>
    `).join('') : '<tr><td colspan="5">No active punishments</td></tr>';
    document.getElementById('active-punishments').innerHTML = html;
}

async function createCustomPunishment() {
    const player = document.getElementById('punish-player').value;
    const duration = document.getElementById('punish-duration').value;
    const reason = document.getElementById('punish-reason').value;
    if (!player || !duration) return alert('Fill in all fields');
    await apiCall('/actions/punish', 'POST', { player, minutes: duration, reason });
    setCachedPunishment(player, reason, duration);
    document.getElementById('punish-player').value = '';
    document.getElementById('punish-duration').value = '30';
    document.getElementById('punish-reason').value = '';
    alert('Punishment created!');
    loadPunishments();
}

async function removePunishment(player) {
    if (!confirm('Remove this punishment?')) return;
    await apiCall('/actions/unpunish', 'POST', { player });
    removeCachedPunishment(player);
    loadPunishments();
}

async function loadAFKPlayers() {
    const players = await apiCall('/afk');
    const html = players && players.length ? players.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.idleTime} min</td>
            <td>${p.lastAction}</td>
            <td><button onclick="kickAFKPlayer('${p.name}')" style="padding: 4px 8px; font-size: 11px; background: #ff9800;">Kick</button></td>
        </tr>
    `).join('') : '<tr><td colspan="4">No AFK players</td></tr>';
    document.getElementById('afk-list').innerHTML = html;
}

async function kickAFKPlayer(player) {
    if (!confirm('Kick ' + player + '?')) return;
    await apiCall('/actions/kick', 'POST', { player, reason: 'AFK' });
    alert('Player kicked!');
    loadAFKPlayers();
}

async function saveAFKSettings() {
    const timeout = document.getElementById('afk-timeout').value;
    await apiCall('/afk/settings', 'POST', { timeout });
    alert('AFK settings saved!');
}

async function executeAdvancedSearch() {
    const params = {
        name: document.getElementById('search-name').value,
        playtimeMin: document.getElementById('search-playtime-min').value || 0,
        playtimeMax: document.getElementById('search-playtime-max').value || 999999,
        warnings: document.getElementById('search-warnings').value || 0,
        banned: document.getElementById('search-banned').value || ''
    };
    
    const results = await apiCall('/search', 'GET', params);
    const html = results && results.length ? results.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${(p.playtime || 0).toFixed(1)}h</td>
            <td>${p.warnings || 0}</td>
            <td>${p.reputation || 0}</td>
            <td>${p.banned ? '🚫 Banned' : '✅ OK'}</td>
        </tr>
    `).join('') : '<tr><td colspan="5">No results found</td></tr>';
    document.getElementById('search-results').innerHTML = html;
}

async function loadDiscordSettings() {
    const settings = await apiCall('/discord');
    if (settings) {
        // Webhooks
        document.getElementById('discord-webhook').value = settings.webhook || '';
        document.getElementById('webhook-ban').value = settings.webhook_ban || '';
        document.getElementById('webhook-warn').value = settings.webhook_warn || '';
        document.getElementById('webhook-report').value = settings.webhook_report || '';
        
        // Event toggles
        document.getElementById('discord-bans').checked = settings.bans !== false;
        document.getElementById('discord-warns').checked = settings.warns !== false;
        document.getElementById('discord-reports').checked = settings.reports !== false;
        document.getElementById('discord-joins').checked = settings.joins !== false;
        document.getElementById('discord-leaves').checked = settings.leaves !== false;
        
        // New features
        document.getElementById('discord-deaths').checked = settings.deaths === true;
        document.getElementById('discord-block_logging').checked = settings.block_logging === true;
        document.getElementById('discord-container_logging').checked = settings.container_logging === true;
        document.getElementById('discord-command_logging').checked = settings.command_logging === true;
        document.getElementById('discord-milestone_alerts').checked = settings.milestone_alerts === true;
        document.getElementById('discord-performance_alerts').checked = settings.performance_alerts === true;
        document.getElementById('discord-health_check').checked = settings.health_check === true;
        document.getElementById('discord-daily_summary').checked = settings.daily_summary === true;
        
        // Statistics
        document.getElementById('stat-webhooks-sent').textContent = settings.webhooks_sent || 0;
        document.getElementById('stat-webhooks-failed').textContent = settings.webhooks_failed || 0;
        document.getElementById('stat-joins-today').textContent = settings.joins_today || 0;
        document.getElementById('stat-leaves-today').textContent = settings.leaves_today || 0;
        document.getElementById('stat-bans-today').textContent = settings.bans_today || 0;
        document.getElementById('stat-warns-today').textContent = settings.warns_today || 0;
        document.getElementById('stat-reports-today').textContent = settings.reports_today || 0;
    }
}

async function saveDiscordSettings() {
    const data = {
        webhook: document.getElementById('discord-webhook').value,
        webhook_ban: document.getElementById('webhook-ban').value,
        webhook_warn: document.getElementById('webhook-warn').value,
        webhook_report: document.getElementById('webhook-report').value,
        bans: document.getElementById('discord-bans').checked,
        warns: document.getElementById('discord-warns').checked,
        reports: document.getElementById('discord-reports').checked,
        joins: document.getElementById('discord-joins').checked,
        leaves: document.getElementById('discord-leaves').checked,
        deaths: document.getElementById('discord-deaths').checked,
        block_logging: document.getElementById('discord-block_logging').checked,
        container_logging: document.getElementById('discord-container_logging').checked,
        command_logging: document.getElementById('discord-command_logging').checked,
        milestone_alerts: document.getElementById('discord-milestone_alerts').checked,
        performance_alerts: document.getElementById('discord-performance_alerts').checked,
        health_check: document.getElementById('discord-health_check').checked,
        daily_summary: document.getElementById('discord-daily_summary').checked
    };
    
    const result = await apiCall('/discord', 'POST', data);
    if (result !== null) {
        document.getElementById('discord-status').innerHTML = '<span style="color: #4ec9b0;">✅ All settings saved successfully!</span>';
        setTimeout(() => loadDiscordSettings(), 500);
    } else {
        document.getElementById('discord-status').innerHTML = '<span style="color: #d32f2f;">❌ Failed to save settings</span>';
    }
}

async function testDiscordWebhook() {
    const webhook = document.getElementById('discord-webhook').value;
    if (!webhook) return alert('Enter webhook URL');
    const result = await apiCall('/discord/test', 'POST', { webhook });
    if (result.success) {
        document.getElementById('discord-status').innerHTML = '<span style="color: #4ec9b0;">✅ Webhook working! Check Discord.</span>';
    } else {
        document.getElementById('discord-status').innerHTML = '<span style="color: #d32f2f;">❌ Webhook test failed: ' + (result.error || 'Unknown error') + '</span>';
    }
}

// --- KITS ---
async function loadKits() {
    const data = await apiCall('/kits');
    if (!data || !data.kits) return;
    let html = '';
    for (const kit of data.kits) {
        const cooldownStr = kit.cooldown > 0 ? (kit.cooldown >= 3600 ? Math.floor(kit.cooldown/3600) + 'h' : kit.cooldown >= 60 ? Math.floor(kit.cooldown/60) + 'm' : kit.cooldown + 's') : 'None';
        html += `<tr>
            <td><strong>${kit.name}</strong>${kit.description ? '<br><small style="color:#969696">' + kit.description + '</small>' : ''}</td>
            <td><code>${kit.icon}</code></td>
            <td>${kit.cost > 0 ? kit.cost + ' XP' : '<span style="color:#4ec9b0">Free</span>'}</td>
            <td>${cooldownStr}</td>
            <td>${kit.permission || '<span style="color:#969696">None</span>'}</td>
            <td>${kit.items.length} items</td>
            <td>
                <button onclick="editKit('${kit.name.replace(/'/g, "\\'")}')" class="btn-small" style="padding:5px 10px;font-size:11px;">Edit</button>
                <button onclick="deleteKit('${kit.name.replace(/'/g, "\\'")}')" class="btn-danger" style="padding:5px 10px;font-size:11px;background:#d32f2f;">Delete</button>
            </td>
        </tr>`;
    }
    document.getElementById('kits-list').innerHTML = html || '<tr><td colspan="7" style="text-align:center;padding:20px;">No kits created yet. Use the form above to create one.</td></tr>';
}

async function saveKit() {
    const name = document.getElementById('kit-name').value.trim();
    if (!name) return alert('Enter a kit name');
    const itemsRaw = document.getElementById('kit-items').value.trim();
    const items = itemsRaw ? itemsRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0) : [];
    const data = {
        name,
        icon: document.getElementById('kit-icon').value.trim() || 'CHEST',
        cost: parseInt(document.getElementById('kit-cost').value) || 0,
        cooldown: parseInt(document.getElementById('kit-cooldown').value) || 0,
        permission: document.getElementById('kit-permission').value.trim(),
        description: document.getElementById('kit-description').value.trim(),
        items
    };
    const result = await apiCall('/kits', 'POST', data);
    if (result !== null) {
        document.getElementById('kits-status').innerHTML = '<span style="color:#4ec9b0;">✅ Kit "' + name + '" saved!</span>';
        document.getElementById('kit-name').value = '';
        document.getElementById('kit-icon').value = 'CHEST';
        document.getElementById('kit-cost').value = '0';
        document.getElementById('kit-cooldown').value = '0';
        document.getElementById('kit-permission').value = '';
        document.getElementById('kit-description').value = '';
        document.getElementById('kit-items').value = '';
        loadKits();
    } else {
        document.getElementById('kits-status').innerHTML = '<span style="color:#d32f2f;">❌ Failed to save kit</span>';
    }
}

async function editKit(name) {
    const data = await apiCall('/kits');
    if (!data || !data.kits) return;
    const kit = data.kits.find(k => k.name === name);
    if (!kit) return;
    document.getElementById('kit-name').value = kit.name;
    document.getElementById('kit-icon').value = kit.icon;
    document.getElementById('kit-cost').value = kit.cost;
    document.getElementById('kit-cooldown').value = kit.cooldown;
    document.getElementById('kit-permission').value = kit.permission || '';
    document.getElementById('kit-description').value = kit.description || '';
    document.getElementById('kit-items').value = kit.items.join('\n');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteKit(name) {
    if (!confirm('Delete kit "' + name + '"?')) return;
    await apiCall('/kits/' + encodeURIComponent(name), 'DELETE');
    document.getElementById('kits-status').innerHTML = '<span style="color:#4ec9b0;">✅ Kit "' + name + '" deleted.</span>';
    loadKits();
}

async function viewPlayerReputation(player) {
    const rep = await apiCall('/reputation', 'GET', { player });
    if (rep) {
        alert(` Reputation\nScore: ${rep.score}\nWarnings: ${rep.warnings}\nBans: ${rep.bans}`);
    }
}

async function editGroup(name) {
    const newPrefix = prompt('Group prefix:', '');
    if (newPrefix !== null) {
        await apiCall('/groups/update', 'POST', { name, prefix: newPrefix });
        loadPermissions();
    }
}

// RANKS FUNCTIONS
async function loadRanks() {
    console.log('Loading ranks...');
    const ranks = await apiCall('/ranks');
    const players = await apiCall('/allplayers');
    
    console.log('Ranks response:', ranks);
    console.log('All players response:', players);
    
    if (ranks && ranks.ranks && players && players.players) {
        // Update datalist with all player names
        updatePlayerDatalist(players.players.map(p => p.name));
        
        // Load ranks list
        let ranksHtml = '';
        for (let rank of (ranks.ranks || [])) {
            const memberCount = (players.players || []).filter(p => p.rank === rank.name).length;
            ranksHtml += `
                <tr>
                    <td><span style="background: ${rank.color}; padding: 4px 8px; border-radius: 3px; color: white; font-weight: bold;">${rank.name}</span></td>
                    <td>${rank.level}</td>
                    <td><div style="background: ${rank.color}; width: 40px; height: 25px; border-radius: 3px; display: inline-block;"></div></td>
                    <td></td>
                    <td>${rank.description || '-'}</td>
                    <td>
                        <button onclick="manageRankPermissions('${rank.name}')" class="btn-info" style="padding: 5px 10px; font-size: 11px; background: #0e639c; margin-right: 5px;">Permissions</button>
                        <button onclick="editRank('${rank.name}')" class="btn-small" style="padding: 5px 10px; font-size: 11px;">Edit</button>
                        <button onclick="deleteRank('${rank.name}')" class="btn-danger" style="padding: 5px 10px; font-size: 11px; background: #d32f2f;">Delete</button>
                    </td>
                </tr>
            `;
        }
        document.getElementById('ranks-list').innerHTML = ranksHtml || '<tr><td colspan="6" style="text-align: center; padding: 20px;">No ranks created yet</td></tr>';
        
        // Load player ranks
        let playerRanksHtml = '';
        const playersList = (players && players.players) ? players.players : [];
        for (let player of playersList) {
            if (player.rank) {
                const rank = (ranks.ranks || []).find(r => r.name === player.rank);
                playerRanksHtml += `
                    <tr>
                        <td>${player.name}</td>
                        <td><span style="background: ${rank ? rank.color : '#888'}; padding: 4px 8px; border-radius: 3px; color: white; font-weight: bold;">${player.rank}</span></td>
                        <td>${rank ? rank.level : '-'}</td>
                        <td>${player.promotedBy || '-'}</td>
                        <td>${player.promotionDate ? new Date(player.promotionDate).toLocaleDateString() : '-'}</td>
                        <td>
                            <button onclick="demotePlayerFromTable('${player.name}')" class="btn-danger" style="padding: 5px 10px; font-size: 11px;">Remove Rank</button>
                        </td>
                    </tr>
                `;
            }
        }
        document.getElementById('player-ranks-list').innerHTML = playerRanksHtml || '<tr><td colspan="6" style="text-align: center; padding: 20px;">No players assigned to ranks</td></tr>';
        
        // Populate rank select dropdowns
        let selectHtml = '<option value="">Select Rank</option>';
        for (let rank of (ranks.ranks || []).sort((a, b) => b.level - a.level)) {
            selectHtml += `<option value="${rank.name}">${rank.name} (Level ${rank.level})</option>`;
        }
        document.getElementById('new-rank-select').innerHTML = selectHtml;
    } else {
        console.error('Failed to load ranks:', { ranks, players });
        document.getElementById('ranks-list').innerHTML = '<tr><td colspan="6" style="text-align: center; color: #d32f2f; padding: 20px;">Failed to load ranks. Check console.</td></tr>';
    }
}

function manageRankPermissions(rankName) {
    switchTab('permissions');
    // Wait for groups to load, then scroll to the specific rank/group
    setTimeout(() => {
        const headers = document.querySelectorAll('#groups-container h3');
        for (let h of headers) {
            // Check if header starts with rank name (ignoring prefix span)
            if (h.innerText.trim().startsWith(rankName)) {
                h.closest('div').scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
        }
    }, 600);
}

async function createRank() {
    const name = document.getElementById('rank-name').value;
    const color = document.getElementById('rank-color').value;
    const level = document.getElementById('rank-level').value;
    const description = document.getElementById('rank-description').value;
    
    if (!name) return alert('Rank name is required');
    
    console.log('Creating rank:', { name, color, level, description });
    const result = await apiCall('/ranks/create', 'POST', {
        name, color, level, description
    });
    
    console.log('Create rank response:', result);
    if (result && result.status) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #4ec9b0;">✅ Rank created successfully!</span>';
        document.getElementById('rank-name').value = '';
        document.getElementById('rank-color').value = '#4ec9b0';
        document.getElementById('rank-level').value = '1';
        document.getElementById('rank-description').value = '';
        await loadRanks();
    } else {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #d32f2f;">❌ Failed to create rank. Check console.</span>';
    }
}

async function editRank(rankName) {
    const newDescription = prompt('Edit rank description:', '');
    if (newDescription !== null) {
        const result = await apiCall('/ranks/update', 'POST', { name: rankName, description: newDescription });
        console.log('Edit rank response:', result);
        if (result && result.status) {
            loadRanks();
        }
    }
}

async function deleteRank(rankName) {
    if (!confirm(`Delete rank "${rankName}"? This will remove the rank from all players.`)) return;
    const result = await apiCall('/ranks/delete', 'POST', { name: rankName });
    console.log('Delete rank response:', result);
    if (result && result.status) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #4ec9b0;">✅ Rank deleted!</span>';
        loadRanks();
    }
}

async function promotePlayer() {
    let playerName = document.getElementById('player-rank-input').value.trim();
    const rankName = document.getElementById('new-rank-select').value;
    const reason = document.getElementById('promotion-reason').value;
    
    if (!playerName || !rankName) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #d32f2f;">❌ Please select both player and rank</span>';
        return;
    }
    
    // Validate player exists
    const players = await apiCall('/allplayers');
    const playerExists = players && players.players && players.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
    
    if (!playerExists) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #d32f2f;">❌ Player not found: ' + playerName + '</span>';
        return;
    }
    
    // Use exact case from player list
    if (players && players.players) {
        const exactPlayer = players.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (exactPlayer) playerName = exactPlayer.name;
    }
    
    console.log('Promoting player:', { playerName, rankName, reason });
    const result = await apiCall('/ranks/promote', 'POST', {
        player: playerName,
        rank: rankName,
        reason: reason || 'Promotion granted'
    });
    
    console.log('Promote response:', result);
    if (result && result.status) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #4ec9b0;">✅ Player ' + playerName + ' promoted to ' + rankName + '!</span>';
        document.getElementById('player-rank-input').value = '';
        document.getElementById('promotion-reason').value = '';
        await loadRanks();
    } else {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #d32f2f;">❌ Failed to promote player.</span>';
    }
}

async function demotePlayer() {
    let playerName = document.getElementById('player-rank-input').value.trim();
    if (!playerName) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #d32f2f;">❌ Please select a player</span>';
        return;
    }
    
    // Validate player exists
    const players = await apiCall('/allplayers');
    const playerExists = players && players.players && players.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
    
    if (!playerExists) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #d32f2f;">❌ Player not found: ' + playerName + '</span>';
        return;
    }
    
    // Use exact case from player list
    if (players && players.players) {
        const exactPlayer = players.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (exactPlayer) playerName = exactPlayer.name;
    }
    
    console.log('Demoting player:', playerName);
    const result = await apiCall('/ranks/demote', 'POST', { player: playerName });
    console.log('Demote response:', result);
    
    if (result && result.status) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #4ec9b0;">✅ Player ' + playerName + ' rank removed!</span>';
        document.getElementById('player-rank-input').value = '';
        await loadRanks();
    } else {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #d32f2f;">❌ Failed to demote player.</span>';
    }
}

async function demotePlayerFromTable(playerName) {
    if (!confirm(`Remove rank from ${playerName}?`)) return;
    const result = await apiCall('/ranks/demote', 'POST', { player: playerName });
    console.log('Demote response:', result);
    if (result && result.status) {
        document.getElementById('ranks-status').innerHTML = '<span style="color: #4ec9b0;">✅ Rank removed!</span>';
        await loadRanks();
    }
}

function filterPlayerRanks() {
    const filter = document.getElementById('search-player-rank').value.toLowerCase();
    const rows = document.querySelectorAll('#player-ranks-list tr');
    rows.forEach(row => {
        const playerName = row.cells[0].textContent.toLowerCase();
        row.style.display = playerName.includes(filter) ? '' : 'none';
    });
}

// ===== NEW FEATURES STUB FUNCTIONS =====

async function loadPlayerAnalytics() {
    try {
        const response = await apiCall('/analytics/players');
        const analytics = response && response.analytics ? response.analytics : [];
        const html = analytics.length ? analytics.map(p => `
            <tr>
                <td>${p.player}</td>
                <td>${p.playtimeHours}h</td>
                <td>${p.sessions}</td>
                <td>${p.lastSeen ? new Date(p.lastSeen).toLocaleDateString() : 'Never'}</td>
            </tr>
        `).join('') : '<tr><td colspan="4">No analytics data yet</td></tr>';
        document.getElementById('analytics-table').innerHTML = html;
        
        if (analytics.length > 0) {
            const avgPlaytime = (analytics.reduce((sum, p) => sum + p.playtimeHours, 0) / analytics.length).toFixed(1);
            const mostActive = analytics[0];
            document.getElementById('analytics-total-players').textContent = analytics.length;
            document.getElementById('analytics-avg-session').textContent = avgPlaytime + 'h';
            document.getElementById('analytics-most-active').textContent = mostActive.player;
        }
    } catch (e) {
        console.error('Error loading analytics:', e);
        document.getElementById('analytics-status').innerHTML = '<span style="color: #d32f2f;">Error loading analytics</span>';
    }
}

async function loadLeaderboards() {
    try {
        const response = await apiCall('/analytics/players');
        const analytics = response && response.analytics ? response.analytics : [];
        const playtimeLeaders = analytics
            .slice()
            .sort((left, right) => (right.playtimeHours || 0) - (left.playtimeHours || 0))
            .slice(0, 10)
            .map(player => ({ player: player.player, value: player.playtimeHours || 0 }));
        const sessionLeaders = analytics
            .slice()
            .sort((left, right) => (right.sessions || 0) - (left.sessions || 0))
            .slice(0, 10)
            .map(player => ({ player: player.player, value: player.sessions || 0 }));
        
        const playtimeHtml = playtimeLeaders.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${p.player}</td>
                <td>${p.value}h</td>
            </tr>
        `).join('') || '<tr><td colspan="3">No data</td></tr>';
        
        const sessionHtml = sessionLeaders.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${p.player}</td>
                <td>${p.value}</td>
            </tr>
        `).join('') || '<tr><td colspan="3">No data</td></tr>';
        
        document.getElementById('leaderboard-playtime').innerHTML = playtimeHtml;
        document.getElementById('leaderboard-sessions').innerHTML = sessionHtml;
    } catch (e) {
        console.error('Error loading leaderboards:', e);
    }
}

async function loadEconomy() {
    try {
        const response = await apiCall('/economy');
        const players = response && response.players ? response.players : [];
        const total = players.reduce((sum, player) => sum + (player.balance || 0), 0);
        const richest = players.length > 0 ? players[0] : null;

        document.getElementById('economy-total').textContent = `$${total.toLocaleString()}`;
        document.getElementById('economy-richest').textContent = richest
            ? `${richest.name} ($${(richest.balance || 0).toLocaleString()})`
            : '-';

        document.getElementById('economy-table').innerHTML = players.length > 0
            ? players.map(player => `
                <tr>
                    <td>${player.name}</td>
                    <td>$${(player.balance || 0).toLocaleString()}</td>
                    <td>$${(player.earned || 0).toLocaleString()}</td>
                    <td>$${(player.spent || 0).toLocaleString()}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="4">No economy data available</td></tr>';
    } catch (error) {
        console.error('Error loading economy:', error);
        document.getElementById('economy-table').innerHTML = '<tr><td colspan="4">Failed to load economy data</td></tr>';
    }
}

async function loadAuditLog() {
    try {
        const adminFilter = document.getElementById('audit-admin-filter') ? document.getElementById('audit-admin-filter').value : '';
        const actionFilter = document.getElementById('audit-action-filter') ? document.getElementById('audit-action-filter').value : '';
        const response = await apiCall('/audit?admin=' + encodeURIComponent(adminFilter) + '&action=' + encodeURIComponent(actionFilter));
        const logs = response && response.logs ? response.logs : [];
        const html = logs.length ? logs.map(l => `
            <tr>
                <td>${l.date || 'Unknown'}</td>
                <td>${l.admin}</td>
                <td>${l.action}</td>
                <td>${l.target}</td>
                <td>${l.reason || '-'}</td>
            </tr>
        `).join('') : '<tr><td colspan="5">No audit logs</td></tr>';
        document.getElementById('auditlog-table').innerHTML = html;
    } catch (e) {
        console.error('Error loading audit log:', e);
    }
}

function filterEconomyTable() {
    const search = document.getElementById('economy-search').value.toLowerCase();
    document.querySelectorAll('#economy-table tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(search) ? '' : 'none';
    });
}



function filterAuditLog() {
    const adminFilter = document.getElementById('audit-admin-filter').value.toLowerCase();
    const actionFilter = document.getElementById('audit-action-filter').value.toLowerCase();
    document.querySelectorAll('#auditlog-table tr').forEach(tr => {
        const admin = tr.cells[1].textContent.toLowerCase();
        const action = tr.cells[2].textContent.toLowerCase();
        tr.style.display = (admin.includes(adminFilter) && action.includes(actionFilter)) ? '' : 'none';
    });
}

async function loadServerLogs() {
    const data = await apiCall('/logs');
    window.allServerLogs = data && data.logs ? data.logs : [];
    renderLogs();
}

function renderLogs() {
    const search = document.getElementById('logs-search').value.toLowerCase();
    const level = document.getElementById('logs-level-filter').value;
    
    let filtered = window.allServerLogs || [];
    if (level) filtered = filtered.filter(l => l.includes(`[${level}]`));
    if (search) filtered = filtered.filter(l => l.toLowerCase().includes(search));
    
    const html = filtered.map(l => {
        let color = '#ccc';
        if (l.includes('[INFO]')) color = '#4ec9b0';
        else if (l.includes('[WARNING]') || l.includes('[WARN]')) color = '#ff9800';
        else if (l.includes('[SEVERE]') || l.includes('[ERROR]')) color = '#d32f2f';
        return `<div style="color: ${color}; padding: 2px 0;">${l.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    }).join('');
    
    const viewer = document.getElementById('logs-viewer');
    const isScrolledToBottom = viewer.scrollHeight - viewer.clientHeight <= viewer.scrollTop + 50;
    
    viewer.innerHTML = html || '<div style="color: #999;">No logs to display</div>';
    
    if (isScrolledToBottom || viewer.scrollTop === 0) {
        viewer.scrollTop = viewer.scrollHeight;
    }
}

function filterLogs() {
    renderLogs();
}

async function clearLogs() {
    if (confirm('Clear all server logs?')) {
        await apiCall('/logs/clear', 'POST');
        loadServerLogs();
    }
}

async function loadAppeals() {
    try {
        const appeals = await apiCall('/appeals');
        const rows = Array.isArray(appeals) ? appeals : [];
        const pendingCount = rows.filter(appeal => (appeal.status || 'open') === 'open').length;
        const resolvedCount = rows.filter(appeal => (appeal.status || '') === 'resolved').length;

        document.getElementById('appeals-pending').textContent = pendingCount;
        document.getElementById('appeals-approved').textContent = resolvedCount;
        document.getElementById('appeals-denied').textContent = '0';

        document.getElementById('appeals-table').innerHTML = rows.length > 0
            ? rows.map(appeal => {
                const appealId = String(appeal.id).startsWith('-') ? String(appeal.id) : `-${appeal.id}`;
                const isResolved = (appeal.status || '') === 'resolved';
                return `
                    <tr>
                        <td>${Math.abs(Number(appealId))}</td>
                        <td>${appeal.player || 'Unknown'}</td>
                        <td>${appeal.category || 'other'}</td>
                        <td>${appeal.priority || 'medium'}</td>
                        <td>${appeal.status || 'open'}</td>
                        <td>${appeal.time || '-'}</td>
                        <td>${appeal.message || ''}</td>
                        <td>
                            ${isResolved
                                ? '<span style="color:#4ec9b0;">Resolved</span>'
                                : `<button class="btn-success" style="padding:4px 8px;font-size:11px;" onclick="approveAppeal('${appealId}')">Approve</button>
                                   <button class="btn-danger" style="padding:4px 8px;font-size:11px;" onclick="denyAppeal('${appealId}')">Deny</button>`}
                        </td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="8">No appeals found</td></tr>';
        document.getElementById('appeals-status').textContent = '';
    } catch (error) {
        console.error('Error loading appeals:', error);
        document.getElementById('appeals-table').innerHTML = '<tr><td colspan="8">Failed to load appeals</td></tr>';
        document.getElementById('appeals-status').textContent = 'Appeals are unavailable right now.';
    }
}

async function approveAppeal(appealId) {
    if (!confirm(`Approve appeal #${Math.abs(Number(appealId))}?`)) return;
    const result = await apiCall(`/ticket/${appealId}/resolve`, 'POST', { reason: 'Approved by web panel' });
    if (result && result.status) {
        document.getElementById('appeals-status').textContent = `Appeal #${Math.abs(Number(appealId))} approved.`;
        loadAppeals();
        return;
    }
    alert('Failed to approve appeal.');
}

async function denyAppeal(appealId) {
    if (!confirm(`Deny appeal #${Math.abs(Number(appealId))}?`)) return;
    const result = await apiCall(`/ticket/${appealId}/resolve`, 'POST', { reason: 'Denied by web panel' });
    if (result && result.status) {
        document.getElementById('appeals-status').textContent = `Appeal #${Math.abs(Number(appealId))} denied.`;
        loadAppeals();
        return;
    }
    alert('Failed to deny appeal.');
}

async function loadAnnouncements() {
    const data = await apiCall('/announcements/scheduled');
    const items = data && data.announcements ? data.announcements : [];
    const html = items.length ? items.map((a, i) => {
        const isPast = new Date(a.time).getTime() <= Date.now();
        const status = a.sent ? '<span style="color:#4ec9b0;">Sent</span>' 
            : isPast ? '<span style="color:#d4a017;">Pending</span>'
            : '<span style="color:#569cd6;">Scheduled</span>';
        return `<tr>
            <td>${a.message}</td>
            <td>${new Date(a.time).toLocaleString()}</td>
            <td>${status}</td>
            <td><button class="btn-danger" style="padding:4px 8px;font-size:11px;" onclick="deleteScheduledAnnouncement(${i})">Delete</button></td>
        </tr>`;
    }).join('') : '<tr><td colspan="4" style="text-align:center;color:#999;">No scheduled announcements</td></tr>';
    document.getElementById('announcements-table').innerHTML = html;
}

async function scheduleAnnouncement() {
    const msg = document.getElementById('announce-msg').value;
    const time = document.getElementById('announce-time').value;
    if (!msg || !time) {
        alert('Please fill in all fields');
        return;
    }
    const response = await apiCall('/announcements/schedule', 'POST', { message: msg, time: time });
    if (response && response.success) {
        alert('Announcement scheduled!');
        document.getElementById('announce-msg').value = '';
        document.getElementById('announce-time').value = '';
        loadAnnouncements();
    } else {
        alert('Failed to schedule announcement');
    }
}

async function deleteScheduledAnnouncement(index) {
    if (!confirm('Delete this scheduled announcement?')) return;
    const response = await apiCall(`/announcements/schedule/${index}`, 'DELETE');
    if (response && response.success) loadAnnouncements();
}

async function loadBackups() {
    const tbody = document.getElementById('backups-table');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading backups...</td></tr>';
    
    try {
        const backups = await apiCall('/backups');
        if (backups && backups.length > 0) {
            tbody.innerHTML = backups.map(b => {
                const date = new Date(b.date).toLocaleString();
                const sizeMB = (b.size / (1024 * 1024)).toFixed(2) + ' MB';
                return `<tr>
                    <td>${b.name}<br><small style="color:#969696">${date}</small></td>
                    <td>${sizeMB}</td>
                    <td><span style="color:#4ec9b0">Complete</span></td>
                    <td>
                        <button class="btn-success action-btn" style="padding:4px 8px;font-size:11px;" onclick="downloadBackup('${b.name}')">Download</button>
                        <button class="btn-danger action-btn" style="padding:4px 8px;font-size:11px;" onclick="deleteBackup('${b.name}')">Delete</button>
                    </td>
                </tr>`;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#969696;">No backups found.</td></tr>';
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#d32f2f;">Failed to load backups.</td></tr>';
    }
}

async function createBackup() {
    if (confirm('Create a full world backup? This may take a minute and cause temporary lag on the server.')) {
        document.getElementById('backups-status').innerHTML = '<span style="color: #ff9800;">⏳ Backup started... please check back in a few moments.</span>';
        const res = await apiCall('/backups/create', 'POST');
        if (res && res.success) {
            document.getElementById('backups-status').innerHTML = '<span style="color: #4ec9b0;">✅ Backup process initiated!</span>';
            setTimeout(loadBackups, 5000);
        } else {
            document.getElementById('backups-status').innerHTML = '<span style="color: #d32f2f;">❌ Failed to initiate backup.</span>';
        }
    }
}

async function deleteBackup(name) {
    if (confirm(`Are you sure you want to delete backup: ${name}?`)) {
        const res = await apiCall(`/backups/${name}`, 'DELETE');
        if (res && res.success) {
            loadBackups();
        } else {
            alert('Failed to delete backup.');
        }
    }
}

async function downloadBackup(name) {
    try {
        const url = `${API_URL}/backups/download/${encodeURIComponent(name)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });
        
        if (!response.ok) {
            alert('Failed to download backup.');
            return;
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
    } catch (e) {
        console.error('Download error:', e);
        alert('Error downloading backup.');
    }
}

async function loadScheduledCommands() {
    const tbody = document.getElementById('scheduler-table');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #aaa;">Loading...</td></tr>';
    
    try {
        let data = await apiCall('/scheduler');
        let tasks = data && data.tasks ? data.tasks : [];

        if (Array.isArray(tasks) && tasks.length > 0) {
            tbody.innerHTML = tasks.map(task => `
                <tr>
                    <td><code>/${task.command}</code></td>
                    <td>${new Date(task.time).toLocaleString()}</td>
                    <td>${task.sent ? '<span style="color:#4ec9b0">Sent</span>' : '<span style="color:#2196f3">Scheduled</span>'}</td>
                    <td><button onclick="deleteScheduledCommand(${task.index})" class="btn-danger action-btn" style="padding:4px 8px;font-size:11px;">Delete</button></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #888;">No scheduled commands.</td></tr>';
        }
    } catch (e) {
        console.error("Load Scheduler Error:", e);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #ff7675;">Failed to load scheduler.</td></tr>';
    }
}

async function scheduleCommand() {
    const cmdInput = document.getElementById('scheduler-cmd');
    const timeInput = document.getElementById('scheduler-time');
    if (!cmdInput.value || !timeInput.value) {
        alert('Please fill in all fields');
        return;
    }
    try {
        const response = await apiCall('/scheduler', 'POST', { command: cmdInput.value, time: timeInput.value });
        if (response && response.success) {
            alert("Command scheduled!");
            cmdInput.value = ''; timeInput.value = '';
            loadScheduledCommands();
        } else alert("Failed: " + (response && response.error ? response.error : 'Unknown server error'));
    } catch(e) { alert("Error: " + e.message); }
}

async function deleteScheduledCommand(index) {
    if(!confirm("Cancel this scheduled command?")) return;
    try {
        const response = await apiCall(`/scheduler/${index}`, 'DELETE');
        if (response && response.success) loadScheduledCommands();
        else alert("Failed to delete: " + (response && response.error ? response.error : 'Unknown error'));
    } catch(e) { alert("Error cancelling: " + e.message); }
}

async function loadMaintenanceMode() {
    const data = await apiCall('/maintenance');
    if (!data) return;
    document.getElementById('maintenance-status').value = data.enabled ? 'on' : 'off';
    document.getElementById('maintenance-msg').value = data.message || '';
    document.getElementById('maintenance-start').value = data.startTime || '';
    document.getElementById('maintenance-end').value = data.endTime || '';
    const whitelist = data.whitelist || [];
    document.getElementById('maintenance-whitelist-table').innerHTML = whitelist.length > 0
        ? whitelist.map(p => `<tr><td>${p}</td><td><button class="btn-danger" style="padding:4px 8px;font-size:11px;" onclick="removeMaintenanceWhitelist('${p}')">Remove</button></td></tr>`).join('')
        : '<tr><td colspan="2" style="text-align:center;color:#999;">No exempt players</td></tr>';
}

async function setMaintenance() {
    const status = document.getElementById('maintenance-status').value;
    const msg = document.getElementById('maintenance-msg').value;
    const startTime = document.getElementById('maintenance-start').value;
    const endTime = document.getElementById('maintenance-end').value;
    try {
        const url = `${API_URL}/maintenance/set`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, message: msg, startTime, endTime })
        });
        if (response.ok) {
            if (startTime) {
                alert('Maintenance mode scheduled successfully!');
            } else {
                alert('Maintenance mode ' + (status === 'on' ? 'enabled' : 'disabled') + '!');
            }
            loadMaintenanceMode();
        }
    } catch (e) { console.error('Error setting maintenance:', e); }
}

async function addMaintenanceWhitelist() {
    const player = document.getElementById('maintenance-whitelist-player').value;
    if (!player) return;
    try {
        const url = `${API_URL}/maintenance/whitelist/add`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ player })
        });
        document.getElementById('maintenance-whitelist-player').value = '';
        loadMaintenanceMode();
    } catch (e) { console.error('Error adding to whitelist:', e); }
}

async function removeMaintenanceWhitelist(player) {
    try {
        const url = `${API_URL}/maintenance/whitelist/${encodeURIComponent(player)}`;
        await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });
        loadMaintenanceMode();
    } catch (e) { console.error('Error removing from whitelist:', e); }
}

async function createPermissionGroup() {
    const name = document.getElementById('perm-group-name').value;
    const color = document.getElementById('perm-group-color').value;
    const prefix = document.getElementById('perm-group-prefix').value;
    if (!name) return;
    try {
        await apiCall('/groups/create', 'POST', { name, color, prefix });
        document.getElementById('perm-group-name').value = '';
        document.getElementById('perm-group-prefix').value = '';
        loadPermissions();
    } catch (e) { alert('Failed to create group: ' + e.message); }
}

async function deleteGroup(name) {
    if (!confirm('Delete group "' + name + '"? Members will lose their permissions.')) return;
    try {
        await apiCall('/groups/delete', 'POST', { name });
        loadPermissions();
    } catch (e) { alert('Failed to delete group'); }
}

async function addGroupPermission(groupName) {
    const input = document.getElementById('add-perm-' + groupName);
    const permission = input.value.trim();
    if (!permission) return;
    try {
        await apiCall('/groups/permissions/add', 'POST', { name: groupName, permission });
        input.value = '';
        loadPermissions();
    } catch (e) { alert('Failed to add permission'); }
}

async function removeGroupPermission(groupName, permission) {
    try {
        await apiCall('/groups/permissions/remove', 'POST', { name: groupName, permission });
        loadPermissions();
    } catch (e) { alert('Failed to remove permission'); }
}

async function addGroupMember(groupName) {
    const input = document.getElementById('add-member-' + groupName);
    const player = input.value.trim();
    if (!player) return;
    try {
        await apiCall('/groups/members/add', 'POST', { name: groupName, player });
        input.value = '';
        loadPermissions();
    } catch (e) { alert('Failed to add member'); }
}

async function removeGroupMember(groupName, uuid) {
    try {
        await apiCall('/groups/members/remove', 'POST', { name: groupName, uuid });
        loadPermissions();
    } catch (e) { alert('Failed to remove member'); }
}

async function loadLandClaims() {
    try {
        const data = await apiCall('/claims');
        document.getElementById('claims-total').textContent = data.totalChunks || 0;
        document.getElementById('claims-disputed').textContent = data.totalPlayers || 0;
        document.getElementById('claims-largest').textContent = (data.largestClaim || 0) + ' chunks';
        const tbody = document.getElementById('claims-table');
        tbody.innerHTML = '';
        if (data.claims) {
            data.claims.forEach(c => {
                const tr = document.createElement('tr');
                const locPreview = c.locations && c.locations.length > 0 ? c.locations[0] : 'N/A';
                const moreCount = c.locations && c.locations.length > 1 ? ` (+${c.locations.length - 1} more)` : '';
                tr.innerHTML = `<td>${c.owner}</td>` +
                    `<td title="${c.locations ? c.locations.join('\n') : ''}">${locPreview}${moreCount}</td>` +
                    `<td>${c.chunks} chunks</td>` +
                    `<td>${c.trusted && c.trusted.length > 0 ? c.trusted.join(', ') : 'None'}</td>` +
                    `<td><button class="btn-danger" onclick="deleteClaim('${c.uuid}')">Remove</button></td>`;
                tbody.appendChild(tr);
            });
        }
    } catch(e) { console.error('Failed to load claims:', e); }
}

async function deleteClaim(uuid) {
    if (!confirm('Remove all claims for this player?')) return;
    await apiCall('/claims/' + uuid, 'DELETE');
    loadLandClaims();
}

function filterClaimsTable() {
    const search = document.getElementById('claims-search').value.toLowerCase();
    document.querySelectorAll('#claims-table tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(search) ? '' : 'none';
    });
}

async function createRoleplayCommand() {
    const name = document.getElementById('rp-cmd-name').value;
    const trigger = document.getElementById('rp-cmd-trigger').value;
    const response = document.getElementById('rp-cmd-response').value;
    if (!name || !trigger || !response) return;
    console.log('Creating roleplay command', name, trigger);
    // TODO: POST /api/roleplay/commands/create
}

async function loadRoleplayCommands() {
    console.log('Loading roleplay commands...');
    // TODO: Fetch /api/roleplay/commands
}

async function loadVoteRewards() {
    console.log('Loading vote rewards...');
    // TODO: Fetch /api/votes/rewards
}

async function setVoteReward() {
    const cmd = document.getElementById('vote-reward-cmd').value;
    const amount = document.getElementById('vote-reward-amount').value;
    if (!cmd || !amount) return;
    console.log('Setting vote reward', cmd, amount);
    // TODO: POST /api/votes/rewards/set
}

// --- EVENTS SYSTEM ---
let activeEffects = {};
let eventParticles = [];

async function loadActiveEvents() {
    const response = await apiCall('/events/active');
    const events = response && response.events ? response.events : [];
    
    const html = events.length ? events.map(e => `
        <tr>
            <td>🎄 ${e.name}</td>
            <td>active</td>
            <td>${e.startTime || '-'}</td>
            <td>${e.playersOnline || 0}</td>
            <td><button onclick="stopEvent('${e.name}')" class="btn-danger" style="padding: 4px 8px; font-size: 11px;">Stop Event</button></td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align: center; color: #999;">No active events</td></tr>';
    
    document.getElementById('active-events-table').innerHTML = html;
}

async function forceHalloweenTime() {
    if (!confirm('Force time to midnight in all worlds?')) return;
    
    console.warn('🎃 Forcing Midnight...');
    // 1. Try global commands
    await apiCall('/command', 'POST', { command: 'gamerule doDaylightCycle false' });
    await apiCall('/command', 'POST', { command: 'time set 18000' });
    
    // 2. Try per-world
    try {
        const worlds = await apiCall('/worlds');
        if (worlds && Array.isArray(worlds)) {
            for (const w of worlds) {
                const name = w.name || w;
                await apiCall('/command', 'POST', { command: `execute in ${name} run time set 18000` });
                await apiCall('/command', 'POST', { command: `execute in ${name} run gamerule doDaylightCycle false` });
                await apiCall('/command', 'POST', { command: `mv time set midnight ${name}` });
                await apiCall('/command', 'POST', { command: `mv rule doDaylightCycle false ${name}` });
            }
        }
    } catch (e) {
        console.warn('Failed to apply time to all worlds:', e);
    }
    alert('Midnight commands sent to all worlds!');
}

async function startEvent(eventName) {
    console.log('startEvent called with:', eventName);
    try {
        const response = await apiCall('/events/start', 'POST', { event: eventName });
        console.log('API Response for /events/start:', response);
        
        if (response && response.status === 'success') {
            console.log('Event started successfully');
            // For halloween, lock time to midnight
            if (eventName === 'halloween') {
                console.warn('🎃 HALLOWEEN MODE ACTIVATING: Setting time to midnight...');
                await new Promise(resolve => setTimeout(resolve, 500)); 
                
                // 1. Try global commands (Main world)
                await apiCall('/command', 'POST', { command: 'gamerule doDaylightCycle false' });
                await apiCall('/command', 'POST', { command: 'minecraft:time set 18000' });
                
                // 2. Try to apply to ALL worlds (Multiverse / Multi-world support)
                try {
                    const worlds = await apiCall('/worlds');
                    if (worlds && Array.isArray(worlds)) {
                        for (const w of worlds) {
                            const name = w.name || w;
                            console.log(`Applying Halloween time to world: ${name}`);
                            // Try 1.13+ execute syntax
                            await apiCall('/command', 'POST', { command: `execute in ${name} run time set 18000` });
                            await apiCall('/command', 'POST', { command: `execute in ${name} run gamerule doDaylightCycle false` });
                            // Try Multiverse syntax (if installed)
                            await apiCall('/command', 'POST', { command: `mv time set midnight ${name}` });
                            await apiCall('/command', 'POST', { command: `mv rule doDaylightCycle false ${name}` });
                        }
                    }
                } catch (e) {
                    console.warn('Failed to apply time to all worlds:', e);
                }

                // 3. Announce to chat (Visual confirmation that commands are running)
                await apiCall('/command', 'POST', { command: 'say §c§lHalloween Event Started! Time locked to midnight.' });
            }

            // Play sound effect
            const sounds = {
                'halloween': 'minecraft:entity.wither.spawn',
                'christmas': 'minecraft:block.bell.use',
                'newyear': 'minecraft:entity.firework_rocket.launch',
                'valentine': 'minecraft:entity.villager.yes'
            };
            if (sounds[eventName]) {
                await apiCall('/command', 'POST', { command: `execute as @a run playsound ${sounds[eventName]} master @s ~ ~ ~ 1 1` });
            }

            alert(`${eventName} event started!`);
            activeEffects[eventName] = true;
            console.log('activeEffects updated:', activeEffects);
            loadActiveEvents();
            startEventVisualEffect(eventName);
        } else {
            console.log('API response was not successful:', response);
            alert('Failed to start event: ' + (response?.error || 'Unknown error'));
        }
    } catch (e) {
        console.error('Error in startEvent:', e);
        alert('Error: ' + e.message);
    }
}

async function stopEvent(eventName) {
    if (!confirm(`Stop ${eventName} event?`)) return;
    const response = await apiCall('/events/stop', 'POST', { event: eventName });
    console.log('API Response for /events/stop:', response);
    if (response && response.status === 'success') {
        // When halloween ends, restore daylight cycle
        if (eventName === 'halloween') {
            console.log('Restoring daylight cycle...');
            await apiCall('/command', 'POST', { command: 'gamerule doDaylightCycle true' });
            
            try {
                const worlds = await apiCall('/worlds');
                if (worlds && Array.isArray(worlds)) {
                    for (const w of worlds) {
                        const name = w.name || w;
                        await apiCall('/command', 'POST', { command: `execute in ${name} run gamerule doDaylightCycle true` });
                        await apiCall('/command', 'POST', { command: `mv rule doDaylightCycle true ${name}` });
                    }
                }
            } catch (e) {}
            
            await apiCall('/command', 'POST', { command: 'say Halloween Event Ended! Daylight cycle restored.' });
        }

        alert(`${eventName} event stopped!`);
        activeEffects[eventName] = false;
        loadActiveEvents();
    } else {
        alert('Failed to stop event');
    }
}

async function loadEventHistory() {
    const response = await apiCall('/events/history');
    const history = response && response.history ? response.history : [];
    
    const html = history.length ? history.map(h => `
        <tr>
            <td>${h.event}</td>
            <td>${h.admin || 'System'}</td>
            <td>${h.startTime || '-'}</td>
            <td>${h.duration || '-'}</td>
            <td><span style="color: #4ec9b0;">Completed</span></td>
        </tr>
    `).join('') : '<tr><td colspan="5">No event history</td></tr>';
    
    document.getElementById('event-history-table').innerHTML = html;
}

function startEventVisualEffect(eventName) {
    // Get canvas dimensions (use defaults if not available yet)
    const canvas = document.getElementById('map-canvas');
    const canvasWidth = canvas ? canvas.width : 800;
    const canvasHeight = canvas ? canvas.height : 600;
    
    // Initialize event particles if not already done
    if (!eventParticles[eventName]) {
        eventParticles[eventName] = [];
        
        // Create initial particles based on event type
        switch(eventName) {
            case 'christmas':
                for (let i = 0; i < 100; i++) {
                    eventParticles[eventName].push({
                        x: Math.random() * canvasWidth,
                        y: Math.random() * canvasHeight * 0.8,
                        speedX: (Math.random() - 0.5) * 2,
                        speedY: 1 + Math.random() * 2,
                        size: 2 + Math.random() * 4,
                        opacity: 0.3 + Math.random() * 0.7
                    });
                }
                break;
            case 'valentine':
                for (let i = 0; i < 50; i++) {
                    eventParticles[eventName].push({
                        x: Math.random() * canvasWidth,
                        y: Math.random() * canvasHeight,
                        speedX: (Math.random() - 0.5) * 1,
                        speedY: -1 - Math.random() * 1,
                        rotation: Math.random() * Math.PI * 2,
                        size: 8 + Math.random() * 4,
                        opacity: 0.5 + Math.random() * 0.5
                    });
                }
                break;
            case 'halloween':
                for (let i = 0; i < 30; i++) {
                    eventParticles[eventName].push({
                        x: Math.random() * canvasWidth,
                        y: Math.random() * canvasHeight,
                        speedX: (Math.random() - 0.5) * 1.5,
                        speedY: (Math.random() - 0.5) * 1,
                        size: 12 + Math.random() * 8,
                        opacity: 0.6
                    });
                }
                break;
            case 'newyear':
                for (let i = 0; i < 40; i++) {
                    eventParticles[eventName].push({
                        x: Math.random() * canvasWidth,
                        y: Math.random() * canvasHeight * 0.5,
                        speedX: (Math.random() - 0.5) * 3,
                        speedY: 2 + Math.random() * 3,
                        size: 3 + Math.random() * 4,
                        opacity: 0.8,
                        color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][Math.floor(Math.random() * 4)]
                    });
                }
                break;
            case 'spring':
                for (let i = 0; i < 80; i++) {
                    eventParticles[eventName].push({
                        x: Math.random() * canvasWidth,
                        y: -10,
                        speedX: (Math.random() - 0.5) * 1.5,
                        speedY: 1 + Math.random() * 1.5,
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.1,
                        size: 6 + Math.random() * 4,
                        opacity: 0.7
                    });
                }
                break;
            case 'summer':
                for (let i = 0; i < 40; i++) {
                    eventParticles[eventName].push({
                        x: Math.random() * canvasWidth,
                        y: 10 + Math.random() * 100,
                        speedX: (Math.random() - 0.5) * 0.5,
                        speedY: (Math.random() - 0.5) * 0.5,
                        size: 2 + Math.random() * 3,
                        opacity: 0.6
                    });
                }
                break;
        }
    }
    
    // Particles are now drawn in the main map loop
    console.log('Event effect initialized for:', eventName);
}

function drawSnow(ctx, canvas, eventName) {
    if (!eventParticles[eventName]) {
        eventParticles[eventName] = [];
        for (let i = 0; i < 100; i++) {
            eventParticles[eventName].push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.8,
                speedX: (Math.random() - 0.5) * 2,
                speedY: 1 + Math.random() * 2,
                size: 2 + Math.random() * 4,
                opacity: 0.3 + Math.random() * 0.7
            });
        }
    }

    const particles = eventParticles[eventName];
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
}

function drawHearts(ctx, canvas, eventName) {
    if (!eventParticles[eventName]) {
        eventParticles[eventName] = [];
        for (let i = 0; i < 50; i++) {
            eventParticles[eventName].push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speedX: (Math.random() - 0.5) * 1,
                speedY: -1 - Math.random() * 1,
                rotation: Math.random() * Math.PI * 2,
                size: 8 + Math.random() * 4,
                opacity: 0.5 + Math.random() * 0.5
            });
        }
    }

    const particles = eventParticles[eventName];
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(244, 67, 54, ${p.opacity})`;
        ctx.font = `${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♥', 0, 0);
        ctx.restore();

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += 0.02;
        p.opacity -= 0.01;

        if (p.y < -20 || p.opacity <= 0) {
            p.y = canvas.height + 20;
            p.x = Math.random() * canvas.width;
            p.opacity = 0.7;
        }
    });
}

function drawFireworks(ctx, canvas, eventName) {
    if (!eventParticles[eventName]) {
        eventParticles[eventName] = [];
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add new fireworks occasionally
    if (Math.random() < 0.05) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            eventParticles[eventName].push({
                x: canvas.width / 2 + Math.random() * 200 - 100,
                y: canvas.height / 2 + Math.random() * 100 - 50,
                vx: Math.cos(angle) * (3 + Math.random() * 2),
                vy: Math.sin(angle) * (3 + Math.random() * 2),
                color: color,
                life: 100
            });
        }
    }

    eventParticles[eventName] = eventParticles[eventName].filter(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life--;

        return p.life > 0;
    });
}

function drawPetals(ctx, canvas, eventName) {
    if (!eventParticles[eventName]) {
        eventParticles[eventName] = [];
        for (let i = 0; i < 80; i++) {
            eventParticles[eventName].push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.8,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: 0.5 + Math.random() * 1,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                size: 4 + Math.random() * 3,
                opacity: 0.4 + Math.random() * 0.6
            });
        }
    }

    const particles = eventParticles[eventName];
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(255, 182, 193, ${p.opacity})`;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
}

function drawSpiders(ctx, canvas, eventName) {
    ctx.fillStyle = 'rgba(20, 20, 30, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw spiders (simplified as small dots with legs)
    if (!eventParticles[eventName]) {
        eventParticles[eventName] = [];
        for (let i = 0; i < 30; i++) {
            eventParticles[eventName].push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5
            });
        }
    }

    eventParticles[eventName].forEach((p) => {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });
}

function drawSunParticles(ctx, canvas, eventName) {
    ctx.fillStyle = 'rgba(255, 223, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sun
    ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 80, 80, 0, Math.PI * 2);
    ctx.fill();

    if (!eventParticles[eventName]) {
        eventParticles[eventName] = [];
        for (let i = 0; i < 40; i++) {
            eventParticles[eventName].push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                size: 2 + Math.random() * 4
            });
        }
    }

    eventParticles[eventName].forEach((p) => {
        ctx.fillStyle = 'rgba(255, 200, 100, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });
}

// Load events on page load
(async () => {
    await loadActiveEvents();
    await loadEventHistory();
})();

// ========== CRATES ==========
async function loadCrates() {
    const data = await apiCall('/crates');
    const tbody = document.getElementById('crates-list');
    tbody.innerHTML = '';
    if (data) {
        for (const [name, c] of Object.entries(data)) {
            const rewards = (c.rewards || []);
            tbody.innerHTML += `<tr>
                <td>${name}</td>
                <td>${c.icon || 'CHEST'}</td>
                <td>${c.key_cost || 0} XP</td>
                <td>${rewards.length} rewards</td>
                <td><button class="action-btn" onclick="editCrate('${name}')">✏️</button> <button class="action-btn" style="background:#d32f2f;" onclick="deleteCrate('${name}')">🗑️</button></td>
            </tr>`;
        }
    }
    if (!tbody.innerHTML) tbody.innerHTML = '<tr><td colspan="5" style="color:#969696;">No crates created yet</td></tr>';
}
function editCrate(name) {
    apiCall('/crates').then(data => {
        if (data && data[name]) {
            document.getElementById('crate-name').value = name;
            document.getElementById('crate-icon').value = data[name].icon || 'CHEST';
            document.getElementById('crate-desc').value = data[name].description || '';
            document.getElementById('crate-keycost').value = data[name].key_cost || 0;
            document.getElementById('crate-rewards').value = (data[name].rewards || []).join('\n');
        }
    });
}
async function saveCrate() {
    const name = document.getElementById('crate-name').value.trim();
    if (!name) return alert('Enter a crate name');
    const rewards = document.getElementById('crate-rewards').value.split('\n').map(r => r.trim()).filter(r => r);
    await apiCall('/crates', 'POST', {
        name, icon: document.getElementById('crate-icon').value.trim() || 'CHEST',
        description: document.getElementById('crate-desc').value.trim(),
        key_cost: parseInt(document.getElementById('crate-keycost').value) || 0,
        rewards
    });
    loadCrates();
}
async function deleteCrate(name) {
    if (!confirm('Delete crate "' + name + '"?')) return;
    await apiCall('/crates/' + encodeURIComponent(name), 'DELETE');
    loadCrates();
}

// ========== BOUNTIES ==========
async function loadBounties() {
    const data = await apiCall('/bounties');
    const tbody = document.getElementById('bounties-list');
    tbody.innerHTML = '';
    if (data && data.length) {
        data.forEach(b => {
            tbody.innerHTML += `<tr><td>${b.targetName}</td><td>${b.setterName}</td><td>${b.amount}</td>
                <td><button class="action-btn" style="background:#d32f2f;" onclick="deleteBounty('${b.id}')">🗑️ Remove</button></td></tr>`;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="color:#969696;">No active bounties</td></tr>';
    }
}
async function deleteBounty(id) {
    if (!confirm('Remove this bounty?')) return;
    await apiCall('/bounties/' + id, 'DELETE');
    loadBounties();
}

// ========== SHOPS ==========
async function loadShops() {
    const data = await apiCall('/shops');
    const tbody = document.getElementById('shops-list');
    tbody.innerHTML = '';
    if (data && data.length) {
        data.forEach(s => {
            tbody.innerHTML += `<tr><td>${(s.item||'').replace(/_/g,' ')}</td><td>${s.amount}</td><td>${s.price} XP</td><td>${s.ownerName}</td>
                <td><button class="action-btn" style="background:#d32f2f;" onclick="deleteShop('${s.id}')">🗑️ Remove</button></td></tr>`;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="color:#969696;">No active shop listings</td></tr>';
    }
}
async function deleteShop(id) {
    if (!confirm('Remove this listing?')) return;
    await apiCall('/shops/' + id, 'DELETE');
    loadShops();
}

// ========== QUESTS ==========
async function loadQuests() {
    const data = await apiCall('/quests');
    const tbody = document.getElementById('quests-list');
    tbody.innerHTML = '';
    if (data) {
        for (const [id, q] of Object.entries(data)) {
            tbody.innerHTML += `<tr>
                <td>${q.name}</td><td>${(q.type||'').replace(/_/g,' ')}</td><td>${q.goal}</td>
                <td>${q.reward} XP${q.reward_kit ? ' + Kit: '+q.reward_kit : ''}</td>
                <td style="color:${q.active?'#4ec9b0':'#d32f2f'}">${q.active?'Active':'Inactive'}</td>
                <td><button class="action-btn" onclick="editQuest('${id}')">✏️</button> <button class="action-btn" style="background:#d32f2f;" onclick="deleteQuest('${id}')">🗑️</button></td>
            </tr>`;
        }
    }
    if (!tbody.innerHTML) tbody.innerHTML = '<tr><td colspan="6" style="color:#969696;">No quests created yet</td></tr>';
}
function editQuest(id) {
    apiCall('/quests').then(data => {
        if (data && data[id]) {
            const q = data[id];
            document.getElementById('quest-name').value = q.name || '';
            document.getElementById('quest-type').value = q.type || 'break_blocks';
            document.getElementById('quest-goal').value = q.goal || 100;
            document.getElementById('quest-reward').value = q.reward || 0;
            document.getElementById('quest-desc').value = q.description || '';
            document.getElementById('quest-rewardkit').value = q.reward_kit || '';
            document.getElementById('quest-active').checked = q.active !== false;
        }
    });
}
async function saveQuest() {
    const name = document.getElementById('quest-name').value.trim();
    if (!name) return alert('Enter a quest name');
    await apiCall('/quests', 'POST', {
        name, type: document.getElementById('quest-type').value,
        goal: parseInt(document.getElementById('quest-goal').value) || 100,
        reward: parseInt(document.getElementById('quest-reward').value) || 0,
        description: document.getElementById('quest-desc').value.trim(),
        reward_kit: document.getElementById('quest-rewardkit').value.trim(),
        active: document.getElementById('quest-active').checked
    });
    loadQuests();
}
async function deleteQuest(id) {
    if (!confirm('Delete this quest?')) return;
    await apiCall('/quests/' + id, 'DELETE');
    loadQuests();
}

// ========== ENCHANTMENTS ==========
async function loadEnchantments() {
    const data = await apiCall('/enchantments');
    const tbody = document.getElementById('enchantments-list');
    tbody.innerHTML = '';
    if (data && data.length) {
        data.forEach(e => {
            tbody.innerHTML += `<tr><td style="color:#d7ba7d;">${e.name}</td><td>${e.description}</td></tr>`;
        });
    }
}
async function applyEnchant() {
    const player = document.getElementById('enchant-player').value.trim();
    const enchant = document.getElementById('enchant-name').value;
    if (!player) return alert('Enter a player name');
    await apiCall('/enchantments/apply', 'POST', { player, enchant });
    document.getElementById('enchant-status').innerHTML = '<span style="color:#4ec9b0;">✨ Applied ' + enchant + ' to ' + player + '\'s held item</span>';
}

// ========== APPLICATIONS ==========
async function loadApplications() {
    const data = await apiCall('/applications');
    const tbody = document.getElementById('applications-list');
    tbody.innerHTML = '';
    if (data && data.length) {
        data.forEach(a => {
            const statusColor = a.status === 'approved' ? '#4ec9b0' : a.status === 'denied' ? '#d32f2f' : '#d7ba7d';
            tbody.innerHTML += `<tr>
                <td>${a.player}</td><td style="max-width:300px;word-break:break-word;">${a.message}</td><td>${a.date}</td>
                <td style="color:${statusColor};">${a.status}</td>
                <td>
                    ${a.status === 'pending' ? `<button class="action-btn" style="background:#388e3c;" onclick="reviewApp('${a.id}','approved')">✅ Approve</button> 
                    <button class="action-btn" style="background:#d32f2f;" onclick="reviewApp('${a.id}','denied')">❌ Deny</button>` : ''}
                    <button class="action-btn" style="background:#555;" onclick="deleteApp('${a.id}')">🗑️</button>
                </td></tr>`;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="color:#969696;">No applications</td></tr>';
    }
}
async function reviewApp(id, status) {
    await apiCall('/applications/' + id + '/status', 'POST', { status });
    loadApplications();
}
async function deleteApp(id) {
    if (!confirm('Delete this application?')) return;
    await apiCall('/applications/' + id, 'DELETE');
    loadApplications();
}

// ========== POLLS ==========
async function loadPolls() {
    const data = await apiCall('/polls');
    const container = document.getElementById('polls-container');
    container.innerHTML = '';
    if (data) {
        for (const [id, poll] of Object.entries(data)) {
            const options = poll.options || [];
            const votes = poll.votes || {};
            let totalVotes = 0;
            for (const v of Object.values(votes)) totalVotes += v;
            let optionsHtml = '';
            options.forEach((opt, i) => {
                const count = votes[String(i+1)] || 0;
                const pct = totalVotes > 0 ? Math.round(count / totalVotes * 100) : 0;
                optionsHtml += `<div style="margin:4px 0;"><span style="color:#d4d4d4;">${i+1}. </span> 
                    <div style="background:#333;border-radius:3px;margin-top:2px;overflow:hidden;">
                        <div style="background:#0e639c;height:20px;width:${pct}%;min-width:${count>0?'20px':'0'};border-radius:3px;text-align:right;padding-right:5px;color:#fff;font-size:11px;line-height:20px;">${pct}% (${count})</div>
                    </div></span></div>`;
            });
            container.innerHTML += `<div class="card" style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <h4 style="color:${poll.active?'#4ec9b0':'#969696'};">${poll.active?'🟢':'⚫'} ${poll.question}</h4>
                    <div><span style="color:#969696;font-size:11px;">ID: ${id} | ${totalVotes} votes</span>
                    <button class="action-btn" style="background:#d32f2f;margin-left:8px;" onclick="deletePoll('${id}')">🗑️</button></div>
                </div>
                ${optionsHtml}
            </div>`;
        }
    }
    if (!container.innerHTML) container.innerHTML = '<p style="color:#969696;">No polls created yet</p>';
}
async function savePoll() {
    const question = document.getElementById('poll-question').value.trim();
    if (!question) return alert('Enter a question');
    const options = document.getElementById('poll-options').value.split('\n').map(o => o.trim()).filter(o => o);
    if (options.length < 2) return alert('Need at least 2 options');
    await apiCall('/polls', 'POST', { question, options, active: document.getElementById('poll-active').checked });
    document.getElementById('poll-question').value = '';
    document.getElementById('poll-options').value = '';
    loadPolls();
}
async function deletePoll(id) {
    if (!confirm('Delete this poll?')) return;
    await apiCall('/polls/' + id, 'DELETE');
    loadPolls();
}

// ========== AUTO-MODERATION ==========
async function loadAutomod() {
    const data = await apiCall('/automod');
    if (data) {
        document.getElementById('automod-enabled').checked = data.enabled || false;
        document.getElementById('automod-filter-enabled').checked = data.filter_enabled || false;
        document.getElementById('automod-antispam-enabled').checked = data.antispam_enabled || false;
        document.getElementById('automod-caps-enabled').checked = data.caps_filter || false;
        document.getElementById('automod-bypass-admins').checked = data.bypass_admins !== false;
        
        document.getElementById('automod-spam-cooldown').value = data.spam_cooldown || 2;
        document.getElementById('automod-spam-threshold').value = data.spam_threshold || 4;
        document.getElementById('automod-caps-threshold').value = data.caps_threshold || 70;
        document.getElementById('automod-violation-threshold').value = data.violation_mute_threshold || 3;
        document.getElementById('automod-filter-words').value = (data.filter_words || []).join('\n');
    }
}
async function saveAutomod() {
    const filterWords = document.getElementById('automod-filter-words').value.split('\n').map(w => w.trim()).filter(w => w);
    await apiCall('/automod', 'POST', {
        enabled: document.getElementById('automod-enabled').checked,
        filter_enabled: document.getElementById('automod-filter-enabled').checked,
        antispam_enabled: document.getElementById('automod-antispam-enabled').checked,
        caps_filter: document.getElementById('automod-caps-enabled').checked,
        bypass_admins: document.getElementById('automod-bypass-admins').checked,
        filter_words: filterWords,
        spam_cooldown: parseInt(document.getElementById('automod-spam-cooldown').value) || 2,
        spam_threshold: parseInt(document.getElementById('automod-spam-threshold').value) || 4,
        caps_threshold: parseInt(document.getElementById('automod-caps-threshold').value) || 70,
        violation_mute_threshold: parseInt(document.getElementById('automod-violation-threshold').value) || 3
    });
    alert('Auto-moderation settings saved!');
}

// ========== PLAYTIME REWARDS ==========
async function loadPlaytimeRewards() {
    const data = await apiCall('/playtime-rewards');
    const tbody = document.getElementById('playtime-rewards-list');
    tbody.innerHTML = '';
    if (data) {
        for (const [id, r] of Object.entries(data)) {
            tbody.innerHTML += `<tr>
                <td>${r.name}</td><td>${r.minutes}</td><td>${r.xp}</td><td>${r.kit || '-'}</td>
                <td><button class="action-btn" style="background:#d32f2f;" onclick="deletePlaytimeReward('${id}')">🗑️</button></td>
            </tr>`;
        }
    }
    if (!tbody.innerHTML) tbody.innerHTML = '<tr><td colspan="5" style="color:#969696;">No playtime rewards set</td></tr>';
}
async function savePlaytimeReward() {
    const name = document.getElementById('ptr-name').value.trim();
    if (!name) return alert('Enter a reward name');
    await apiCall('/playtime-rewards', 'POST', {
        name, minutes: parseInt(document.getElementById('ptr-minutes').value) || 60,
        xp: parseInt(document.getElementById('ptr-xp').value) || 0,
        kit: document.getElementById('ptr-kit').value.trim()
    });
    document.getElementById('ptr-name').value = '';
    loadPlaytimeRewards();
}
async function deletePlaytimeReward(id) {
    if (!confirm('Delete this reward?')) return;
    await apiCall('/playtime-rewards/' + id, 'DELETE');
    loadPlaytimeRewards();
}

// ========== MOTD EDITOR ==========
async function loadMotd() {
    const data = await apiCall('/motd');
    if (data) {
        document.getElementById('motd-line1').value = data.line1 || '';
        document.getElementById('motd-line2').value = data.line2 || '';
        document.getElementById('motd-maxplayers').value = data.maxPlayers || 20;
        updateMotdPreview();
    }
}
async function saveMotd() {
    await apiCall('/motd', 'POST', {
        line1: document.getElementById('motd-line1').value,
        line2: document.getElementById('motd-line2').value,
        maxPlayers: parseInt(document.getElementById('motd-maxplayers').value) || 20
    });
    document.getElementById('motd-status').innerHTML = '<span style="color:#4ec9b0;">✅ MOTD saved!</span>';
    updateMotdPreview();
}
function updateMotdPreview() {
    const line1 = document.getElementById('motd-line1').value;
    const line2 = document.getElementById('motd-line2').value;
    const preview = document.getElementById('motd-preview');
    preview.innerHTML = mcColorToHtml(line1) + '<br>' + mcColorToHtml(line2);
}
function mcColorToHtml(text) {
    const colors = {'0':'#000','1':'#0000AA','2':'#00AA00','3':'#00AAAA','4':'#AA0000','5':'#AA00AA','6':'#FFAA00','7':'#AAAAAA','8':'#555555','9':'#5555FF','a':'#55FF55','b':'#55FFFF','c':'#FF5555','d':'#FF55FF','e':'#FFFF55','f':'#FFFFFF'};
    let result = '';
    let color = '#AAAAAA';
    let bold = false, italic = false, underline = false;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '&' && i+1 < text.length) {
            const code = text[i+1].toLowerCase();
            if (colors[code]) { color = colors[code]; i++; continue; }
            if (code === 'l') { bold = true; i++; continue; }
            if (code === 'o') { italic = true; i++; continue; }
            if (code === 'n') { underline = true; i++; continue; }
            if (code === 'r') { color = '#AAAAAA'; bold = false; italic = false; underline = false; i++; continue; }
        }
        let style = `color:;`;
        if (bold) style += 'font-weight:bold;';
        if (italic) style += 'font-style:italic;';
        if (underline) style += 'text-decoration:underline;';
        result += `<span style="${style}">${text[i]}</span>`;
    }
    return result || '<span style="color:#555;">Empty</span>';
}
// Live MOTD preview
document.addEventListener('DOMContentLoaded', () => {
    const l1 = document.getElementById('motd-line1');
    const l2 = document.getElementById('motd-line2');
    if (l1) l1.addEventListener('input', updateMotdPreview);
    if (l2) l2.addEventListener('input', updateMotdPreview);
});

// ========== DAILY LOGIN REWARDS ==========
async function loadDailyLogin() {
    const data = await apiCall('/daily-login');
    document.getElementById('daily-login-enabled').checked = data.enabled;
    document.getElementById('daily-login-base-xp').value = data.baseXp || 10;
    document.getElementById('daily-login-streak-bonus').value = data.streakBonus || 2;
    const tbody = document.getElementById('daily-login-table');
    tbody.innerHTML = '';
    (data.players || []).forEach(p => {
        tbody.innerHTML += `<tr><td>${p.name}</td><td>${p.streak}</td><td>${p.total}</td><td>${new Date(p.last).toLocaleString()}</td></tr>`;
    });
}
async function saveDailyLogin() {
    await apiCall('/daily-login', 'POST', {
        enabled: document.getElementById('daily-login-enabled').checked,
        baseXp: parseInt(document.getElementById('daily-login-base-xp').value),
        streakBonus: parseInt(document.getElementById('daily-login-streak-bonus').value)
    });
    document.getElementById('daily-login-status').textContent = 'Settings saved!';
}

// ========== AUCTION HOUSE ==========
async function loadAuctions() {
    const data = await apiCall('/auctions');
    const tbody = document.getElementById('auction-table');
    tbody.innerHTML = '';
    (data || []).forEach(a => {
        const remaining = Math.max(0, Math.round((a.endTime - Date.now()) / 60000));
        tbody.innerHTML += `<tr><td>${a.amount}x ${a.item}</td><td>${a.sellerName}</td><td>${a.currentBid} XP</td><td>${a.highBidderName}</td><td>${remaining} min</td><td><button class="btn-danger" onclick="deleteAuction('${a.id}')">Delete</button></td></tr>`;
    });
}
async function createAuction() {
    await apiCall('/auctions', 'POST', {
        item: document.getElementById('auction-item').value,
        amount: parseInt(document.getElementById('auction-amount').value),
        startBid: parseInt(document.getElementById('auction-start-bid').value),
        bidIncrement: parseInt(document.getElementById('auction-bid-inc').value),
        duration: parseInt(document.getElementById('auction-duration').value)
    });
    document.getElementById('auction-status').textContent = 'Auction created!';
    loadAuctions();
}
async function deleteAuction(id) {
    await apiCall('/auctions/' + id, 'DELETE');
    loadAuctions();
}

// ========== NICKNAMES ==========
async function loadNicknames() {
    const data = await apiCall('/nicknames');
    const tbody = document.getElementById('nick-table');
    tbody.innerHTML = '';
    (data || []).forEach(n => {
        tbody.innerHTML += `<tr><td>${n.name}</td><td>${n.nick}</td></tr>`;
    });
}
async function setNickname() {
    await apiCall('/nicknames', 'POST', {
        player: document.getElementById('nick-player').value,
        nick: document.getElementById('nick-value').value
    });
    document.getElementById('nick-status').textContent = 'Nickname set!';
    loadNicknames();
}
async function clearNickname() {
    await apiCall('/nicknames', 'POST', {
        player: document.getElementById('nick-player').value,
        nick: ''
    });
    document.getElementById('nick-status').textContent = 'Nickname cleared!';
    loadNicknames();
}

// ========== CHAT TAGS ==========
async function loadChatTags() {
    const data = await apiCall('/chat-tags');
    const tbody = document.getElementById('tag-table');
    tbody.innerHTML = '';
    (data.tags || []).forEach(t => {
        tbody.innerHTML += `<tr><td>${t.name}</td><td>${t.tag}</td></tr>`;
    });
    const aList = document.getElementById('available-tags-list');
    aList.innerHTML = '<strong>Available Tags:</strong> ';
    (data.available || []).forEach(tag => {
        aList.innerHTML += `<span style="background:#2d2d2d;padding:3px 8px;border-radius:4px;margin:2px;display:inline-block;"> <button onclick="removeAvailableTag('${tag.replace(/'/g, "\'")}')" style="background:none;border:none;color:#e74c3c;cursor:pointer;">×</button></span>`;
    });
}
async function addAvailableTag() {
    await apiCall('/chat-tags', 'POST', { action: 'add_available', tag: document.getElementById('tag-new').value });
    document.getElementById('tag-new').value = '';
    loadChatTags();
}
async function removeAvailableTag(tag) {
    await apiCall('/chat-tags', 'POST', { action: 'remove_available', tag });
    loadChatTags();
}
async function setPlayerTag() {
    await apiCall('/chat-tags', 'POST', {
        action: 'set',
        player: document.getElementById('tag-player').value,
        tag: document.getElementById('tag-value').value
    });
    document.getElementById('tag-status').textContent = 'Tag set!';
    loadChatTags();
}
async function clearPlayerTag() {
    await apiCall('/chat-tags', 'POST', {
        action: 'set',
        player: document.getElementById('tag-player').value,
        tag: ''
    });
    document.getElementById('tag-status').textContent = 'Tag cleared!';
    loadChatTags();
}

// ========== SERVER RULES ==========
async function loadServerRules() {
    const data = await apiCall('/rules');
    document.getElementById('rules-textarea').value = (data.rules || []).join('\n');
}
async function saveRules() {
    const rules = document.getElementById('rules-textarea').value.split('\n').filter(r => r.trim());
    await apiCall('/rules', 'POST', { rules });
    document.getElementById('rules-status').textContent = 'Rules saved!';
}

// ========== PLAYER WARPS ==========
async function loadPlayerWarps() {
    const data = await apiCall('/player-warps');
    document.getElementById('pwarp-cost').value = data.cost || 5;
    document.getElementById('pwarp-max').value = data.max || 3;
    const tbody = document.getElementById('pwarp-table');
    tbody.innerHTML = '';
    (data.warps || []).forEach(w => {
        tbody.innerHTML += `<tr><td>${w.name}</td><td>${w.ownerName}</td><td>${w.world} (${Math.round(w.x)}, ${Math.round(w.y)}, ${Math.round(w.z)})</td><td>${w.visits}</td><td><button class="btn-danger" onclick="deletePwarp('${w.id}')">Delete</button></td></tr>`;
    });
}
async function savePwarpSettings() {
    await apiCall('/player-warps/settings', 'POST', {
        cost: parseInt(document.getElementById('pwarp-cost').value),
        max: parseInt(document.getElementById('pwarp-max').value)
    });
    document.getElementById('pwarp-status').textContent = 'Settings saved!';
}
async function deletePwarp(id) {
    await apiCall('/player-warps/' + id, 'DELETE');
    loadPlayerWarps();
}

// ========== CUSTOM RECIPES ==========
async function loadCustomRecipes() {
    const data = await apiCall('/custom-recipes');
    const tbody = document.getElementById('recipe-table');
    tbody.innerHTML = '';
    (data || []).forEach(r => {
        tbody.innerHTML += `<tr><td>${r.name}</td><td>${r.resultAmount}x ${r.result}</td><td>${(r.ingredients || []).join(', ')}</td><td><button class="btn-danger" onclick="deleteRecipe('${r.id}')">Delete</button></td></tr>`;
    });
}
async function createRecipe() {
    const ingredients = document.getElementById('recipe-ingredients').value.split(',').map(s => s.trim()).filter(s => s);
    await apiCall('/custom-recipes', 'POST', {
        name: document.getElementById('recipe-name').value,
        result: document.getElementById('recipe-result').value,
        resultAmount: parseInt(document.getElementById('recipe-amount').value),
        ingredients
    });
    document.getElementById('recipe-status').textContent = 'Recipe created!';
    loadCustomRecipes();
}
async function deleteRecipe(id) {
    await apiCall('/custom-recipes/' + id, 'DELETE');
    loadCustomRecipes();
}

// ========== PVP STATS ==========
async function loadPvpStats() {
    const data = await apiCall('/pvp-stats');
    const tbody = document.getElementById('pvp-table');
    tbody.innerHTML = '';
    (data || []).forEach((s, i) => {
        const kd = s.deaths > 0 ? (s.kills / s.deaths).toFixed(2) : s.kills;
        tbody.innerHTML += `<tr><td>${i + 1}</td><td>${s.name}</td><td>${s.kills}</td><td>${s.deaths}</td><td>${kd}</td><td>${s.streak}</td><td>${s.bestStreak}</td></tr>`;
    });
}

// ========== ACHIEVEMENTS ==========
async function loadAchievements() {
    const data = await apiCall('/achievements');
    const defTbody = document.getElementById('ach-def-table');
    defTbody.innerHTML = '';
    (data.definitions || []).forEach(a => {
        defTbody.innerHTML += `<tr><td>${a.id}</td><td>${a.name}</td><td>${a.description}</td><td>${a.title}</td><td>${a.xpReward}</td><td><button class="btn-danger" onclick="deleteAchievement('${a.id}')">Delete</button></td></tr>`;
    });
    const progTbody = document.getElementById('ach-progress-table');
    progTbody.innerHTML = '';
    (data.unlocked || []).forEach(p => {
        progTbody.innerHTML += `<tr><td>${p.name}</td><td>${(p.achievements || []).join(', ') || 'None'}</td></tr>`;
    });
}
async function createAchievement() {
    await apiCall('/achievements', 'POST', {
        id: document.getElementById('ach-id').value,
        name: document.getElementById('ach-name').value,
        description: document.getElementById('ach-desc').value,
        title: document.getElementById('ach-title').value,
        xpReward: parseInt(document.getElementById('ach-xp').value)
    });
    document.getElementById('ach-status').textContent = 'Achievement created!';
    loadAchievements();
}
async function deleteAchievement(id) {
    await apiCall('/achievements/' + id, 'DELETE');
    loadAchievements();
}

// ========== DUELS ==========
async function loadDuels() {
    const data = await apiCall('/duels');
    const tbody = document.getElementById('duel-table');
    tbody.innerHTML = '';
    (data.active || []).forEach(d => {
        tbody.innerHTML += `<tr><td>${d.player1}</td><td>${d.player2}</td><td>${d.wager > 0 ? d.wager + ' XP' : 'None'}</td></tr>`;
    });
    const statsTbody = document.getElementById('duel-stats-table');
    statsTbody.innerHTML = '';
    (data.stats || []).forEach(s => {
        statsTbody.innerHTML += `<tr><td>${s.name}</td><td>${s.kills}</td><td>${s.deaths}</td></tr>`;
    });
}

// ========== WELCOME SETTINGS ==========
async function loadWelcomeSettings() {
    const data = await apiCall('/welcome');
    document.getElementById('welcome-msg').value = data.message || '';
    document.getElementById('welcome-broadcast').checked = data.broadcast !== false;
    document.getElementById('welcome-items').value = (data.starterItems || []).join('\n');
    const tbody = document.getElementById('welcome-table');
    tbody.innerHTML = '';
    (data.firstJoins || []).forEach(fj => {
        tbody.innerHTML += `<tr><td>${fj.name}</td><td>${new Date(fj.time).toLocaleString()}</td></tr>`;
    });
}
async function saveWelcome() {
    const items = document.getElementById('welcome-items').value.split('\n').filter(s => s.trim());
    await apiCall('/welcome', 'POST', {
        message: document.getElementById('welcome-msg').value,
        broadcast: document.getElementById('welcome-broadcast').checked,
        starterItems: items
    });
    document.getElementById('welcome-status').textContent = 'Welcome settings saved!';
}

// ========== INACTIVE ALERTS ==========
async function loadInactiveAlerts() {
    const data = await apiCall('/inactive-players');
    document.getElementById('inactive-days').value = data.thresholdDays || 14;
    const tbody = document.getElementById('inactive-table');
    tbody.innerHTML = '';
    (data.players || []).forEach(p => {
        tbody.innerHTML += `<tr><td>${p.name}</td><td>${new Date(p.lastSeen).toLocaleString()}</td><td style="color:${p.daysSince > 30 ? '#e74c3c' : '#f39c12'}">${p.daysSince} days</td></tr>`;
    });
}
async function saveInactiveSettings() {
    await apiCall('/inactive-players/settings', 'POST', {
        thresholdDays: parseInt(document.getElementById('inactive-days').value)
    });
    document.getElementById('inactive-status').textContent = 'Settings saved!';
    loadInactiveAlerts();
}

// ========== SCHEDULED ANNOUNCEMENTS ==========
async function loadSchedAnnouncements() {
    const data = await apiCall('/announcements');
    if (!data) return;
    document.getElementById('announce-enabled').checked = data.enabled;
    document.getElementById('announce-interval').value = data.intervalMinutes || 5;
    document.getElementById('announce-prefix').value = data.prefix || '&6[&eAnnouncement&6]&r ';
    document.getElementById('announce-messages').value = (data.messages || []).join('\n');
}
async function saveAnnouncements() {
    const messages = document.getElementById('announce-messages').value.split('\n').filter(s => s.trim());
    await apiCall('/announcements', 'POST', {
        enabled: document.getElementById('announce-enabled').checked,
        intervalMinutes: parseInt(document.getElementById('announce-interval').value),
        prefix: document.getElementById('announce-prefix').value,
        messages
    });
    document.getElementById('announce-status').textContent = 'Announcements saved!';
}

// Auto-load overview on page load
(async () => {
    await loadUserDetails();

    const savedTab = localStorage.getItem('activeTab');
    const savedTabButton = savedTab ? document.querySelector(`.nav-btn[onclick*="'${savedTab}'"]`) : null;

    if (savedTab && document.getElementById(savedTab) && savedTabButton) {
        const parentGroup = savedTabButton.closest('.nav-group-items');
        if (parentGroup && parentGroup.classList.contains('collapsed')) {
            const groupBtn = parentGroup.previousElementSibling;
            toggleNavGroup(groupBtn);
        }
        switchTab(savedTab, savedTabButton);
    } else {
        switchTab('overview', document.querySelector('.nav-btn[onclick*="\'overview\'"]'));
    }

    const response = await apiCall('/players');
    if (response && response.players) {
        updatePlayerDatalist(response.players.map(p => p.name));
    }
})();