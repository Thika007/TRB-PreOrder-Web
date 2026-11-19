const path = require('path');
const fs = require('fs');

/**
 * Robust Environment Variable Loader
 * Strictly discovers external .env file and never silently falls back to hardcoded secrets.
 */
function loadEnvironment() {
    const exeDir = path.dirname(process.execPath);
    const cwd = process.cwd();
    const sourceDir = path.join(__dirname, '../../');

    const candidates = [
        path.join(cwd, 'backend', '.env'),
        path.join(cwd, '.env'),
        path.join(exeDir, '.env'),
        path.join(exeDir, '..', '.env'),
        path.join(exeDir, '..', 'backend', '.env'),
        path.join(sourceDir, '.env'),
        path.join(sourceDir, 'backend', '.env'),
        path.join(cwd, 'backend', 'database_config.env'),
        path.join(cwd, 'database_config.env'),
        path.join(exeDir, 'database_config.env')
    ];

    let foundPath = null;
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            require('dotenv').config({ path: p, override: true });
            foundPath = p;
            break;
        }
    }

    if (foundPath) {
        console.log(`====================================================`);
        console.log(`📋 [Config] Active .env file loaded successfully!`);
        console.log(`   Path: ${foundPath}`);
        console.log(`   DB_SERVER   : ${process.env.DB_SERVER || '[NOT CONFIGURED]'}`);
        console.log(`   DB_NAME     : ${process.env.DB_NAME || '[NOT CONFIGURED]'}`);
        console.log(`   DB_USER     : ${process.env.DB_USER || '[NOT CONFIGURED]'}`);
        console.log(`   DB_PORT     : ${process.env.DB_PORT || '[DEFAULT: 1433 / Dynamic]'}`);
        console.log(`   PORT (HTTP) : ${process.env.PORT || '5000'}`);
        console.log(`====================================================`);
        return foundPath;
    }

    // Attempt default dotenv resolution
    require('dotenv').config();

    console.warn(`====================================================`);
    console.warn(`⚠️ [Config WARNING] No external .env file found in expected paths:`);
    candidates.slice(0, 5).forEach(c => console.warn(`   - ${c}`));
    console.warn(`   Please make sure '.env' exists in the 'backend/' folder.`);
    console.warn(`====================================================`);
    return null;
}

loadEnvironment();

module.exports = { loadEnvironment };
