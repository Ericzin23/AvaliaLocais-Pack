const fs = require('fs');
const os = require('os');
const path = require('path');

function getLocalIp() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const ip = iface.address;
        if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.match(/^172\.(1[6-9]|2\d|3[0-1])\./)) {
          return ip;
        }
      }
    }
  }
  return null;
}

function main() {
  const appJsonPath = path.resolve(__dirname, '..', 'app.json');
  const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));

  const ip = getLocalIp();
  if (!ip) {
    console.warn('[set-api-url] Não foi possível detectar IP local privado. Mantendo valor atual.');
    return;
  }
  const url = `http://${ip}:8080`;

  if (!app.expo) app.expo = {};
  if (!app.expo.extra) app.expo.extra = {};
  app.expo.extra.API_URL = url;

  fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2));
  console.log(`[set-api-url] API_URL atualizado para: ${url}`);
}

main();
