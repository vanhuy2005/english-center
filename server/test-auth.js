const axios = require("axios");

const API_URL = "http://localhost:3000";

// Test accounts
const testAccounts = [
  {
    phone: "0901234567",
    password: "student123",
    role: "student",
    name: "Student 1",
  },
  {
    phone: "0912345678",
    password: "teacher123",
    role: "teacher",
    name: "Teacher 1",
  },
  {
    phone: "0900000001",
    password: "director123",
    role: "director",
    name: "Director",
  },
  {
    phone: "0900000002",
    password: "academic123",
    role: "academic",
    name: "Academic Staff",
  },
  {
    phone: "0900000003",
    password: "enrollment123",
    role: "enrollment",
    name: "Enrollment Staff",
  },
  {
    phone: "0900000004",
    password: "accountant123",
    role: "accountant",
    name: "Accountant",
  },
];

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) =>
    console.log(
      `\n${colors.cyan}${"=".repeat(60)}\n${msg}\n${"=".repeat(60)}${
        colors.reset
      }\n`
    ),
};

// Test login for each account
async function testLogin(account) {
  try {
    log.info(`Testing login for: ${account.name} (${account.role})`);

    const response = await axios.post(`${API_URL}/api/auth/login`, {
      phone: account.phone,
      password: account.password,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      log.success(`Login successful for ${account.name}`);
      console.log(`   Token: ${token.substring(0, 30)}...`);
      console.log(`   User: ${user.fullName} (${user.role})`);
      return { success: true, token, user };
    } else {
      log.error(`Login failed: ${response.data.message}`);
      return { success: false };
    }
  } catch (error) {
    log.error(`Login failed for ${account.name}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return { success: false };
  }
}

// Test protected endpoint
async function testProtectedEndpoint(token, role) {
  try {
    log.info(`Testing protected endpoint for role: ${role}`);

    let endpoint = "";
    switch (role) {
      case "student":
        endpoint = "/api/students/me/courses";
        break;
      case "teacher":
        endpoint = "/api/teachers/me/classes";
        break;
      case "director":
        endpoint = "/api/students";
        break;
      case "academic":
        endpoint = "/api/classes";
        break;
      case "enrollment":
        endpoint = "/api/students";
        break;
      case "accountant":
        endpoint = "/api/finance";
        break;
      default:
        endpoint = "/api/auth/me";
    }

    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      log.success(`Protected endpoint accessible for ${role}`);
      console.log(`   Endpoint: ${endpoint}`);
      console.log(
        `   Data length: ${JSON.stringify(response.data.data).length} chars`
      );
      return { success: true };
    } else {
      log.error(`Protected endpoint failed for ${role}`);
      return { success: false };
    }
  } catch (error) {
    log.error(`Protected endpoint failed for ${role}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(
        `   Message: ${error.response.data?.message || "No message"}`
      );
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return { success: false };
  }
}

// Test unauthorized access
async function testUnauthorizedAccess(token, role) {
  try {
    log.info(`Testing unauthorized access for role: ${role}`);

    // Try to access director-only endpoint
    const endpoint = "/api/director/dashboard";

    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If we reach here, access was granted (unexpected for non-director)
    if (role === "director") {
      log.success(`Director can access director dashboard (expected)`);
      return { success: true };
    } else {
      log.warning(`${role} can access director dashboard (unexpected!)`);
      return { success: false };
    }
  } catch (error) {
    if (error.response?.status === 403) {
      if (role !== "director") {
        log.success(`${role} correctly blocked from director dashboard`);
        return { success: true };
      } else {
        log.error(`Director blocked from own dashboard (unexpected!)`);
        return { success: false };
      }
    } else {
      log.error(`Unexpected error: ${error.response?.status || error.message}`);
      return { success: false };
    }
  }
}

// Test login without credentials
async function testLoginWithoutToken() {
  try {
    log.info("Testing public endpoint (health check)");

    const response = await axios.get(`${API_URL}/health`);

    if (response.data.status === "OK") {
      log.success("Health check passed");
      return { success: true };
    } else {
      log.error("Health check failed");
      return { success: false };
    }
  } catch (error) {
    log.error(`Health check failed: ${error.message}`);
    return { success: false };
  }
}

// Main test runner
async function runTests() {
  log.section("🧪 AUTHENTICATION & AUTHORIZATION TESTS");

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Test 1: Health check (no auth)
  log.section("Test 1: Public Endpoint (No Authentication)");
  const healthResult = await testLoginWithoutToken();
  results.total++;
  healthResult.success ? results.passed++ : results.failed++;

  // Test 2: Login for all accounts
  log.section("Test 2: Login for All Roles");
  const loginResults = [];
  for (const account of testAccounts) {
    const result = await testLogin(account);
    loginResults.push({ account, ...result });
    results.total++;
    result.success ? results.passed++ : results.failed++;
    console.log(""); // Empty line between tests
  }

  // Test 3: Access protected endpoints
  log.section("Test 3: Access Protected Endpoints");
  for (const loginResult of loginResults) {
    if (loginResult.success && loginResult.token) {
      const result = await testProtectedEndpoint(
        loginResult.token,
        loginResult.account.role
      );
      results.total++;
      result.success ? results.passed++ : results.failed++;
      console.log(""); // Empty line between tests
    }
  }

  // Test 4: Test authorization (try to access director endpoint with non-director roles)
  log.section("Test 4: Authorization Tests (Role-Based Access Control)");
  for (const loginResult of loginResults) {
    if (loginResult.success && loginResult.token) {
      const result = await testUnauthorizedAccess(
        loginResult.token,
        loginResult.account.role
      );
      results.total++;
      result.success ? results.passed++ : results.failed++;
      console.log(""); // Empty line between tests
    }
  }

  // Summary
  log.section("📊 TEST SUMMARY");
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);

  const passRate = ((results.passed / results.total) * 100).toFixed(2);
  console.log(`\nPass Rate: ${passRate}%`);

  if (results.failed === 0) {
    log.success("ALL TESTS PASSED! 🎉");
  } else {
    log.warning(
      `${results.failed} test(s) failed. Please review the logs above.`
    );
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  log.error(`Test runner failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
