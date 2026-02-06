
const DEPT_MAP = {
    'ALR': 'AIML',
    'ADR': 'AIDS',
    'CDR': 'CSD',
    'CSR': 'CSE',
    'EER': 'EEE',
    'ECR': 'ECE',
    'EIR': 'EIE',
    'MTR': 'MTS',
    'MER': 'MECH',
    'ITR': 'IT', // Assumed standard 3-letter code
    'IT': 'IT',  // Handle 2-letter variant if present
    'AUR': 'AUTO',
    'CER': 'CIVIL',
    'CHR': 'CHEM',
    'FTR': 'FT',
    'ISR': 'M.SC'
};

export const parseStudentDetails = (name) => {
    if (!name) return { rollNo: null, department: null };

    // Goal: Find something that looks like a Roll No (e.g., 22CSR123)
    // Pattern: 2 digits + 2 or 3 letters + 3 digits
    // We look for this pattern anywhere in the string, but user said "last", so we prioritize the end.

    // Normalize: Remove extra spaces
    const cleanName = name.trim();

    // Regex: \b(\d{2})([A-Z]{2,3})(\d{3})\b
    // \b matches word boundary
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
