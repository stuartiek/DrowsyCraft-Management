const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const fs = require('fs');

// --- WEB PUSH SETUP ---
let webpush;
try {
    webpush = require('web-push');
} catch (e) {
    console.warn("⚠️  'web-push' is not installed. Advanced Push Notifications disabled. Run 'npm install web-push' to enable.");
}

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;
// TARGET: The Minecraft Server's API URL.
// If hosting on Hostinger, you MUST set MINECRAFT_API_URL to your Oracle Public IP.
// Example: 'http://123.45.67.89:8091'
let MINECRAFT_SERVER_URL = process.env.MINECRAFT_API_URL || 'http://123.100.227.205:8091'; 

// Ensure protocol is present to prevent proxy errors
if (!MINECRAFT_SERVER_URL.startsWith('http')) {
    MINECRAFT_SERVER_URL = `http://${MINECRAFT_SERVER_URL}`;
}

// Auto-append the default API port if it was omitted from the environment variable
try {
    const targetUrl = new URL(MINECRAFT_SERVER_URL);
    if (!targetUrl.port) {
        targetUrl.port = '8091';
        MINECRAFT_SERVER_URL = targetUrl.origin;
    }
} catch (error) {
    console.error("⚠️ Invalid MINECRAFT_API_URL provided:", error.message);
}

// --- VIEW ENGINE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (webpush) {
    // Auto-generate or load VAPID keys for Web Push
    const vapidPath = path.join(__dirname, 'vapid.json');
    let vapidKeys;
    if (fs.existsSync(vapidPath)) {
        vapidKeys = JSON.parse(fs.readFileSync(vapidPath));
    } else {
        vapidKeys = webpush.generateVAPIDKeys();
        fs.writeFileSync(vapidPath, JSON.stringify(vapidKeys));
    }
    webpush.setVapidDetails('mailto:admin@drowsycraft.com', vapidKeys.publicKey, vapidKeys.privateKey);

    // Manage push subscriptions
    const subsPath = path.join(__dirname, 'subscriptions.json');
    let subscriptions = fs.existsSync(subsPath) ? JSON.parse(fs.readFileSync(subsPath)) : [];

    app.get('/push/public-key', (req, res) => {
        res.send(vapidKeys.publicKey);
    });

    app.post('/push/subscribe', express.json(), (req, res) => {
        const subscription = req.body;
        // Avoid duplicate subscriptions from the same device
        if (!subscriptions.some(s => s.endpoint === subscription.endpoint)) {
            subscriptions.push(subscription);
            fs.writeFileSync(subsPath, JSON.stringify(subscriptions));
            console.log(`✅ [Web Push] New device subscribed! Total devices: ${subscriptions.length}`);
        } else {
            console.log(`ℹ️ [Web Push] Device refreshed its subscription.`);
        }
        res.status(201).json({});
    });

    app.post('/push/notify', express.json(), (req, res) => {
        console.log(`\n🔔 [Web Push] Alert Triggered: ${req.body.title}`);
        console.log(`📡 [Web Push] Sending to ${subscriptions.length} connected devices...`);
        const payload = JSON.stringify(req.body);
        
        Promise.all(subscriptions.map(sub => webpush.sendNotification(sub, payload).catch(err => {
            if (err.statusCode === 410 || err.statusCode === 404) {
                subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
            }
        }))).then(() => {
            fs.writeFileSync(subsPath, JSON.stringify(subscriptions));
            res.status(200).json({ success: true, recipients: subscriptions.length });
        });
    });
}

// --- STATIC ASSETS ---
app.use(express.static(path.join(__dirname, 'public')));

// --- API PROXY ---
// Support both the new internal prefix and the legacy /api prefix so cached clients can still log in.
const apiProxy = createProxyMiddleware({
    target: MINECRAFT_SERVER_URL,
    changeOrigin: true,
    ws: true, // Enable Websockets for Console
    logLevel: 'debug',
    pathRewrite: (path, req) => {
        if (path === '/' || path === '') {
            return '/api';
        }
        return `/api${path.startsWith('/') ? path : `/${path}`}`;
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> Status: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error(`[Proxy Error] Could not connect to ${MINECRAFT_SERVER_URL}${req.url}`);
        console.error(`Reason: ${err.code || err.message}`);
        if (err.code === 'ECONNREFUSED') {
             console.error("Hint: Is the Minecraft server running? Is the plugin loaded?");
        }
        res.status(503).json({ error: `Minecraft Server Unreachable (${err.code}): ${err.message}` });
    }
});

app.use('/panel-api', apiProxy);
app.use('/api', apiProxy);

// --- ROUTES ---
app.get('/', (req, res) => {
    res.render('pages/index'); 
});

app.get('/dashboard', (req, res) => {
    res.render('pages/dashboard');
});

// --- PWA ASSETS ---
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 DrowsyCraft Web Panel running on port ${PORT}`);
    console.log(`🔗 Proxy Target: ${MINECRAFT_SERVER_URL}`);
    if (MINECRAFT_SERVER_URL.includes('127.0.0.1') || MINECRAFT_SERVER_URL.includes('localhost')) {
        console.log("ℹ️  Running in Local Mode. Ensure Minecraft server is on this machine.");
    } else {
        console.log("ℹ️  Running in Remote Mode. Ensure Port Forwarding is active on the target.");
    }
});