/**
 * Test Authentication Workflow
 * Tests login with different user roles
 */

require("dotenv").config();
const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// Test accounts from seed data
const testAccounts = [
  { role: "director", phone: "0901000001", password: "123456" },
  { role: "teacher", phone: "0902000001", password: "123456" },
  { role: "student", phone: "0903000001", password: "123456" },
  { role: "academic", phone: "0904000001", password: "123456" },
  { role: "enrollment", phone: "0905000001", password: "123456" },
  { role: "accountant", phone: "0906000001", password: "123456" },
];

// Test login for each role
const testLogin = async (account) => {
  try {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`🔐 Testing login for: ${account.role.toUpperCase()}`);
    console.log(`📱 Phone: ${account.phone}`);
    console.log(`🔑 Password: ${account.password}`);

    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      phone: account.phone,
      password: account.password,
    });

    if (response.data.success) {
      console.log(`✅ Login successful!`);
      console.log(`👤 User: ${response.data.data.user.fullName}`);
      console.log(`🎭 Role: ${response.data.data.user.role}`);
      console.log(
        `🪙 Token received: ${response.data.data.token.substring(0, 20)}...`
      );
      console.log(
        `🔄 Refresh Token: ${response.data.data.refreshToken ? "Yes" : "No"}`
      );
      console.log(
        `🆕 First Login: ${response.data.data.isFirstLogin ? "Yes" : "No"}`
      );

      // Test protected route with token
      await testProtectedRoute(response.data.data.token, account.role);
    } else {
      console.log(`❌ Login failed: ${response.data.message}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.status) {
      console.log(`📊 Status Code: ${error.response.status}`);
    }
  }
};

// Test protected route (GET /api/auth/me)
const testProtectedRoute = async (token, role) => {
  try {
    console.log(`\n🔒 Testing protected route /api/auth/me...`);

    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      console.log(`✅ Protected route accessible!`);
      console.log(`👤 User: ${response.data.data.user.fullName}`);
      console.log(`🎭 Role: ${response.data.data.user.role}`);
      console.log(
        `📋 Profile: ${response.data.data.profile ? "Loaded" : "Not found"}`
      );
    }
  } catch (error) {
    console.log(
      `❌ Protected route failed: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Test invalid login
const testInvalidLogin = async () => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🔐 Testing INVALID login (wrong password)`);

  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      phone: "0901000001",
      password: "wrongpassword",
    });
    console.log(`❌ Should have failed but didn't!`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`✅ Correctly rejected with 401 Unauthorized`);
      console.log(`📝 Message: ${error.response.data.message}`);
    } else {
      console.log(`❌ Unexpected error: ${error.message}`);
    }
  }
};

// Test invalid phone
const testInvalidPhone = async () => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🔐 Testing INVALID login (wrong phone)`);

  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      phone: "0999999999",
      password: "123456",
    });
    console.log(`❌ Should have failed but didn't!`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`✅ Correctly rejected with 401 Unauthorized`);
      console.log(`📝 Message: ${error.response.data.message}`);
    } else {
      console.log(`❌ Unexpected error: ${error.message}`);
    }
  }
};

// Test without token
const testWithoutToken = async () => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🔒 Testing protected route WITHOUT token`);

  try {
    await axios.get(`${BASE_URL}/api/auth/me`);
    console.log(`❌ Should have failed but didn't!`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`✅ Correctly rejected with 401 Unauthorized`);
      console.log(`📝 Message: ${error.response.data.message}`);
    } else {
      console.log(`❌ Unexpected error: ${error.message}`);
    }
  }
};

// Main test function
const runTests = async () => {
  console.log("\n🧪 AUTHENTICATION & AUTHORIZATION WORKFLOW TEST");
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`${"=".repeat(70)}\n`);

  // Test valid logins for all roles
  for (const account of testAccounts) {
    await testLogin(account);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay
  }

  // Test invalid scenarios
  await testInvalidLogin();
  await testInvalidPhone();
  await testWithoutToken();

  console.log(`\n${"=".repeat(70)}`);
  console.log(`✅ All tests completed!`);
  console.log(`${"=".repeat(70)}\n`);
};

// Check if server is running
const checkServer = async () => {
  try {
    await axios.get(`${BASE_URL}/api/auth/me`);
    return true;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log(`❌ Server is not running at ${BASE_URL}`);
      console.log(`⚠️  Please start the server first: npm start`);
      return false;
    }
    return true; // Server is running (401 is expected without token)
  }
};

// Run tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
  process.exit(0);
})();
