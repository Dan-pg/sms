import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { parse, isValid, format } from 'date-fns';

const EnrollmentForm = ({ onClose, initialClass = null }) => {
    const { enrollStudent, classes, notify } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        organization: '',
        email: '',
        phone: '',
        className: initialClass ? initialClass.name : '',
        classId: initialClass ? initialClass.id : '',
        idType: 'National ID'
    });

    const [dateError, setDateError] = useState('');

    const predefinedClasses = [
        "CCNA", "CISSP", "CISM", "CEH", "CCNP", "COMPTIA SECURITY+",
        "ITIL", "MS PROJECT", "VM WARE", "LINUX", "PMP", "ORACLE",
        "ICDL", "DATA SCIENCE", "ADVANCED EXCEL"
    ];

    // Filter for only Future or Ongoing classes
    const activeClasses = classes.filter(c => new Date(c.endDate) >= new Date());

    // Combine predefined list with names of active scheduled classes, removing duplicates
    const classOptions = Array.from(new Set([
        ...predefinedClasses,
        ...activeClasses.map(c => c.name)
    ])).sort();

    const handleDateChange = (e) => {
        let value = e.target.value;
        // Allow only numbers and slashes
        if (!/^[0-9/]*$/.test(value)) return;

        // Simple auto-slash insertion logic
        if (value.length === 2 && formData.dob.length === 1) value += '/';
        if (value.length === 5 && formData.dob.length === 4) value += '/';
        // Prevent typing more than 10 chars
        if (value.length > 10) return;

        setFormData({ ...formData, dob: value });
        setDateError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate Date Format (DD/MM/YYYY)
        const parsedDate = parse(formData.dob, 'dd/MM/yyyy', new Date());
        if (!isValid(parsedDate) || formData.dob.length !== 10) {
            setDateError('Please enter a valid date in DD/MM/YYYY format');
            return;
        }

        // Only link to an ACTIVE class (Future or Ongoing)
        const enrolledClass = activeClasses.find(c => c.name === formData.className);

        if (!enrolledClass) {
            notify('Error: You can only enroll in an Active (Ongoing or Future) Class.', 'error');
            return;
        }

        const data = new FormData();
        data.append('id', crypto.randomUUID());

        data.append('name', formData.name);
        // data.append('dob', formData.dob); // Old way
        data.append('dob', format(parsedDate, 'yyyy-MM-dd')); // Send ISO format to backend
        data.append('organization', formData.organization);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('classId', enrolledClass.id);
        data.append('className', enrolledClass.name);
        data.append('idType', formData.idType);
        if (formData.file) {
            data.append('idFile', formData.file);
        }

        const success = await enrollStudent(data);

        if (success) {
            notify('Student enrolled successfully!', 'success');
            setFormData({ name: '', dob: '', organization: '', email: '', phone: '', className: '', classId: '', idType: 'National ID', file: null });
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            if (onClose) onClose();
        } else {
            notify('Failed to enroll student. Please try again.', 'error');
        }
    };

    return (
        <div className="glass-panel p-4" style={{ border: '1px solid var(--primary)', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ marginBottom: '1rem' }}>New Student Registration</h3>
            <form onSubmit={handleSubmit} className="flex-col gap-4">
                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Student Names <span style={{ color: 'red' }}>*</span></label>
                    <input
                        className="input-field"
                        placeholder="Student Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date of Birth (DD/MM/YYYY) <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="DD/MM/YYYY"
                        value={formData.dob}
                        onChange={handleDateChange}
                        required
                        style={{ borderColor: dateError ? 'red' : '' }}
                    />
                    {dateError && <span style={{ color: 'red', fontSize: '0.8rem' }}>{dateError}</span>}
                </div>

                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Organization Name <span style={{ color: 'red' }}>*</span></label>
                    <input
                        className="input-field"
                        placeholder="Organization Name"
                        value={formData.organization}
                        onChange={e => setFormData({ ...formData, organization: e.target.value })}
                        required
                    />
                </div>

                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address (Optional)</label>
                    <input
                        className="input-field"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone Number <span style={{ color: 'red' }}>*</span></label>
                    <input
                        className="input-field"
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                </div>

                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Class Enrolling For <span style={{ color: 'red' }}>*</span></label>
                    <select
                        className="select-field"
                        value={formData.className || ''}
                        onChange={e => setFormData({ ...formData, className: e.target.value })}
                        required
                    >
                        <option value="" disabled style={{ color: 'gray' }}>Select a class...</option>
                        {classOptions.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
                    </select>
                </div>

                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ID Type <span style={{ color: 'red' }}>*</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {['National ID', 'Work ID', 'Driving Permit'].map((type) => (
                            <label
                                key={type}
                                className="flex-center"
                                style={{
                                    cursor: 'pointer',
                                    padding: '0.8rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: formData.idType === type ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${formData.idType === type ? 'var(--primary)' : 'var(--border-color)'}`,
                                    transition: 'all 0.2s ease',
                                    fontWeight: formData.idType === type ? '600' : '400',
                                    color: formData.idType === type ? 'white' : 'var(--text-muted)'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="idType"
                                    value={type}
                                    checked={formData.idType === type}
                                    onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                                    style={{ display: 'none' }}
                                />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Upload your ID <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="file"
                        className="input-field"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                if (file.size > 10 * 1024 * 1024) { // 10MB
                                    notify('File size exceeds 10MB limit.', 'error');
                                    e.target.value = null; // Reset input
                                    setFormData({ ...formData, file: null });
                                } else {
                                    setFormData({ ...formData, file: file });
                                }
                            }
                        }}
                        required
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Max size: 10MB. One file only.</small>
                </div>

                <button type="submit" className="btn" style={{ marginTop: '1rem' }}>Enroll Student</button>
            </form>
        </div>
    );
};

export default EnrollmentForm;
