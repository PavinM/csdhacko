import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { getDomainFromDept } from "../utils/studentUtils";
import { UserPlus, Search, MoreVertical, X, Users, Mail, BookOpen, Calendar, Hash } from "lucide-react";

export default function StudentManagement() {
    const { currentUser, createUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Updated State with new schema fields
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        password: '',
        dob: '',
        rollNo: '',
        section: '',
        year: '1',
        tenthMark: '',
        twelfthMark: '',
        cgpa: '',
        domain: '',
        batch: ''
    });

    useEffect(() => {
        if (currentUser) {
            fetchStudents();
        }
    }, [currentUser]);

    const fetchStudents = async () => {
        try {
            const userDomain = getDomainFromDept(currentUser.department);
            let query = `role=student&department=${currentUser.department}`; // Fallback

            if (userDomain !== 'Both') {
                query = `role=student&domainType=${userDomain}`;
            }

            // Fetch students from API
            const { data } = await api.get(`/users?${query}`);
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]); // fallback or error state
        }
        setLoading(false);
    };

    const handleMarkPlaced = async (studentId) => {
        const company = prompt("Enter the company name where the student is placed:");
        if (!company) return;

        try {
            await api.patch(`/users/${studentId}/placed`, {
                isPlaced: true,
                placedCompany: company
            });

            // Optimistic update or refresh
            setStudents(prev => prev.map(s =>
                s._id === studentId ? { ...s, isPlaced: true, placedCompany: company } : s
            ));
            alert("Student marked as placed!");
        } catch (error) {
            alert("Error updating status: " + (error.response?.data?.message || error.message));
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            // Use createUser from AuthContext (which now calls the API)
            await createUser(newStudent.email, newStudent.password, {
                name: newStudent.name,
                role: 'student',
                department: currentUser.department,
                dob: newStudent.dob,
                rollNo: newStudent.rollNo,
                section: newStudent.section,
                year: newStudent.year,
                tenthMark: Number(newStudent.tenthMark),
                twelfthMark: Number(newStudent.twelfthMark),
                cgpa: Number(newStudent.cgpa),
                domain: newStudent.domain,
                batch: newStudent.batch
            });

            setIsCreating(false);
            setNewStudent({
                name: '', email: '', password: '', dob: '', rollNo: '', section: '', year: '1',
                tenthMark: '', twelfthMark: '', cgpa: '', domain: '', batch: ''
            });
            fetchStudents(); // Refresh list
            alert("Student created successfully!");
        } catch (error) {
            alert("Error creating student: " + error.message);
        }
    };

    // Updated search to include Roll No
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNo && student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading student data...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A237E]">Student Management</h1>
                    <p className="text-slate-500 text-sm">Manage students in {currentUser?.department} Department</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-[#8BC34A] hover:bg-[#7CB342] text-white px-5 py-2.5 rounded-lg font-bold transition shadow-md hover:shadow-lg active:scale-95"
                >
                    <UserPlus size={18} /> Add New Student
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
                        <h3 className="text-3xl font-bold text-[#1A237E] mt-1">{students.length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users size={24} />
                    </div>
                </div>
                {/* Placeholder for other stats */}
            </div>

            {/* Student List Table - Aligned with requested Schema */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-lg text-[#1A237E]">Enrolled Students</h2>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2 w-full md:w-64">
                        <Search size={16} className="text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search by name, roll no..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="p-4 border-r border-slate-100">Roll No</th>
                                <th className="p-4 border-r border-slate-100">Name</th>
                                <th className="p-4 border-r border-slate-100">10th Mark</th>
                                <th className="p-4 border-r border-slate-100">12th Mark</th>
                                <th className="p-4 border-r border-slate-100">Current CGPA</th>
                                <th className="p-4 border-r border-slate-100">Email</th>
                                <th className="p-4 border-r border-slate-100">Department</th>
                                <th className="p-4 border-r border-slate-100">Domain</th>
                                <th className="p-4">Placement Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-mono font-medium border-r border-slate-50">{student.rollNo || "-"}</td>
                                    <td className="p-4 font-bold text-[#1A237E] border-r border-slate-50">{student.name}</td>
                                    <td className="p-4 border-r border-slate-50">{student.tenthMark || "-"}%</td>
                                    <td className="p-4 border-r border-slate-50">{student.twelfthMark || "-"}%</td>
                                    <td className="p-4 font-bold text-emerald-600 border-r border-slate-50">{student.cgpa || "-"}</td>
                                    <td className="p-4 text-slate-500 border-r border-slate-50">{student.email}</td>
                                    <td className="p-4 border-r border-slate-50">{student.department || "-"}</td>
                                    <td className="p-4 border-r border-slate-50">
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium border border-indigo-100">
                                            {student.domain || "N/A"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {student.isPlaced ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200 flex flex-col items-center">
                                                <span>PLACED</span>
                                                <span className="text-[10px] uppercase">{student.placedCompany}</span>
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleMarkPlaced(student._id)}
                                                className="bg-slate-100 hover:bg-green-100 hover:text-green-700 text-slate-500 px-3 py-1 rounded text-xs font-bold border border-slate-200 transition"
                                            >
                                                Mark Placed
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 animate-fade-in relative border-t-4 border-[#8BC34A] max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-[#1A237E] mb-1">Add New Student</h2>
                        <p className="text-xs text-slate-500 mb-6 uppercase tracking-wide">Enter complete student profile</p>

                        <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Personal Info */}
                            <div className="md:col-span-3">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Personal & Contact</h3>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Full Name</label>
                                <input type="text" required className="input-field" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="e.g. Rahul Kumar" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Email Address</label>
                                <input type="email" required className="input-field" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="student@kongu.edu" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Date of Birth</label>
                                <input type="date" required className="input-field" value={newStudent.dob} onChange={e => setNewStudent({ ...newStudent, dob: e.target.value })} />
                            </div>

                            {/* Academic Info */}
                            <div className="md:col-span-3 mt-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Academic Details</h3>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Roll Number</label>
                                <input type="text" required className="input-field" value={newStudent.rollNo} onChange={e => setNewStudent({ ...newStudent, rollNo: e.target.value })} placeholder="e.g. 22CSE045" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Section</label>
                                <input type="text" required className="input-field" value={newStudent.section} onChange={e => setNewStudent({ ...newStudent, section: e.target.value })} placeholder="e.g. A" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Year of Study</label>
                                <select className="input-field" value={newStudent.year} onChange={e => setNewStudent({ ...newStudent, year: e.target.value })}>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Batch</label>
                                <input type="text" className="input-field" value={newStudent.batch} onChange={e => setNewStudent({ ...newStudent, batch: e.target.value })} placeholder="e.g. 2022-2026" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Domain</label>
                                <input type="text" className="input-field" value={newStudent.domain} onChange={e => setNewStudent({ ...newStudent, domain: e.target.value })} placeholder="e.g. Full Stack Development, AI/ML" />
                            </div>

                            {/* Marks */}
                            <div className="md:col-span-3 mt-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Performance Metrics</h3>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">10th Mark (%)</label>
                                <input type="number" step="0.01" className="input-field" value={newStudent.tenthMark} onChange={e => setNewStudent({ ...newStudent, tenthMark: e.target.value })} placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">12th Mark (%)</label>
                                <input type="number" step="0.01" className="input-field" value={newStudent.twelfthMark} onChange={e => setNewStudent({ ...newStudent, twelfthMark: e.target.value })} placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Current CGPA</label>
                                <input type="number" step="0.01" max="10" className="input-field" value={newStudent.cgpa} onChange={e => setNewStudent({ ...newStudent, cgpa: e.target.value })} placeholder="0.00" />
                            </div>

                            {/* Security */}
                            <div className="md:col-span-3 mt-4">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Password</label>
                                <input type="password" required className="input-field" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} placeholder="••••••••" />
                            </div>

                            <div className="md:col-span-3 mt-6">
                                <button type="submit" className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3.5 rounded-lg shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                                    <UserPlus size={18} /> Create Student Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .input-field {
                    width: 100%;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    outline: none;
                    transition: all 0.2s;
                    background-color: #f8fafc;
                }
                .input-field:focus {
                    border-color: #1A237E;
                    background-color: white;
                    box-shadow: 0 0 0 1px #1A237E;
                }
            `}</style>
        </div>
    );
}
