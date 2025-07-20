const express = require("express");
const bodyParser = require("body-parser");
const conn = require("./db");
const app = express();
const PORT = 3009;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Register Student
app.post("/register", (req, res) => {
  const { regno, name, course, year_of_study, semester, email, phone, username, password } = req.body;

  const sql = `INSERT INTO students 
    (regno, name, course, year_of_study, semester, email, phone, username, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  conn.query(sql, [regno, name, course, year_of_study, semester, email, phone, username, password], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Registration failed.");
    }
    res.send("Student registered successfully.");
  });
});

app.post('/login', (req, res) => {
  const { username, password, role } = req.body;

  if (role === 'student') {
    // check student login
    const { username, password } = req.body;

  const sql = "SELECT * FROM students WHERE username = ? AND password = ?";
  conn.query(sql, [username, password], (err, studentRows) => {
    if (err || studentRows.length === 0)
      return res.status(401).send("Invalid credentials");

    const regno = studentRows[0].regno;

    // Fetch result using regno
    conn.query("SELECT * FROM results WHERE regno = ?", [regno], (err, resultRows) => {
      if (err) return res.status(500).send("Error fetching result");
      if (resultRows.length === 0) return res.send("Result not yet available.");

      // Build result HTML dynamically
      const result = resultRows[0];
      const html = `
        <h2>Result for Reg No: ${result.regno}  </h2>
        <p>Course: ${result.course}</p>
        <p>Year: ${result.year_of_study}</p>
        <p>Semester: ${result.semester}</p>
        <p>Exam: ${result.exam_year_month}</p>
        <ul>
          <li>TELUGU : ${result.subject_1}</li>
          <li>ENGLISH: ${result.subject_2}</li>
          <li>HINDI: ${result.subject_3}</li>
          <li>SCIENCE: ${result.subject_4}</li>
          <li>SOCIAL: ${result.subject_5}</li>
        </ul>
        <p>Status: ${result.status}</p>
        <p>SGPA: ${result.sgpa}</p>
        <a href="/index.html">Back to Login</a>
      `;
      res.send(html);
    });
  });
  } else if (role === 'admin') {
    // check admin login
      const { username, password } = req.body;

  const sql = "SELECT * FROM admin WHERE username = ? AND password = ?";
  conn.query(sql, [username, password], (err, rows) => {
    if (err || rows.length === 0) return res.status(401).send("Invalid admin credentials.");
    res.redirect("/admin_dashboard.html");
  });

  } else {
    res.status(400).send('Invalid role selected');
  }
});




// Enter Marks (Admin)
app.post("/enter-marks", (req, res) => {
  const { regno, exam_year_month, s1, s2, s3, s4, s5, status, sgpa } = req.body;
  conn.query(
    "SELECT * FROM students WHERE regno = ?",
    [regno],
    (err, rows) => {
      if (err || rows.length === 0) return res.status(400).send("Student not found.");
      const student = rows[0];
      const sql = `
        INSERT INTO results 
        (regno, course, year_of_study, semester, exam_year_month,
         subject_1, subject_2, subject_3, subject_4, subject_5, status, sgpa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      conn.query(sql, [
        regno, student.course, student.year_of_study, student.semester,
        exam_year_month, s1, s2, s3, s4, s5, status, sgpa
      ], (err) => {
        if (err) return res.status(500).send("Error inserting marks.");
        res.send("Marks entered.");
      });
    });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

