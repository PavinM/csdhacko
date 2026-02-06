import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { UserPlus, Search, MoreVertical, X, Users, Mail, BookOpen, Calendar, Hash } from "lucide-react";

export default function StudentManagement() {
    const { currentUser, createUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Updated State with new fields
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        password: '',
        dob: '',
        rollNo: '',
        section: '',
        year: '1'
    });

    useEffect(() => {
        if (currentUser) {
            fetchStudents();
        }
    }, [currentUser]);

    const fetchStudents = async () => {
        try {
            // Fetch students from API
            const { data } = await api.get(`/users?role=student&department=${currentUser.department}`);
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]); // fallback or error state
        }
        setLoading(false);
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
                year: newStudent.year
            });

            setIsCreating(false);
            setNewStudent({ name: '', email: '', password: '', dob: '', rollNo: '', section: '', year: '1' });
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Today</p>
                        <h3 className="text-3xl font-bold text-[#00897B] mt-1">{students.length > 0 ? Math.floor(students.length * 0.8) : 0}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <BookOpen size={24} />
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-lg text-[#1A237E]">Enrolled Students</h2>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center px-3 py-2 w-full md:w-64">
                        <Search size={16} className="text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search by name, email, roll no..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1A237E]/5 text-[#1A237E] uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-5">Student Name & Roll No</th>
                                <th className="p-5">Contact</th>
                                <th className="p-5">Academic Info</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#1A237E]/10 flex items-center justify-center text-[#1A237E] font-bold border border-[#1A237E]/20">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700">{student.name}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                                                    <Hash size={10} /> {student.rollNo || "No Roll No"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm text-slate-600 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            {student.email}
                                        </div>
                                        {student.dob && (
                                            <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs">
                                                <Calendar size={12} />
                                                Born: {student.dob}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-sm text-slate-600">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">Year {student.year || '-'}</span>
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded w-fit">Section {student.section || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button className="text-slate-400 hover:text-[#1A237E] transition p-2 hover:bg-slate-100 rounded-full">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in relative border-t-4 border-[#8BC34A] max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-[#1A237E] mb-1">Add New Student</h2>
                        <p className="text-xs text-slate-500 mb-6 uppercase tracking-wide">Enter student credentials</p>

                        <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Full Name</label>
                                <input
                                    type="text" required
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                    placeholder="e.g. Rahul Kumar"
                                />
                            </div>

                            {/* Date of Birth & Roll Number */}
                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Date of Birth</label>
                                <input
                                    type="date" required
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newStudent.dob} onChange={e => setNewStudent({ ...newStudent, dob: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Roll Number</label>
                                <input
                                    type="text" required
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newStudent.rollNo} onChange={e => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                                    placeholder="e.g. 22CSE045"
                                />
                            </div>

                            {/* Section & Year */}
                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Section</label>
                                <input
                                    type="text" required
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newStudent.section} onChange={e => setNewStudent({ ...newStudent, section: e.target.value })}
                                    placeholder="e.g. A"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Year of Study</label>
                                <select
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newStudent.year} onChange={e => setNewStudent({ ...newStudent, year: e.target.value })}
                                >
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>

                            {/* Email & Password */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Email Address</label>
                                <input
                                    type="email" required
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                    placeholder="student@kongu.edu"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-[#1A237E] uppercase mb-1">Password</label>
                                <input
                                    type="password" required
                                    className="w-full border border-slate-200 rounded-lg p-3 focus:border-[#1A237E] focus:ring-1 focus:ring-[#1A237E] outline-none transition bg-slate-50 focus:bg-white"
                                    value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="md:col-span-2 mt-2">
                                <button type="submit" className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3.5 rounded-lg shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                                    <UserPlus size={18} /> Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
