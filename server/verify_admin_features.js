
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Utilities
const generateId = () => Math.floor(Math.random() * 10000);

const getAdmin = () => ({
    name: "Admin User",
    email: "admin@kongu.edu", // Assuming this admin exists or we create one. 
    // Wait, verification script should probably register a new Admin if possible or assume default?
    // Let's create a new one to be sure. But register endpoint doesn't allow creating 'admin' role easily (public reg usually for students).
    // Let's use the one from AdminDashboard login? 
    // Actually, I can create an Admin via database or if register allows diverse roles.
    // authController.js register logic allows passing 'role'.
    email: `admin${generateId()}@kongu.edu`,
    password: 'password123',
    role: 'admin',
    department: 'ADMIN'
});

const getCoordinator = () => ({
    name: `Coordinator ${generateId()}`,
    email: `coord${generateId()}@kongu.edu`,
    password: 'password123',
    role: 'coordinator',
    department: 'CSE'
});

async function registerOrLogin(user) {
    try {
        console.log(`   Attempting to register ${user.role} (${user.email})...`);
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

async function verifyAdminFeatures() {
    try {
        console.log('--- Starting Admin Features Verification ---');

        // 1. Setup Admin
        console.log('\nSTEP 1: Setting up Admin');
        const adminData = getAdmin();
        const adminUser = await registerOrLogin(adminData);
        const adminAuth = { headers: { Authorization: `Bearer ${adminUser.token}` } };

        // 2. Setup Coordinator
        console.log('\nSTEP 2: Setting up Coordinator');
        const coordData = getCoordinator();
        const coordUser = await registerOrLogin(coordData);
        const coordAuth = { headers: { Authorization: `Bearer ${coordUser.token}` } };

        // 3. Verify Admin can Create Company
        console.log('\nSTEP 3: Verify Admin Create Company');
        const companyPayload = {
            name: `AdminCorp ${generateId()}`,
            visitDate: '2025-12-01',
            roles: 'Manager',
            eligibility: 'All',
            salaryPackage: '20 LPA',
            department: 'CSE'
        };

        try {
            await axios.post(`${API_URL}/companies`, companyPayload, adminAuth);
            console.log('   ✅ Admin successfully created company.');
        } catch (e) {
            console.error('   ❌ Admin FAILED to create company:', e.response?.data?.message || e.message);
        }

        // 4. Verify Coordinator CANNOT Create Company
        console.log('\nSTEP 4: Verify Coordinator CANNOT Create Company');
        try {
            await axios.post(`${API_URL}/companies`, companyPayload, coordAuth);
            console.error('   ❌ Coordinator WAS ABLE to create company (Should fail).');
        } catch (e) {
            if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                console.log('   ✅ Coordinator blocked from creating company (Expected 401/403).');
            } else {
                console.error(`   ❌ Unexpected error code: ${e.response?.status}`, e.message);
            }
        }

        // 5. Verify Bulk Student Upload
        console.log('\nSTEP 5: Verify Bulk Student Upload');
        const bulkStudents = [
            {
                Name: `BulkStudent ${generateId()}`,
                Email: `bulk${generateId()}@student.com`,
                RollNo: `ROLL${generateId()}`,
                Department: 'CSE',
                Year: '4'
            },
            {
                Name: `BulkStudent ${generateId()}`,
                Email: `bulk${generateId()}@student.com`,
                RollNo: `ROLL${generateId()}`,
                Department: 'ECE',
                Year: '4'
            }
        ];

        try {
            const res = await axios.post(`${API_URL}/auth/bulk-register`, { students: bulkStudents }, adminAuth);
            console.log(`   ✅ Bulk Upload Success. Count: ${res.data.count}`);

            if (res.data.count !== 2) {
                console.warn(`   ⚠️ Expected 2 created, got ${res.data.count}`);
            }

            // Verify login with one of them
            console.log('   Verifying login for uploaded student...');
            const student1 = bulkStudents[0];
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: student1.Email,
                password: student1.RollNo // Default password logic
            });
            console.log(`   ✅ Login successful for ${student1.Email}`);

        } catch (e) {
            console.error('   ❌ Bulk Upload Failed:', e.response?.data?.message || e.message);
        }

        console.log('\n--- Verification Finished ---');

    } catch (error) {
        console.error('Unexpected Script Error:', error);
    }
}

verifyAdminFeatures();
