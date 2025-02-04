const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const cors = require("cors");
const XLSX = require("xlsx");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// MongoDB Connection
mongoose
  .connect("mongodb+srv://roshinikumar32:roshinikumar@roshini.g2bkm.mongodb.net/?retryWrites=true&w=majority&appName=Roshini")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const EmployeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  secretChildName: String,
  secretChildEmail: String,
});

const Employee = mongoose.model("Employee", EmployeeSchema);

// Handle File Upload and Processing
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded!" });

  try {
    const employees = await parseCSV(req.file.path);
    const assignments = assignSecretSanta(employees);
    await saveAssignments(assignments);

    res.json({ message: "File processed successfully!" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Export Secret Santa Assignments
app.get("/api/export", async (req, res) => {
  try {
    const assignments = await Employee.find({});
    console.log(assignments,'assignments')
    if (!assignments.length) return res.status(400).json({ message: "No data to export." });

    const ws = XLSX.utils.json_to_sheet(assignments.map(a => ({
      Name: a.Employee_Name,
      Email: a.Employee_EmailID,
      Secret_Santa_Name: a.secretChildName,
      Secret_Santa_Email: a.secretChildEmail
    })));
 
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Secret Santa Assignments");

    const filePath = "exports/secret_santa.xlsx";
    XLSX.writeFile(wb, filePath);

    res.download(filePath, "Secret_Santa_Assignments.xlsx");
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Error generating file." });
  }
});

// Parse CSV
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => data.push(row))
      .on("end", () => resolve(data))
      .on("error", (error) => reject(error));
  });
}

// Assign Secret Santa
function assignSecretSanta(employees) {
  const shuffled = [...employees].sort(() => Math.random() - 0.5);
  console.log(employees,'employees')
  return employees.map((giver, index) => ({
   
    name: giver.Employee_Name,
    email: giver.Employee_EmailID,
    secretChildName: shuffled[index].Name,
    secretChildEmail: shuffled[index].Email,
  }));
}

// Save Assignments to MongoDB
async function saveAssignments(assignments) {
  await Employee.deleteMany({});
  await Employee.insertMany(assignments);
}

// Start Server 
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
