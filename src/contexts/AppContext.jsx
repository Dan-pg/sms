import React, { createContext, useState, useEffect, useContext } from 'react';
import { differenceInDays, differenceInCalendarDays, isFuture, isPast } from 'date-fns';
import { CheckCircle, Warning, Info, X } from 'phosphor-react';

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL:", API_URL);

const ToastContext = createContext();

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={24} color="var(--success)" weight="fill" />}
          {toast.type === 'error' && <Warning size={24} color="#ff6b6b" weight="fill" />}
          {toast.type === 'info' && <Info size={24} color="var(--primary)" weight="fill" />}
          <div style={{ flex: 1 }}>{toast.message}</div>
          <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7 }}>
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  console.log("Stats Provider Loaded - Version 2 (API Delete)");
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- API Helpers ---

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, studentRes] = await Promise.all([
        fetch(`${API_URL}/classes`),
        fetch(`${API_URL}/students`)
      ]);

      if (classRes.ok) {
        const classData = await classRes.json();
        // Detect snake_case vs camelCase if needed, presently backend returns snake_case for fields like start_date
        // We will map them to our internal camelCase usage
        const mappedClasses = classData.map(c => ({
          ...c,
          startDate: c.start_date,
          endDate: c.end_date,
          certificatesIssued: c.certificates_issued
        }));
        setClasses(mappedClasses);
      }

      if (studentRes.ok) {
        const studentData = await studentRes.json();
        const mappedStudents = studentData.map(s => ({
          ...s,
          classId: s.class_id,
          className: s.class_name,
          idType: s.id_type,
          file: s.id_file_path ? { name: s.id_file_name, path: s.id_file_path } : null,
          enrollmentDate: s.enrollment_date
        }));
        setStudents(mappedStudents);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Initial Fetch ---
  useEffect(() => {
    fetchData();
  }, []);

  // --- Actions ---

  const enrollStudent = async (studentFormData) => {
    // Expecting studentFormData to be a FormData object
    try {
      const res = await fetch(`${API_URL}/students`, {
        method: 'POST',
        body: studentFormData,
        // Content-Type header is set automatically with FormData
      });

      if (res.ok) {
        await fetchData(); // Refresh list to get new student including file path
        return true;
      } else {
        console.error("Enrollment failed");
        return false;
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      return false;
    }
  };

  const addClass = async (classData) => {
    const newClass = {
      ...classData,
      id: crypto.randomUUID(),
      status: 'Scheduled', // Default
      startDate: classData.startDate, // Ensure these match what backend expects or map them
      endDate: classData.endDate
    };

    try {
      const res = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newClass,
          start_date: newClass.startDate, // Map to snake_case for backend
          end_date: newClass.endDate
        })
      });
      if (res.ok) {
        await fetchData();
        notify('Class scheduled successfully!', 'success');
      } else {
        const errorData = await res.json();
        console.error("Failed to add class:", errorData);
        notify(`Failed to schedule class: ${errorData.error || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      console.error("Error adding class:", err);
      notify('Network error when scheduling class.', 'error');
    }
  };

  const updateStudent = async (id, studentFormData) => {
    try {
      const res = await fetch(`${API_URL}/students/${id}`, {
        method: 'PUT',
        body: studentFormData,
      });

      if (res.ok) {
        await fetchData(); // Refresh data
        return true;
      } else {
        console.error("Update failed");
        return false;
      }
    } catch (err) {
      console.error("Update error:", err);
      return false;
    }
  };

  const updateClass = (classId, updates) => {
    // TODO: Implement API update
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, ...updates } : c));
  };

  const toggleCertificateIssued = (classId) => {
    // TODO: Implement API update
    setClasses(prev => prev.map(c =>
      c.id === classId ? { ...c, certificatesIssued: !c.certificatesIssued } : c
    ));
  };

  const deleteClass = async (classId) => {
    console.log("Attempting to delete class via API:", classId);
    try {
      const res = await fetch(`${API_URL}/classes/${classId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setClasses(prev => prev.filter(c => c.id !== classId));
        notify('Class deleted successfully', 'success');
      } else {
        const errorData = await res.json();
        notify(`Failed to delete class: ${errorData.error || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      console.error("Error deleting class:", err);
      notify('Network error when deleting class.', 'error');
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      const res = await fetch(`${API_URL}/students/${studentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Derived State Helpers ---
  const getStats = () => {
    const now = new Date();
    const totalClasses = classes.length;

    // Use calendar days for comparison to ensure classes starting "today" are Active, not Future.
    // Future: Starts tomorrow or later (diff > 0)
    const futureClasses = classes.filter(c => {
      const start = new Date(c.startDate);
      // We compare start date to now. If start date is strictly in the future (tomorrow+), it's future.
      // However, differenceInCalendarDays(start, now) > 0 means start is at least 1 day ahead.
      // If start is today, diff is 0.
      return differenceInCalendarDays(start, now) > 0;
    }).length;

    // Ended: Ends yesterday or earlier (diff < 0)
    const endedClasses = classes.filter(c => {
      const end = new Date(c.endDate);
      // If end is today, diff is 0. If end is yesterday, diff is -1.
      return differenceInCalendarDays(end, now) < 0;
    }).length;

    const activeClasses = totalClasses - futureClasses - endedClasses;

    return { totalClasses, futureClasses, endedClasses, activeClasses, totalStudents: students.length };
  };

  return (
    <AppContext.Provider value={{
      students,
      classes,
      loading,
      enrollStudent,
      updateStudent,
      addClass,
      updateClass,
      toggleCertificateIssued,
      deleteClass,
      deleteStudent,
      getStats,
      notify
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
