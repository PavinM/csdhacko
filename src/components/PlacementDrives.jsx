import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { FileText, Calendar, CheckCircle, Briefcase, ChevronLeft, Edit2, Trash2, BookOpen, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import FeedbackWizard from "./FeedbackWizard";
import EditCompanyModal from "./EditCompanyModal";

export default function PlacementDrives() {
    const { currentUser, userRole } = useAuth();
    const [upcomingDrives, setUpcomingDrives] = useState([]);
    const [ongoingDrives, setOngoingDrives] = useState([]);
    const [completedDrives, setCompletedDrives] = useState([]);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'feedback' | 'edit' | 'resources' | null
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchDrivesData();
        }
    }, [currentUser]);

    const fetchDrivesData = async () => {
        try {
            const companyRes = await api.get('/companies');

            // Only fetch submissions if student
            if (userRole === 'student') {
                const mySubmissionsRes = await api.get('/feedback/my-submissions');
                setMySubmissions(mySubmissionsRes.data);
            }

            const isStudentEligible = (c) => {
                if (userRole !== 'student') return true; // Show all for Admin/Coordinator

                const eligibilityList = c.eligibleStudents?.map(e => e.toLowerCase().trim().replace(/\.\./g, '.')) || [];
                const userEmail = currentUser.email.toLowerCase().trim().replace(/\.\./g, '.');
                const userRollNo = currentUser.rollNo ? currentUser.rollNo.toLowerCase().trim() : "";
                const isWhitelisted = eligibilityList.includes(userEmail) || (userRollNo && eligibilityList.includes(userRollNo));

                let meetsCriteria = true;
                if (c.domain && c.domain !== 'Both') {
                    if (c.domain !== currentUser.domain) meetsCriteria = false;
                }

                const sCGPA = parseFloat(currentUser.cgpa || 0);
                const s10th = parseFloat(currentUser.tenthMark || 0);
                const s12th = parseFloat(currentUser.twelfthMark || 0);

                if (c.eligibility) {
                    if (c.eligibility.cgpaMin && sCGPA < parseFloat(c.eligibility.cgpaMin)) meetsCriteria = false;
                    if (c.eligibility.tenthMin && s10th < parseFloat(c.eligibility.tenthMin)) meetsCriteria = false;
                    if (c.eligibility.twelfthMin && s12th < parseFloat(c.eligibility.twelfthMin)) meetsCriteria = false;
                }

                return isWhitelisted || meetsCriteria;
            };

            const upcoming = [];
            const ongoing = [];
            const completed = [];
            const today = new Date().toISOString().split('T')[0];

            companyRes.data.forEach(c => {
                if (!isStudentEligible(c)) return;

                if (c.status === 'completed') {
                    completed.push(c);
                } else if (c.status === 'scheduled') {
                    if (c.visitDate > today) {
                        upcoming.push(c);
                    } else {
                        ongoing.push(c);
                    }
                } else if (!c.status || c.status === 'ongoing') {
                    ongoing.push(c);
                }
            });

            setUpcomingDrives(upcoming);
            setOngoingDrives(ongoing);
            setCompletedDrives(completed);

        } catch (error) {
            console.error("Error fetching drives data:", error);
        }
        setLoading(false);
    };

    const getSubmissionStatus = (companyName) => {
        return mySubmissions.find(sub => sub.companyName === companyName);
    };

    const handleGiveFeedback = (company) => {
        setSelectedCompany(company);
        setActiveModal('feedback');
    };

    const handleEditCompany = (company) => {
        setSelectedCompany(company);
        setActiveModal('edit');
    };



    if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading drives...</div>;

    const backPath = userRole === 'student' ? '/student' : userRole === 'coordinator' ? '/coordinator' : '/admin';

    const handleDeleteCompany = async (company) => {
        if (window.confirm(`Are you sure you want to delete ${company.name}? This action cannot be undone.`)) {
            try {
                await api.delete(`/companies/${company._id}`);
                fetchDrivesData(); // Refresh list
            } catch (error) {
                console.error("Error deleting company:", error);
                alert("Failed to delete company");
            }
        }
    };

    // Helper for Admin Actions
    const AdminActions = ({ company, isCompleted = false }) => {
        if (userRole !== 'admin') return null;

        return (
            <div className="flex items-center ml-4">
                {!isCompleted && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleEditCompany(company); }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Company Details"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCompany(company); }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition ml-1"
                            title="Delete Company"
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4 mb-6">
                <Link to={backPath} className="p-2 bg-white rounded-full shadow-sm hover:shadow text-slate-500 hover:text-indigo-600 transition">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Placement Drives</h1>
                    <p className="text-slate-500">
                        {userRole === 'student' ? 'Track your eligible upcoming, ongoing, and completed drives.' : 'Manage and view all placement drives.'}
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {/* A. ONGOING DRIVES */}
                {ongoingDrives.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Ongoing Drives (Happening Now)
                        </h3>
                        <div className="space-y-3">
                            {ongoingDrives.map(company => (
                                <div key={company._id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{company.name}</h4>
                                            <p className="text-slate-500 text-sm">{company.roles} • {company.visitDate}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                                            <AdminActions company={company} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* B. UPCOMING DRIVES */}
                {upcomingDrives.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar size={16} /> Upcoming Opportunities
                        </h3>
                        <div className="space-y-3">
                            {upcomingDrives.map(company => (
                                <div key={company._id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{company.name}</h4>
                                        <p className="text-slate-500 text-sm">{company.roles}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-indigo-600 font-bold text-sm">{company.visitDate}</p>
                                            <p className="text-xs text-slate-400">Scheduled</p>
                                        </div>
                                        <AdminActions company={company} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* C. COMPLETED DRIVES */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Completed Drives</h3>
                    {completedDrives.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-3 text-slate-300">
                                <FileText size={24} />
                            </div>
                            <p className="text-slate-500 font-medium">No completed drives yet.</p>
                        </div>
                    ) : (
                        completedDrives.map(company => {
                            let hasSubmitted = false;
                            let isApproved = false;
                            let isPending = false;

                            if (userRole === 'student') {
                                const submission = getSubmissionStatus(company.name);
                                hasSubmitted = !!submission;
                                isApproved = submission?.status === 'approved';
                                isPending = submission?.status === 'pending';
                            }

                            return (
                                <div
                                    key={company._id}
                                    onClick={() => userRole === 'student' && !hasSubmitted && handleGiveFeedback(company)}
                                    className={`bg-white rounded-xl p-5 border shadow-sm mb-4 relative overflow-hidden transition-all ${userRole === 'student' && !hasSubmitted
                                        ? 'border-indigo-100 hover:shadow-md cursor-pointer group'
                                        : 'border-slate-200 cursor-default'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-indigo-900">{company.name}</h3>
                                            <p className="text-sm text-slate-500">{company.roles}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {company.visitDate}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {userRole === 'student' && (
                                                <>
                                                    {isApproved && (
                                                        <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-green-200">
                                                            <CheckCircle size={14} /> Approved
                                                        </span>
                                                    )}
                                                    {isPending && (
                                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-yellow-200">
                                                            ⏳ Pending Review
                                                        </span>
                                                    )}
                                                    {!hasSubmitted && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleGiveFeedback(company); }}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition transform active:scale-95"
                                                        >
                                                            Give Feedback
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <AdminActions company={company} isCompleted={true} />
                                        </div>
                                    </div>
                                    {userRole === 'student' && !hasSubmitted && (
                                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition pointer-events-none"></div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Wizard Modal */}
            {activeModal === 'feedback' && (
                <FeedbackWizard
                    currentUser={currentUser}
                    initialCompany={selectedCompany}
                    onClose={() => setActiveModal(null)}
                    onSuccess={() => {
                        setActiveModal(null);
                        fetchDrivesData();
                    }}
                />
            )}

            {/* Edit Modal (Admin Only) */}
            {activeModal === 'edit' && userRole === 'admin' && (
                <EditCompanyModal
                    company={selectedCompany}
                    onClose={() => {
                        setActiveModal(null);
                        setSelectedCompany(null);
                    }}
                    onSuccess={() => {
                        setActiveModal(null);
                        setSelectedCompany(null);
                        fetchDrivesData();
                    }}
                />
            )}
        </div>
    );
}
