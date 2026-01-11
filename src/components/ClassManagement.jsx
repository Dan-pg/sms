import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { differenceInMilliseconds, format } from 'date-fns';
import { Circle, CheckSquare, Square, Trash, CaretDown, CaretUp, PencilSimple, FileXls, X, DownloadSimple } from 'phosphor-react';
import * as XLSX from 'xlsx';

const SheetPreviewModal = ({ data, filename, onClose, onDownload }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div className="glass-panel" style={{
                width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', padding: '0'
            }} onClick={e => e.stopPropagation()}>
                <div className="flex-between p-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex-center gap-3">
                        <FileXls size={24} color="#1ed760" />
                        <h3 style={{ margin: 0 }}>Preview: {filename}</h3>
                    </div>
                    <div className="flex-center gap-2">
                        <button className="btn flex-center gap-2" style={{ background: 'var(--primary)', border: 'none' }} onClick={onDownload}>
                            <DownloadSimple size={20} />
                            Download
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', overflow: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} style={{
                                            padding: '0.8rem',
                                            color: rowIndex === 0 || rowIndex === 7 ? 'var(--primary)' : 'var(--text-color)',
                                            fontWeight: rowIndex === 0 || rowIndex === 7 ? 'bold' : 'normal',
                                            background: rowIndex === 0 || rowIndex === 7 ? 'rgba(255,255,255,0.05)' : 'transparent'
                                        }}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ProgressBar = ({ start, end }) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    let progress = 0;
    if (now > endDate) progress = 100;
    else if (now > startDate) {
        const totalDuration = differenceInMilliseconds(endDate, startDate);
        const elapsed = differenceInMilliseconds(now, startDate);
        progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }

    return (
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
            <div style={{
                width: `${progress}%`,
                height: '100%',
                background: progress === 100 ? 'var(--success)' : 'var(--primary)',
                transition: 'width 1s linear'
            }} />
        </div>
    );
};

