const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:3000", // Allow the frontend to access
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rest of your server code

app.use(express.json());

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
