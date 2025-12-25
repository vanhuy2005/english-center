async function testAPI() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/director/reports/enrollment-trend"
    );
    const data = await response.json();
    console.log("✅ API Response:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAPI();
