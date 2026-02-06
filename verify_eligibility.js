const axios = require('axios');

const API_URL = 'http://localhost:5000/api'; // Assuming backend runs on 5000 based on standard MERN setup

// Test Data
const COORDINATOR_CREDS = { email: 'coordinator.ai@kongu.edu', password: 'ai-coordinator' }; // Using verified creds from instructions
const ELIGIBLE_STUDENT_CREDS = { email: 'pavinm.24aim@kongu.edu', password: 'password123' }; // Assuming a standard password or I'll just check public routes if auth is hard to simulate without creating a user
// Note: pavinm.24aim@kongu.edu was mentioned in previous turn. I'll try to login or just use the Coordinator to verify the update persisted.

async function verifyBackend() {
    try {
        console.log('--- Starting Backend Verification ---');

        // 1. Login as Coordinator
        console.log('\n1. Logging in as Coordinator...');
        let coordinatorToken;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, COORDINATOR_CREDS);
            coordinatorToken = loginRes.data.token;
            console.log('✅ Coordinator Login Successful');
        } catch (e) {
            console.error('❌ Coordinator Login Failed:', e.response?.data?.message || e.message);
            return;
        }

        const coordinatorAuth = { headers: { Authorization: `Bearer ${coordinatorToken}` } };

        // 2. Create a Test Company
        console.log('\n2. Creating Test Company...');
        const companyData = {
            name: `Test Company ${Date.now()}`,
            visitDate: '2025-12-01',
            roles: 'SDE',
            ctc: '10 LPA',
            status: 'scheduled'
        };

        let companyId;
        try {
            const createRes = await axios.post(`${API_URL}/companies`, companyData, coordinatorAuth);
            companyId = createRes.data._id;
            console.log(`✅ Company Created: ${companyData.name} (ID: ${companyId})`);
        } catch (e) {
            console.error('❌ Create Company Failed:', e.response?.data || e.message);
            return;
        }

        // 3. Update Eligibility
        console.log('\n3. Updating Eligibility...');
        const eligibleEmails = ['pavinm.24aim@kongu.edu', 'test.eligible@kongu.edu'];
        try {
            await axios.put(`${API_URL}/companies/${companyId}/eligibility`, {
                eligibleStudents: eligibleEmails
            }, coordinatorAuth);
            console.log('✅ Eligibility Updated via API');
        } catch (e) {
            console.error('❌ Update Eligibility Failed:', e.response?.data || e.message);
        }

        // 4. Verify Persistence
        console.log('\n4. Verifying Data Persistence...');
        try {
            const getRes = await axios.get(`${API_URL}/companies/${companyId}`, coordinatorAuth);
            const fetchedCompany = getRes.data;

            if (fetchedCompany.eligibleStudents &&
                fetchedCompany.eligibleStudents.includes('pavinm.24aim@kongu.edu')) {
                console.log('✅ Verification Passed: Student email found in eligible list.');
            } else {
                console.error('❌ Verification Failed: Student email NOT found.');
                console.log('Fetched Lists:', fetchedCompany.eligibleStudents);
            }
        } catch (e) {
            console.error('❌ Fetch Company Failed:', e.response?.data || e.message);
        }

        console.log('\n--- Verification Complete ---');

    } catch (error) {
        console.error('Unexpected Error:', error.message);
    }
}

verifyBackend();
