import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { format } from 'date-fns';

import { Trash, ShareNetwork, PencilSimple } from 'phosphor-react';
import EnrollmentForm from './EnrollmentForm';
import EditStudentModal from './EditStudentModal';

const StudentManagement = () => {
    const { students, deleteStudent, notify } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const copyEnrollmentLink = () => {
        const url = `${window.location.origin}/enroll`;
        navigator.clipboard.writeText(url).then(() => {
            notify('Enrollment link copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            notify('Failed to copy link.', 'error');
        });
    };

    return (
        <div className="flex-col gap-4">
            <div className="flex-between">
                <h1 style={{ fontSize: '2rem' }}>Students</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn"
                        onClick={copyEnrollmentLink}
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                        title="Copy Public Enrollment Link"
                    >
                        <ShareNetwork size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Share Link
                    </button>
                    <button className="btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Hide Form' : 'Enroll Student'}
                    </button>
                </div>
            </div>

            {showForm && <EnrollmentForm onClose={() => setShowForm(false)} />}

            <div className="glass-panel p-4">
                <h3 style={{ marginBottom: '1rem' }}>Enrolled Students</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th className="p-4">Name</th>
                                <th className="p-4">ID Document</th>
                                <th className="p-4">Organization</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Class</th>
                                <th className="p-4">Date of Birth</th>
                                <th className="p-4">Enrollment Date</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled.</td>
                                </tr>
                            ) : (
                                students.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td className="p-4">{s.name}</td>
                                        <td className="p-4">
                                            {s.file ? (
                                                <div className="flex-col">
                                                    <a
                                                        href={`http://localhost:3001/uploads/${s.file.path}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                                                    >
                                                        📄 {s.file.name}
                                                    </a>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.idType}</span>
                                                </div>
                                            ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                        </td>
                                        <td className="p-4">{s.organization}</td>
                                        <td className="p-4">{s.email || '-'}</td>
                                        <td className="p-4">{s.phone || '-'}</td>
                                        <td className="p-4">{s.className}</td>
                                        <td className="p-4">{s.dob ? format(new Date(s.dob), 'dd/MM/yyyy') : '-'}</td>
                                        <td className="p-4">{format(new Date(s.enrollmentDate), 'dd/MM/yyyy')}</td>
                                        <td className="p-4">
                                            <div className="flex-center gap-2">
                                                <button
                                                    onClick={() => setEditingStudent(s)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--primary)',
                                                        cursor: 'pointer',
                                                        padding: '0.5rem'
                                                    }}
                                                    title="Edit Student"
                                                >
                                                    <PencilSimple size={20} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this student?')) deleteStudent(s.id)
                                                    }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#ff6b6b',
                                                        cursor: 'pointer',
                                                        padding: '0.5rem'
                                                    }}
                                                    title="Delete Student"
                                                >
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingStudent && (
                <EditStudentModal
                    student={editingStudent}
                    onClose={() => setEditingStudent(null)}
                />
            )}
        </div>
    );
};

export default StudentManagement;

