import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { SquaresFour, Student, ChalkboardTeacher, ShieldCheck } from 'phosphor-react';

const Layout = () => {
    return (
        <div className="flex-between w-full" style={{ height: '100vh', alignItems: 'stretch' }}>
            {/* Sidebar */}
            <aside className="glass-panel" style={{
                width: '260px',
                margin: '1rem',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div className="flex-center gap-2" style={{ marginBottom: '3rem', color: 'var(--primary)', fontWeight: '700', fontSize: '1.2rem' }}>
                        <ShieldCheck size={32} weight="fill" />
                        <span>FT-SMS</span>
                    </div>

                    <nav className="flex-col gap-2">
                        <NavLink
                            to="/"
                            className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}
                            style={{ justifyContent: 'flex-start', width: '100%' }}
                        >
                            <SquaresFour size={20} />
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/classes"
                            className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}
                            style={{ justifyContent: 'flex-start', width: '100%' }}
                        >
                            <ChalkboardTeacher size={20} />
                            Classes
                        </NavLink>
                        <NavLink
                            to="/students"
                            className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}
                            style={{ justifyContent: 'flex-start', width: '100%' }}
                        >
                            <Student size={20} />
                            Students
                        </NavLink>
                    </nav>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    FutureTech SMS v1.0
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '1rem 1rem 1rem 0', overflowY: 'auto' }}>
                <div className="glass-panel" style={{ minHeight: '100%', padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
