export const DEPT_MAP = {
    // CSE
    'CSR': 'Computer Science and Engineering',
    'CSE': 'Computer Science and Engineering',

    // IT
    'ITR': 'Information Technology',
    'IT': 'Information Technology',

    // CSD
    'CDR': 'Computer Science and Design',
    'CSD': 'Computer Science and Design',

    // AIDS
    'ADR': 'Artificial Intelligence and Data Science',
    'ADS': 'Artificial Intelligence and Data Science',
    'AIDS': 'Artificial Intelligence and Data Science',

    // AIML
    'ALR': 'Artificial Intelligence and Machine Learning',
    'AIML': 'Artificial Intelligence and Machine Learning',

    // ECE
    'ECR': 'Electronics and Communication Engineering',
    'ECE': 'Electronics and Communication Engineering',

    // EEE
    'EER': 'Electrical and Electronics Engineering',
    'EEE': 'Electrical and Electronics Engineering',

    // EIE
    'EIR': 'Electronics and Instrumentation Engineering',
    'EIE': 'Electronics and Instrumentation Engineering',

    // MECH
    'MER': 'Mechanical Engineering',
    'MECH': 'Mechanical Engineering',

    // CIVIL
    'CVR': 'Civil Engineering',
    'CIVIL': 'Civil Engineering',

    // MTS
    'MTR': 'Mechatronics Engineering',
    'MTS': 'Mechatronics Engineering',

    // CHEM
    'CMR': 'Chemical Engineering',
    'CHEM': 'Chemical Engineering',

    // FT
    'FTR': 'Food Technology',
    'FT': 'Food Technology',

    // AUTO
    'AUR': 'Automobile Engineering',
    'AUTO': 'Automobile Engineering',

    // M.Sc
    'ISR': 'M.Sc Software Systems',
    'MSC': 'M.Sc Software Systems'
};

export const SOFTWARE_DEPTS = [
    'Computer Science and Engineering', 'CSE',
    'Information Technology', 'IT',
    'Computer Science and Design', 'CSD',
    'Artificial Intelligence and Data Science', 'AIDS',
    'Artificial Intelligence and Machine Learning', 'AIML',
    'M.Sc Software Systems', 'MSC'
];

export const HARDWARE_DEPTS = [
    'Electronics and Communication Engineering', 'ECE',
    'Electrical and Electronics Engineering', 'EEE',
    'Electronics and Instrumentation Engineering', 'EIE',
    'Mechanical Engineering', 'MECH',
    'Civil Engineering', 'CIVIL',
    'Mechatronics Engineering', 'MTS',
    'Chemical Engineering', 'CHEM',
    'Food Technology', 'FT',
    'Automobile Engineering', 'AUTO'
];

export const getDomainFromDept = (department) => {
    if (!department) return 'Both';
    const normalized = department.trim();
    // Check direct include (Short code or Full name if in list)
    if (SOFTWARE_DEPTS.includes(normalized)) return 'Software';
    if (HARDWARE_DEPTS.includes(normalized)) return 'Hardware';

    // Check via Map
    const fullName = DEPT_MAP[normalized];
    if (fullName) {
        if (SOFTWARE_DEPTS.includes(fullName)) return 'Software';
        if (HARDWARE_DEPTS.includes(fullName)) return 'Hardware';
    }

    return 'Both';
};
