const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// File Upload Config
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitize filename and append timestamp to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- API Routes ---

// Get All Classes
app.get('/api/classes', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM classes ORDER BY start_date DESC');
        // Map snake_case db fields to camelCase for frontend if desired, or handle in frontend
        // For now, sending as is.
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Class
app.post('/api/classes', async (req, res) => {
    console.log('Received POST /api/classes:', req.body);
    const { id, name, startDate, endDate, schedule, status, price, trainers } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO classes (id, name, start_date, end_date, schedule, status, price, trainers) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id, name, startDate, endDate, schedule, status, price, trainers]
        );
        console.log('Class created successfully:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating class:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Get All Students
app.get('/api/students', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM students ORDER BY enrollment_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Student (with file upload)
app.post('/api/students', upload.single('idFile'), async (req, res) => {
    const { id, name, dob, organization, email, phone, classId, className, idType } = req.body;
    const file = req.file;

    try {
        const result = await db.query(
            `INSERT INTO students (
        id, name, dob, organization, email, phone, class_id, class_name, id_type, id_file_path, id_file_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                id,
                name,
                dob,
                organization,
                email,
                phone,
                classId,
                className,
                idType,
                file ? file.filename : null, // Store only the filename
                file ? file.originalname : null
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Student
app.put('/api/students/:id', upload.single('idFile'), async (req, res) => {
    const { id } = req.params;
    const { name, dob, organization, email, phone, classId, className, idType } = req.body;
    const file = req.file;

    try {
        let query = `
      UPDATE students 
      SET name = $1, dob = $2, organization = $3, email = $4, phone = $5, 
          class_id = $6, class_name = $7, id_type = $8
      `;
        const params = [name, dob, organization, email, phone, classId, className, idType];

        if (file) {
            // If new file uploaded, update file fields and delete old file if needed (omitted for brevity)
            query += `, id_file_path = $${params.length + 1}, id_file_name = $${params.length + 2}`;
            params.push(file.filename);
            params.push(file.originalname);
        }

        query += ` WHERE id = $${params.length + 1} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Optional: Delete file from filesystem
        const student = await db.query('SELECT id_file_path FROM students WHERE id = $1', [id]);
        if (student.rows.length > 0 && student.rows[0].id_file_path) {
            const filePath = path.join(uploadDir, student.rows[0].id_file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM students WHERE id = $1', [id]);
        res.json({ message: 'Student deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
