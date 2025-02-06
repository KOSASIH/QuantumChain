// services/smartContractAuditService.js

const express = require('express');
const { exec } = require('child_process');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Endpoint to upload smart contract for auditing
app.post('/audit', async (req, res) => {
    const { contractName, sourceCode } = req.body;

    if (!contractName || !sourceCode) {
        return res.status(400).send('Invalid input');
    }

    const contractPath = path.join(__dirname, 'contracts', `${contractName}.sol`);
    
    // Save the contract source code to a file
    fs.writeFileSync(contractPath, sourceCode);

    try {
        // Run static analysis (e.g., using MythX or Slither)
        const analysisResult = await runStaticAnalysis(contractPath);
        
        // Run automated tests (if applicable)
        const testResult = await runAutomatedTests(contractPath);

        // Generate audit report
        const report = generateAuditReport(analysisResult, testResult);

        // Clean up: remove the contract file after auditing
        fs.unlinkSync(contractPath);

        res.status(200).json(report);
    } catch (error) {
        console.error('Error during audit:', error);
        res.status(500).send('Error during audit');
    }
});

// Function to run static analysis
function runStaticAnalysis(contractPath) {
    return new Promise((resolve, reject) => {
        // Example command for Slither
        exec(`slither ${contractPath}`, (error, stdout, stderr) => {
            if (error) {
                return reject(`Static analysis error: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

// Function to run automated tests
function runAutomatedTests(contractPath) {
    return new Promise((resolve, reject) => {
        // Example command for Truffle tests
        exec(`truffle test --contracts_build_directory ${path.dirname(contractPath)}`, (error, stdout, stderr) => {
            if (error) {
                return reject(`Test execution error: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

// Function to generate audit report
function generateAuditReport(analysisResult, testResult) {
    return {
        analysis: analysisResult,
        tests: testResult,
        timestamp: new Date(),
    };
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Smart Contract Audit Service is running on port ${PORT}`);
});
