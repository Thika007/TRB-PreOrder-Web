const path = require('path');
const fs = require('fs');

/**
 * Custom robust parser for .env files.
 * Correctly preserves passwords/usernames containing '#' or special characters (e.g. 'danu#', 'danu#dmz123')
 * even if the user forgot to wrap them in double quotes.
 */
function parseEnvFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith('#') || line.startsWith(';')) continue;

            const eqIdx = line.indexOf('=');
            if (eqIdx === -1) continue;

            const key = line.substring(0, eqIdx).trim();
            let val = line.substring(eqIdx + 1).trim();

            // If value is enclosed in quotes ("..." or '...'), unwrap and preserve exact characters
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.substring(1, val.length - 1);
            } else {
                // For unquoted values:
                // Only treat # as a comment delimiter if it is preceded by whitespace (e.g. 'PORT=5000 # Server port')
                // If # is connected without space (e.g. 'danu#', 'danu#dmz123'), preserve as literal value!
                const commentMatch = val.match(/\s+#.*$/);
                if (commentMatch) {
                    val = val.substring(0, commentMatch.index).trim();
                }
            }

            process.env[key] = val;
        }
    } catch (err) {
        console.warn(`⚠️ [Config] Failed to parse ${filePath}:`, err.message);
    }
}

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
            // Apply standard dotenv first as base, then override with custom parser to preserve '#' and special chars
            require('dotenv').config({ path: p, override: true });
            parseEnvFile(p);
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

module.exports = { loadEnvironment, parseEnvFile };