const ClassCard = ({ classData, onPreview }) => {
    const { toggleCertificateIssued, deleteClass, students, updateClass, notify } = useAppContext();
    const isEnded = new Date() > new Date(classData.endDate);
    const [expanded, setExpanded] = useState(false);
    const [isEditingTrainers, setIsEditingTrainers] = useState(false);
    const [trainerInput, setTrainerInput] = useState(classData.trainers ? classData.trainers.join(', ') : '');

    const handleUpdateTrainers = () => {
        const trainersList = trainerInput.split(',').map(t => t.trim()).filter(t => t);
        updateClass(classData.id, { trainers: trainersList });
        setIsEditingTrainers(false);
    };

    // Filter students linked to this class
    // We match purely on classId to ensure accuracy given the new enrollment logic
    const enrolledStudents = students.filter(s => s.classId === classData.id);

    const handleExport = (e) => {
        e.stopPropagation();

        // Prepare data for Excel
        const data = [
            ['Class Information', '', '', '', '', ''],
            ['Name', classData.name, '', '', '', ''],
            ['Start Date', format(new Date(classData.startDate), 'dd/MM/yyyy'), '', '', '', ''],
            ['End Date', format(new Date(classData.endDate), 'dd/MM/yyyy'), '', '', '', ''],
            ['Trainers', classData.trainers ? classData.trainers.join(', ') : 'None', '', '', '', ''],
            ['Status', isEnded ? 'Ended' : (new Date() < new Date(classData.startDate) ? 'Upcoming' : 'Ongoing'), '', '', '', '', ''],
            ['', '', '', '', '', ''], // Empty row
            ['Enrolled Students', '', '', '', '', ''],
            ['Name', 'Organization', 'Date of Birth', 'Email', 'Phone', 'Enrollment Date']
        ];

        enrolledStudents.forEach(s => {
            data.push([
                s.name,
                s.organization || 'N/A',
                s.dob ? format(new Date(s.dob), 'dd/MM/yyyy') : 'N/A',
                s.email || 'N/A',
                s.phone || 'N/A',
                s.enrollmentDate ? format(new Date(s.enrollmentDate), 'dd/MM/yyyy') : 'N/A'
            ]);
        });

        onPreview({
            data: data,
            filename: `${classData.name}_Students.xlsx`
        });
    };

    return (
        <div className="glass-panel p-4 flex-col gap-2">
            <div className="flex-between" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
                <div className="flex-center gap-2">
                    {expanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{classData.name} <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>({enrolledStudents.length})</span></h3>
                </div>
                <div className="flex-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {isEnded && (
                        <div
                            className="flex-center gap-2"
                            style={{
                                cursor: 'pointer',
                                color: classData.certificatesIssued ? 'var(--success)' : 'var(--text-muted)',
                                border: '1px solid var(--border-color)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)'
                            }}
                            onClick={() => toggleCertificateIssued(classData.id)}
                        >
                            {classData.certificatesIssued ? <CheckSquare size={20} /> : <Square size={20} />}
                            <span style={{ fontSize: '0.9rem' }}>Certificates Issued</span>
                        </div>
                    )}
                    <button
                        onClick={handleExport}
                        className="flex-center gap-2"
                        style={{
                            background: 'rgba(30, 215, 96, 0.2)',
                            border: '1px solid rgba(30, 215, 96, 0.4)',
                            color: '#1ed760',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                        title="View in Sheet"
                    >
                        <FileXls size={20} />
                        View in Sheet
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this class?')) deleteClass(classData.id)
                        }}
                        className="flex-center"
                        style={{
                            background: 'rgba(255, 100, 100, 0.2)',
                            border: '1px solid rgba(255, 100, 100, 0.4)',
                            color: '#ff6b6b',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                        }}
                        title="Delete Class"
                    >
                        <Trash size={18} />
                    </button>
                </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {format(new Date(classData.startDate), 'dd/MM/yyyy')} - {format(new Date(classData.endDate), 'dd/MM/yyyy')}
            </div>

            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Trainers:</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditingTrainers(!isEditingTrainers); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                        title="Edit Trainers"
                    >
                        <PencilSimple size={16} />
                    </button>
                </div>
                {isEditingTrainers ? (
                    <div className="flex gap-2" style={{ marginTop: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                        <input
                            className="input-field"
                            value={trainerInput}
                            onChange={(e) => setTrainerInput(e.target.value)}
                            placeholder="Comma separated names"
                            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                        />
                        <button className="btn" onClick={handleUpdateTrainers} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                    </div>
                ) : (
                    <div style={{ fontWeight: '500', color: 'white' }}>
                        {classData.trainers && classData.trainers.length > 0 ? classData.trainers.join(', ') : <span style={{ fontStyle: 'italic', opacity: 0.5 }}>None assigned</span>}
                    </div>
                )}
            </div>

            <ProgressBar start={classData.startDate} end={classData.endDate} />

            <div className="flex-between" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <span>Status: {isEnded ? 'Ended' : (new Date() < new Date(classData.startDate) ? 'Upcoming' : 'Ongoing')}</span>
            </div>

            {expanded && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Enrolled Students</h4>
                    {enrolledStudents.length === 0 ? (
                        <div style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', padding: '0.5rem' }}>No students enrolled in this session.</div>
                    ) : (
                        <div className="flex-col gap-2">
                            {enrolledStudents.map(s => (
                                <div key={s.id} className="flex-between p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                    <div className="flex-col">
                                        <span style={{ fontWeight: '500' }}>{s.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.organization}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                        {format(new Date(s.enrollmentDate), 'dd/MM/yyyy')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AddClassForm = ({ onClose }) => {
    const { addClass } = useAppContext();
    const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', trainers: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        const trainersList = formData.trainers.split(',').map(t => t.trim()).filter(t => t);
        addClass({ ...formData, trainers: trainersList });
        onClose();
    };

    return (
        <div style={{ paddingTop: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Schedule New Class</h3>
            <form onSubmit={handleSubmit} className="flex-col gap-4">
                <div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Class Name</label>
                    <input
                        className="input-field"
                        list="class-options"
                        type="text"
                        placeholder="Select or type class name..."
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <datalist id="class-options">
                        {[
                            "CCNA", "CISSP", "CISM", "CEH", "CCNP", "COMPTIA SECURITY+",
                            "ITIL", "MS PROJECT", "VM WARE", "LINUX", "PMP", "ORACLE",
                            "ICDL", "DATA SCIENCE", "ADVANCED EXCEL"
                        ].map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>
                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Start Date</label>
                    <input
                        className="input-field"
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>
                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>End Date</label>
                    <input
                        className="input-field"
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
                <div className="flex-col gap-2">
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Trainers (Optional)</label>
                    <input
                        className="input-field"
                        type="text"
                        placeholder="e.g. John Doe, Jane Smith (Comma separated)"
                        value={formData.trainers}
                        onChange={(e) => setFormData({ ...formData, trainers: e.target.value })}
                    />
                </div>
                <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
                    Schedule Class
                </button>
            </form>
        </div>
    );
};

const ClassManagement = () => {
    const { classes, notify } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [previewConfig, setPreviewConfig] = useState(null);

    const confirmDownload = () => {
        if (!previewConfig) return;

        try {
            const ws = XLSX.utils.aoa_to_sheet(previewConfig.data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Class Details");
            XLSX.writeFile(wb, previewConfig.filename);
            notify(`Exported ${previewConfig.filename} successfully!`, 'success');
        } catch (error) {
            console.error(error);
            notify('Failed to export Excel file.', 'error');
        }

        setPreviewConfig(null);
    };

    return (
        <div className="flex-col gap-4">
            <div className="flex-between">
                <h1 style={{ fontSize: '2rem' }}>Classes</h1>
                <button className="btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Schedule Class'}
                </button>
            </div>

            {showForm && (
                <div className="glass-panel p-4" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
                    <AddClassForm onClose={() => setShowForm(false)} />
                </div>
            )}

            <div className="flex-col gap-4">
                {classes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        No classes scheduled yet.
                    </div>
                ) : (
                    classes.map(c => <ClassCard key={c.id} classData={c} onPreview={setPreviewConfig} />)
                )}
            </div>

            {previewConfig && (
                <SheetPreviewModal
                    data={previewConfig.data}
                    filename={previewConfig.filename}
                    onClose={() => setPreviewConfig(null)}
                    onDownload={confirmDownload}
                />
            )}
        </div>
    );
};

export default ClassManagement;
