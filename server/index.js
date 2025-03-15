import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectToDb from "./src/db/index.js";

// connect DB before starting the server
connectToDb();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
