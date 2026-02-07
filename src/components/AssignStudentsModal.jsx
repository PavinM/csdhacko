import { useState, useEffect } from "react";
import api from "../lib/api";
import { Users, Search, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { getDomainFromDept } from "../utils/studentUtils";

export default function AssignStudentsModal({ currentUser, company, onClose, onSuccess }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [domainFilter, setDomainFilter] = useState('All'); // 'All', 'Software', 'Hardware'

    useEffect(() => {
        fetchStudents();
    }, [currentUser]);

    // Initialize selected students from company's existing list if any
    useEffect(() => {
        if (company?.eligibleStudents && students.length > 0) {
            const initialSelection = new Set();
            // Match by email or rollNo (assuming eligibleStudents stores emails or rollNos)
            // The StudentDashboard uses email/rollNo check. Let's assume it stores Email.
            // Let's safe check both.
            students.forEach(s => {
                if (company.eligibleStudents.includes(s.email) || company.eligibleStudents.includes(s.rollNo)) {
                    initialSelection.add(s._id);
                }
            });
            setSelectedStudents(initialSelection);
        }
    }, [company, students]);

    const fetchStudents = async () => {
        try {
            // Fetch students based on Coordinator's Domain
            const userDomain = getDomainFromDept(currentUser.department);
            let query = `?role=student`;

            // If Coordinator is Software, they should see Software students.
            // If Both, they see all.
            if (userDomain !== 'Both') {
                query += `&domainType=${userDomain}`;
            }

            const res = await api.get(`/users${query}`);
            setStudents(res.data);

            // Set initial domain filter based on user
            setDomainFilter(userDomain === 'Both' ? 'All' : userDomain);

        } catch (error) {
            console.error("Error fetching students:", error);
        }
        setLoading(false);
    };

    const handleToggleStudent = (studentId) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedStudents.size === filteredStudents.length) {
            setSelectedStudents(new Set()); // Deselect All
        } else {
            // Add all currently filtered students
            const newSelected = new Set(selectedStudents);
            filteredStudents.forEach(s => newSelected.add(s._id));
            setSelectedStudents(newSelected);
        }
    };

    const handleSave = async () => {
        try {
            // We need to send the list of identifiers (Email usually, or Roll No)
            // The system uses Email/RollNo for whitelisting strictly?
            // Let's check StudentDashboard: `eligibilityList.includes(userEmail)`
            // So we should save Emails.

            const selectedEmails = students
                .filter(s => selectedStudents.has(s._id))
                .map(s => s.email);

            await api.put(`/companies/${company._id}/eligibility`, {
                eligibleStudents: selectedEmails
            });

            onSuccess();
        } catch (error) {
            console.error("Error updates company eligibility:", error);
            alert("Failed to assign students. Please try again.");
        }
    };

    const filteredStudents = students.filter(s => {
        // Search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = s.name.toLowerCase().includes(searchLower) ||
            s.rollNo?.toLowerCase().includes(searchLower) ||
            s.email.toLowerCase().includes(searchLower);
        return matchesSearch;
    });

    if (!currentUser) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                    <div>
                        <h3 className="font-bold text-xl text-[#1A237E]">Assign Students to {company.name}</h3>
                        <p className="text-sm text-slate-500">Select eligible students for this drive.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                        <XCircle size={28} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex gap-4 bg-white">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, roll no, or email..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC]">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">Loading students...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">No students found matching your search.</div>
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-2 px-2">
                                <span className="text-sm font-bold text-slate-500">{selectedStudents.size} selected</span>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-indigo-600 font-bold hover:underline"
                                >
                                    {selectedStudents.size === filteredStudents.length ? "Deselect All" : "Select All Visible"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredStudents.map(student => {
                                    const isSelected = selectedStudents.has(student._id);
                                    return (
                                        <div
                                            key={student._id}
                                            onClick={() => handleToggleStudent(student._id)}
                                            className={`
                                                cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-between group
                                                ${isSelected
                                                    ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                                                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                                    ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}
                                                `}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                        {student.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-500">{student.rollNo} • {student.department}</p>
                                                    {student.cgpa && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mt-1 inline-block">CGPA: {student.cgpa}</span>}
                                                </div>
                                            </div>

                                            <div className={`
                                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                                ${isSelected
                                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                                    : 'border-slate-300 group-hover:border-indigo-400'
                                                }
                                            `}>
                                                {isSelected && <CheckCircle size={14} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-white rounded-b-xl flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                        Assigning <span className="font-bold text-indigo-900">{selectedStudents.size}</span> students
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-[#1A237E] hover:bg-[#283593] text-white font-bold rounded-lg transition shadow-md flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> Confirm Assignment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
