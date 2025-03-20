const { randomBytes } = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Generate a secure random key
function generateSecureKey(length = 32) {
    return randomBytes(length).toString('hex');
}

// Get KV namespace ID from wrangler.jsonc
function getNamespaceId() {
    try {
        // Handle comments in JSON by removing them (since wrangler.jsonc may contain comments)
        const configPath = path.join(__dirname, '..', 'wrangler.jsonc');
        const configContent = fs.readFileSync(configPath, 'utf8');
        const jsonContent = configContent.replace(/\/\/.*$/gm, ''); // Remove comments

        const wranglerConfig = JSON.parse(jsonContent);
        const apiKeysNamespace = wranglerConfig.kv_namespaces.find(kv => kv.binding === 'API_KEYS');

        if (!apiKeysNamespace || !apiKeysNamespace.id) {
            throw new Error('Could not find API_KEYS namespace ID in wrangler.jsonc');
        }

        return apiKeysNamespace.binding;
    } catch (error) {
        console.error('Error reading wrangler config:', error.message);
        process.exit(1);
    }
}

// Save key to KV namespace
async function saveKeyToKV(namespaceId, key) {
    try {
        const command = `npx wrangler kv key put --binding=${namespaceId} "admin_secret_key" "${key}"`;
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error('Error saving key to KV:', error);
        return false;
    }
}

// Check if key exists
async function checkKeyExists(namespaceId) {
    try {
        const command = `npx wrangler kv:key get --namespace-id=${namespaceId} "admin_secret_key"`;
        const result = execSync(command, { stdio: ['pipe', 'pipe', 'pipe'] });
        return result.toString().trim() !== '';
    } catch (error) {
        return false;
    }
}

// Main menu
function showMenu() {
    console.log('\n🔐 Admin Key Manager 🔐');
    console.log('1. Generate new admin key');
    console.log('2. Check if admin key exists');
    console.log('3. Rotate admin key');
    console.log('4. Exit');

    rl.question('\nSelect an option: ', (answer) => {
        switch (answer) {
            case '1':
                generateNewKey();
                break;
            case '2':
                checkKey();
                break;
            case '3':
                rotateKey();
                break;
            case '4':
                rl.close();
                break;
            default:
                console.log('Invalid option, please try again.');
                showMenu();
        }
    });
}

// Generate new key
async function generateNewKey() {
    const namespaceId = getNamespaceId();
    const exists = await checkKeyExists(namespaceId);

    if (exists) {
        rl.question('⚠️ Admin key already exists. Overwrite? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y') {
                const key = generateSecureKey();
                const success = await saveKeyToKV(namespaceId, key);

                if (success) {
                    console.log('\n✅ New admin key generated and stored successfully!');
                    console.log('\n🔑 Your new admin key is: ' + key);
                    console.log('\n⚠️ IMPORTANT: Save this key in a secure location. It will not be shown again.');
                }
            }
            showMenu();
        });
    } else {
        const key = generateSecureKey();
        const success = await saveKeyToKV(namespaceId, key);

        if (success) {
            console.log('\n✅ Admin key generated and stored successfully!');
            console.log('\n🔑 Your admin key is: ' + key);
            console.log('\n⚠️ IMPORTANT: Save this key in a secure location. It will not be shown again.');
        }
        showMenu();
    }
}

// Check if key exists
async function checkKey() {
    const namespaceId = getNamespaceId();
    const exists = await checkKeyExists(namespaceId);

    if (exists) {
        console.log('\n✅ Admin key exists in KV storage.');
    } else {
        console.log('\n❌ No admin key found in KV storage.');
    }

    showMenu();
}

// Rotate key
async function rotateKey() {
    const namespaceId = getNamespaceId();
    const exists = await checkKeyExists(namespaceId);

    if (!exists) {
        console.log('\n❌ No admin key found to rotate. Please generate a new key instead.');
        showMenu();
        return;
    }

    rl.question('⚠️ This will replace the existing admin key. Continue? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
            const key = generateSecureKey();
            const success = await saveKeyToKV(namespaceId, key);

            if (success) {
                console.log('\n✅ Admin key rotated successfully!');
                console.log('\n🔑 Your new admin key is: ' + key);
                console.log('\n⚠️ IMPORTANT: Save this key in a secure location. It will not be shown again.');
            }
        }
        showMenu();
    });
}

// Start the script
showMenu();