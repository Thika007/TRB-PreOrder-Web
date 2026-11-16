const path = require('path');
const fs = require('fs');

/**
 * Robust Environment Variable Loader
 * Discovers external .env file whether running via node or as a compiled standalone .exe
 */
function loadEnvironment() {
    const exeDir = path.dirname(process.execPath);
    const cwd = process.cwd();
    const sourceDir = path.join(__dirname, '../../');

    const candidates = [
        path.join(exeDir, '.env'),
        path.join(exeDir, 'database_config.env'),
        path.join(cwd, '.env'),
        path.join(sourceDir, '.env')
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            require('dotenv').config({ path: p, override: true });
            console.log(`📋 [Config] Active external configuration: ${p}`);
            return p;
        }
    }

    require('dotenv').config();
    return null;
}

loadEnvironment();

module.exports = { loadEnvironment };
