const axios = require('axios');

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

const RUNTIME_MAP = {
    javascript: { language: 'javascript', version: '18.15.0' },
    typescript: { language: 'typescript', version: '5.0.3' },
    python: { language: 'python', version: '3.10.0' },
    rust: { language: 'rust', version: '1.68.2' },
    go: { language: 'go', version: '1.16.2' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'c++', version: '10.2.0' },
};

// Execute code using Piston API
exports.executeCode = async (language, code, stdin = '') => {
    try {
        const runtime = RUNTIME_MAP[language];

        if (!runtime) {
            throw new Error(`Unsupported language: ${language}`);
        }

        const response = await axios.post(`${PISTON_API_URL}/execute`, {
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
            stdin,
        });

        return {
            success: true,
            output: response.data.run.stdout || response.data.run.stderr || '',
            stderr: response.data.run.stderr || '',
            exitCode: response.data.run.code,
        };
    } catch (error) {
        return {
            success: false,
            output: '',
            stderr: error.message || 'Execution failed',
            exitCode: 1,
        };
    }
};
