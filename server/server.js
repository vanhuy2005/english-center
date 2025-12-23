require("dotenv").config();
const { initApp } = require("./src/app");

const PORT = process.env.PORT || 5000;

initApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start app:", err);
    process.exit(1);
  });
