
const DEPT_MAP = {
    // CSE
    'CSR': 'Computer Science and Engineering',
    'CSE': 'Computer Science and Engineering',
    // IT
    'ITR': 'Information Technology',
    'IT': 'Information Technology',
    // CSD
    'CDR': 'Computer Science and Design',
    'CSD': 'Computer Science and Design',
    'CDR': 'Computer Science and Design',
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
    'MTR': 'Mechatronics Engineering',
    'MTS': 'Mechatronics Engineering',
    'MTR': 'Mechatronics Engineering',
    // CHEMICAL
    'CHR': 'Chemical Engineering',
    'CHEM': 'Chemical Engineering',
    // FOOD TECH
    'FTR': 'Food Technology',
    'FT': 'Food Technology',
    // AUTO
    'AUR': 'Automobile Engineering',
    'AUTO': 'Automobile Engineering',
<<<<<<< HEAD
    'ISR': 'M.SC'
=======

    // M.Sc
    'ISR': 'M.Sc Software Systems'
>>>>>>> a78b22ce1afb0e0f5231969836fb33a8be124a95
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

export const SOFTWARE_DEPTS = [
    'Computer Science and Engineering', 'CSE', 'CSR',
    'Information Technology', 'IT', 'ITR',
    'Computer Science and Design', 'CSD', 'CDR',
    'Artificial Intelligence and Data Science', 'AIDS', 'ADR', 'ADS',
    'Artificial Intelligence and Machine Learning', 'AIML', 'ALR', 'AIM',
    'M.Sc Software Systems', 'MSC', 'ISR'
];

export const HARDWARE_DEPTS = [
    'Electronics and Communication Engineering', 'ECE', 'ECR',
    'Electrical and Electronics Engineering', 'EEE', 'EER',
    'Electronics and Instrumentation Engineering', 'EIE', 'EIR',
    'Mechanical Engineering', 'MECH', 'MER',
    'Civil Engineering', 'CIVIL', 'CVR', 'CE',
    'Mechatronics Engineering', 'MTS', 'MTR',
    'Chemical Engineering', 'CHEM', 'CMR',
    'Food Technology', 'FT', 'FTR',
    'Automobile Engineering', 'AUTO', 'AUR'
];

export const getDomainFromDept = (department) => {
    if (!department) return 'Both';
    const normalized = department.trim();
    if (SOFTWARE_DEPTS.includes(normalized)) return 'Software';
    if (HARDWARE_DEPTS.includes(normalized)) return 'Hardware';

    // Check key in DEPT_MAP if normalized is a code
    if (DEPT_MAP[normalized]) {
        if (SOFTWARE_DEPTS.includes(DEPT_MAP[normalized])) return 'Software';
        if (HARDWARE_DEPTS.includes(DEPT_MAP[normalized])) return 'Hardware';
    }

    return 'Both';
};
