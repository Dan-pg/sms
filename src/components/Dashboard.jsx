import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ChartBar, CheckCircle, Clock, Users } from 'phosphor-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-panel p-4 flex-col gap-2" style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
        borderLeft: `4px solid ${color}`
    }}>
        <div className="flex-between">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{title}</span>
            <Icon size={24} color={color} />
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
    </div>
);

const Dashboard = () => {
    const { getStats } = useAppContext();
    const stats = getStats();

    return (
        <div className="flex-col gap-4">
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Dashboard Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                    title="Total Classes"
                    value={stats.totalClasses}
                    icon={ChartBar}
                    color="var(--primary)"
                />
                <StatCard
                    title="Active Classes"
                    value={stats.activeClasses}
                    icon={Clock}
                    color="#FFBC99"
                />
                <StatCard
                    title="Future Classes"
                    value={stats.futureClasses}
                    icon={Clock}
                    color="#CABDFF"
                />
                <StatCard
                    title="Ended Classes"
                    value={stats.endedClasses}
                    icon={CheckCircle}
                    color="var(--success)"
                />
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    color="#B5E4CA"
                />
            </div>

            {/* Could add a Recent Activity section here later */}
        </div>
    );
};

export default Dashboard;
