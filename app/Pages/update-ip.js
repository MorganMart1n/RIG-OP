const os = require('os');
const fs = require('fs');

const networkInterfaces = os.networkInterfaces();
let ip = '127.0.0.1';

// Find the first non-internal IPv4 address
for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            ip = iface.address;
            break;
        }
    }
}

const envContent = `API_URL=http://${ip}:3000\n`;
fs.writeFileSync('.env', envContent);
console.log(`Updated .env with IP: ${ip}`);