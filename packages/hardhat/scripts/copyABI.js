const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'artifacts', 'contracts');
const destDir = path.join(__dirname, '..', '..', 'nextjs', 'generated');

if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
}

const abiPath = path.join(sourceDir, 'perennialprediction.sol', 'perennialprediction.json');
const destPath = path.join(destDir, 'perennialpredictionABI.json');

try {
    const contractArtifact = require(abiPath);
    if (!contractArtifact || !contractArtifact.abi) {
        throw new Error('ABI not found in contract artifact');
    }
    const abiOnly = { abi: contractArtifact.abi };

    fs.writeFileSync(destPath, JSON.stringify(abiOnly, null, 2));
    console.log('ABI file copied successfully to:', destPath);
    console.log('ABI content:', JSON.stringify(abiOnly, null, 2));
} catch (error) {
    console.error('Error copying ABI:', error);
    process.exit(1);
}
