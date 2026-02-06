
const DEPT_MAP = {
    // CSE
    'CSR': 'Computer Science and Engineering',
    'CSE': 'Computer Science and Engineering',

    // IT
    'ITR': 'Information Technology',
    'IT': 'Information Technology',

    // CSD
    'CSD': 'Computer Science and Design',

    // AIDS
    'ADR': 'Artificial Intelligence and Data Science',
    'ADS': 'Artificial Intelligence and Data Science',

    // AIML
    'ALR': 'Artificial Intelligence and Machine Learning',
    'AIM': 'Artificial Intelligence and Machine Learning',

    // ECE
    'ECR': 'Electronics and Communication Engineering',
    'ECE': 'Electronics and Communication Engineering',

    // EEE
    'EER': 'Electrical and Electronics Engineering',
    'EEE': 'Electrical and Electronics Engineering',

    // EIE
    'EIR': 'Electronics and Instrumentation Engineering',
    'EIE': 'Electronics and Instrumentation Engineering',

    // CIVIL
    'CER': 'Civil Engineering',
    'CE': 'Civil Engineering',

    // MECH
    'MER': 'Mechanical Engineering',
    'MECH': 'Mechanical Engineering',

    // MTS
    'MTS': 'Mechatronics Engineering',

    // CHEMICAL
    'CHR': 'Chemical Engineering',
    'CHEM': 'Chemical Engineering',

    // FOOD TECH
    'FTR': 'Food Technology',
    'FT': 'Food Technology',

    // AUTO
    'AUR': 'Automobile Engineering',
    'AUTO': 'Automobile Engineering'
};

export const parseStudentDetails = (name) => {
    if (!name) return { rollNo: null, department: null };

    const cleanName = name.trim();
    // Helper to find Roll No pattern: 2 digits + 2-3 Letters + 3 digits (e.g., 22CSR123)
    const rollNoRegex = /\b(\d{2})([A-Z]{2,3})(\d{3})\b/i;
    const match = cleanName.toUpperCase().match(rollNoRegex);

    if (match) {
        const fullRollNo = match[0]; // e.g. 22CSR123
        const code = match[2];       // e.g. CSR

        const department = DEPT_MAP[code] || "General";

        return {
            rollNo: fullRollNo,
            department,
            code
        };
    }

    return { rollNo: null, department: null };
};
