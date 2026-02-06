import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Utilities
const generateId = () => Math.floor(Math.random() * 10000);
const getCoordinator = () => ({
    name: `Coordinator ${generateId()}`,
    email: `coord${generateId()}@kongu.edu`,
    password: 'password123',
    role: 'coordinator',
    department: 'CSE'
});
const getStudent = () => ({
    name: `Student ${generateId()}`,
    email: `student${generateId()}@kongu.edu`,
    password: 'password123',
    role: 'student',
    department: 'CSE',
    rollNo: `20CSR${generateId()}`,
    year: '4',
    section: 'A',
    dob: '2000-01-01'
});

async function registerOrLogin(user) {
    try {
        console.log(`   Attempting to register ${user.email}...`);
        const res = await axios.post(`${API_URL}/auth/register`, user);
        console.log(`   ✅ Registered ${user.role}: ${user.email}`);
        return res.data;
    } catch (e) {
        if (e.response && e.response.status === 400 && e.response.data.message === 'User already exists') {
            console.log(`   User exists, logging in...`);
            const loginRes = await axios.post(`${API_URL}/auth/login`, { email: user.email, password: user.password });
            return loginRes.data;
        }
        throw e;
    }
}

async function verifyBackend() {
    try {
        console.log('--- Starting Robust Backend Verification ---');

        // 1. Setup Coordinator
        console.log('\nSTEP 1: Setting up Coordinator');
        const coordinatorData = getCoordinator();
        let coordinatorUser;
        try {
            coordinatorUser = await registerOrLogin(coordinatorData);
        } catch (e) {
            console.error('❌ Coordinator Setup Failed:', e.response?.data?.message || e.message);
            return;
        }
        const coordAuth = { headers: { Authorization: `Bearer ${coordinatorUser.token}` } };


        // 2. Setup Student
        console.log('\nSTEP 2: Setting up Student');
        const studentData = getStudent();
        let studentUser;
        try {
            studentUser = await registerOrLogin(studentData);
        } catch (e) {
            console.error('❌ Student Setup Failed:', e.response?.data?.message || e.message);
            return;
        }
        const studentAuth = { headers: { Authorization: `Bearer ${studentUser.token}` } };


        // 3. Create Company (Scheduled -> Completed)
        console.log('\nSTEP 3: Creating Company');
        const companyPayload = {
            name: `TestCorp ${generateId()}`,
            visitDate: new Date().toISOString().split('T')[0],
            roles: 'SDE',
            salaryPackage: '12 LPA',
            eligibility: 'None',
            department: 'CSE'
        };

        let companyId;
        try {
            // Create
            const createRes = await axios.post(`${API_URL}/companies`, companyPayload, coordAuth);
            companyId = createRes.data._id;
            console.log(`   ✅ Company Created: ${companyPayload.name}`);

            // Update Status to Completed
            await axios.put(`${API_URL}/companies/${companyId}/status`, { status: 'completed' }, coordAuth);
            console.log(`   ✅ Company Status updated to 'completed'`);
        } catch (e) {
            console.error('❌ Company Creation Failed:', e.response?.data || e.message);
            return;
        }


        // 4. Update Eligibility List
        console.log('\nSTEP 4: Updating Eligibility List');
        try {
            await axios.put(`${API_URL}/companies/${companyId}/eligibility`, {
                eligibleStudents: [studentData.email]
            }, coordAuth);
            console.log(`   ✅ Added ${studentData.email} to eligibility list`);
        } catch (e) {
            console.error('❌ Eligibility Update Failed:', e.response?.data || e.message);
            return;
        }


        // 5. Verify Student Access (Give Feedback)
        console.log('\nSTEP 5: Verifying Student Access');
        try {
            // Assuming student dashboard fetches all companies then filters on frontend?
            // Wait, StudentDashboard.jsx fetches '/companies' which maps to 'getCompanies' (all active?).
            // Let's call the API the student would call.
            const res = await axios.get(`${API_URL}/companies`, studentAuth);

            // Simulating Frontend Logic
            const companies = res.data;
            const targetCompany = companies.find(c => c._id === companyId);

            if (!targetCompany) {
                console.error('❌ Target company not found in list.');
            } else {
                console.log(`   Fetched Company: Status=${targetCompany.status}`);
                console.log(`   Eligible List: ${JSON.stringify(targetCompany.eligibleStudents)}`);

                const isEligible = targetCompany.eligibleStudents.includes(studentData.email);
                const isCompleted = targetCompany.status === 'completed';

                if (isEligible && isCompleted) {
                    console.log('   ✅ VERIFICATION SUCCESS: Student sees company and is eligible.');
                } else {
                    console.error('   ❌ VERIFICATION FAILED: Eligibility check failed.');
                    console.log(`      isEligible: ${isEligible}, isCompleted: ${isCompleted}`);
                }
            }

        } catch (e) {
            console.error('❌ Student Fetch Failed:', e.response?.data || e.message);
        }

        console.log('\n--- Verification Finished ---');

    } catch (error) {
        console.error('Unexpected Error:', error.message);
    }
}

verifyBackend();
