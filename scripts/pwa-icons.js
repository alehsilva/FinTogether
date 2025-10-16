const fs = require('fs');
const path = require('path');

/**
 * FinTogether - Utilitário de Ícones PWA
 * Script consolidado para gerenciar ícones do projeto
 */

const publicDir = path.join(__dirname, '..', 'public');
const splashDir = path.join(publicDir, 'splash_screens');

function updateIconsFromSplash() {
    console.log('🎨 Atualizando ícones do PWA...');

    const sourceIcon = path.join(splashDir, 'icon.png');

    if (!fs.existsSync(sourceIcon)) {
        console.error('❌ Ícone fonte não encontrado:', sourceIcon);
        return false;
    }

    const targetFiles = [
        'favicon.png',
        'icon-48x48.png',
        'icon-72x72.png',
        'icon-96x96.png',
        'icon-144x144.png',
        'icon-192.png',
        'icon-256x256.png',
        'icon-384x384.png',
        'icon-512x512.png'
    ];

    let success = 0;

    targetFiles.forEach(filename => {
        const targetPath = path.join(publicDir, filename);
        try {
            fs.copyFileSync(sourceIcon, targetPath);
            success++;
            console.log(`✅ ${filename}`);
        } catch (error) {
            console.error(`❌ ${filename}:`, error.message);
        }
    });

    console.log(`🎯 ${success}/${targetFiles.length} ícones atualizados`);
    return success === targetFiles.length;
}

function checkPWAStatus() {
    console.log('📋 Verificando status do PWA...');

    const essentialFiles = [
        'favicon.png',
        'icon-192.png',
        'icon-512x512.png',
        'manifest.json'
    ];

    let allGood = true;

    essentialFiles.forEach(file => {
        const filePath = path.join(publicDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
        } else {
            console.log(`❌ ${file} (não encontrado)`);
            allGood = false;
        }
    });

    return allGood;
}

// Executar baseado no argumento
const command = process.argv[2];

switch (command) {
    case 'update':
        updateIconsFromSplash();
        break;
    case 'check':
        const status = checkPWAStatus();
        console.log(status ? '🚀 PWA pronto!' : '⚠️ PWA com problemas');
        break;
    default:
        console.log('🛠️ FinTogether - Utilitário de Ícones');
        console.log('');
        console.log('Comandos disponíveis:');
        console.log('  node scripts/pwa-icons.js update  - Atualiza ícones da pasta splash');
        console.log('  node scripts/pwa-icons.js check   - Verifica status do PWA');
        console.log('');
        console.log('Ou adicione ao package.json:');
        console.log('  "icons:update": "node scripts/pwa-icons.js update"');
        console.log('  "icons:check": "node scripts/pwa-icons.js check"');
}
