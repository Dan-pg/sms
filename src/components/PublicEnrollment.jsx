import React from 'react';
import EnrollmentForm from './EnrollmentForm';

const PublicEnrollment = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-dark)',
            color: 'var(--text-light)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem'
        }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                }}>
                    FutureTech Academy
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Student Enrollment Portal</p>
            </div>

            <EnrollmentForm />

            <footer style={{ marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} FutureTech Academy. All rights reserved.
            </footer>
        </div>
    );
};

export default PublicEnrollment;
