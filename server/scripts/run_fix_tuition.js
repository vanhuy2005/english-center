const fetch = global.fetch;

async function main() {
  try {
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "0912345678", password: "Director123!" }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error("Login failed", loginJson);
      process.exit(1);
    }

    const token =
      loginJson.data?.token || (loginJson.data && loginJson.data.token);
    if (!token) {
      console.error("No token in login response:", loginJson);
      process.exit(1);
    }

    console.log("Director token obtained. Calling /api/courses/fix-tuition...");

    const fixRes = await fetch(
      "http://localhost:5000/api/courses/fix-tuition",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const fixJson = await fixRes.json();
    console.log("fix-tuition response:", JSON.stringify(fixJson, null, 2));

    // Verify by fetching courses
    const coursesRes = await fetch("http://localhost:5000/api/courses");
    const coursesJson = await coursesRes.json();
    console.log(
      "First course sample:",
      coursesJson.data && coursesJson.data[0]
    );
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
