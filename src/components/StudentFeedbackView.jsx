import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Added useLocation
import api from "../lib/api";
import { Search, Building2, Calendar, Star, MessageSquare, ChevronRight, Briefcase, Download, ExternalLink } from "lucide-react";

export default function StudentFeedbackView() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);

    const location = useLocation(); // Hook to get URL params

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Effect to handle URL Query Params
    useEffect(() => {
        if (!loading && feedbacks.length > 0) {
            const params = new URLSearchParams(location.search);
            const companyParam = params.get("company");
            if (companyParam) {
                // Find company in grouped feedbacks (we need to wait for grouping, or just search in feedbacks)
                // Use a timeout or dependency on feedbacks/groupedFeedbacks
                // But groupedFeedbacks is derived.
                // We'll handle this in the render or separate effect depending on how we group.
                // Let's do it here:
                const decodedName = decodeURIComponent(companyParam);
                // We need to re-group to find the company object matching the name
                // Or just set searchTerm to filter?
                // Better: Set selectedCompany directly if found.
                // We'll do this logic inside a useEffect that depends on [feedbacks, location.search]
            }
        }
    }, [loading, feedbacks, location.search]); // Run when feedbacks loaded or URL changes

    const fetchFeedbacks = async () => {
        try {
            const { data } = await api.get('/feedback?status=approved');
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        } finally {
            setLoading(false);
        }
    };

    // Group feedbacks by Company
    const groupedFeedbacks = feedbacks.reduce((acc, fb) => {
        const companyName = fb.companyName;
        if (!acc[companyName]) {
            acc[companyName] = {
                name: companyName,
                role: fb.jobRole, // Taking one role for simplicity
                feedbacks: []
            };
        }
        acc[companyName].feedbacks.push(fb);
        return acc;
    }, {});

    const companies = Object.values(groupedFeedbacks).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Auto-select company from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const companyParam = params.get("company");
        if (companyParam && companies.length > 0 && !selectedCompany) {
            const target = companies.find(c => c.name.toLowerCase() === decodeURIComponent(companyParam).toLowerCase());
            if (target) setSelectedCompany(target);
        }
    }, [feedbacks, location.search]); // companies is derived from feedbacks



    if (loading) return <div className="p-10 text-center text-slate-500">Loading feedbacks...</div>;

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 p-6">
            {/* Sidebar List - Companies */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-[#1A237E] text-lg mb-4">Placement Feedback</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-[#1A237E] outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {companies.length === 0 ? (
                        <div className="text-center p-8 text-slate-400 text-sm">No companies found.</div>
                    ) : (
                        companies.map((company, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedCompany(company)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedCompany?.name === company.name
                                    ? "bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200"
                                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${selectedCompany?.name === company.name ? "bg-[#1A237E] text-white" : "bg-slate-100 text-slate-500"
                                            }`}>
                                            {company.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-sm ${selectedCompany?.name === company.name ? "text-[#1A237E]" : "text-slate-700"}`}>
                                                {company.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                <MessageSquare size={12} /> {company.feedbacks.length} Reviews
                                            </div>
                                        </div>
                                    </div>
                                    {selectedCompany?.name === company.name && <ChevronRight size={16} className="text-[#1A237E]" />}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content - Feedbacks for Selected Company */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {selectedCompany ? (
                    <>
                        <div className="p-6 border-b border-slate-100 bg-white shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#1A237E] rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-200">
                                    {selectedCompany.name.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-[#1A237E]">{selectedCompany.name}</h1>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                                            <Briefcase size={12} /> {selectedCompany.role || "Role N/A"}
                                        </span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                                            {selectedCompany.feedbacks.length} Verified Reviews
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="space-y-6 max-w-4xl mx-auto">
                                {selectedCompany.feedbacks.map((fb, idx) => (
                                    <div key={fb._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-100">
                                                    S{idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">Student Feedback #{idx + 1}</p>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Calendar size={12} /> {fb.driveDate}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                                <Star size={12} fill="currentColor" /> Approved
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                                    Overall Experience
                                                </h4>
                                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                    {fb.overallExperience}
                                                </p>
                                            </div>

                                            {fb.rounds && fb.rounds.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <div className="w-1 h-3 bg-teal-500 rounded-full"></div>
                                                        Interview Rounds
                                                    </h4>
                                                    <div className="grid gap-3">
                                                        {fb.rounds.map((round, rIdx) => (
                                                            <div key={rIdx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                                                <span className="font-bold text-[#1A237E] text-sm block mb-1">{round.name}</span>
                                                                <div className="text-sm text-slate-600">
                                                                    {(() => {
                                                                        try {
                                                                            const text = String(round.questions || '');
                                                                            // Regex to split by the resource pattern to separate text from links
                                                                            const parts = text.split(/(\[(?:Link|File)\]\s*.*?\:\s*http[s]?:\/\/[^\s]+)/g);

                                                                            return parts.map((part, i) => {
                                                                                const match = part.match(/^\[(Link|File)\]\s*(.*?):\s*(http[s]?:\/\/[^\s]+)$/);
                                                                                if (match) {
                                                                                    const [_, type, title, url] = match;
                                                                                    return (
                                                                                        <a
                                                                                            key={i}
                                                                                            href={url}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            className="block mt-2 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition group"
                                                                                        >
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div className={`p-2 rounded-lg ${type === 'File' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                                                                    {type === 'File' ? <Download size={16} /> : <ExternalLink size={16} />}
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <p className="text-sm font-bold text-slate-700 truncate">{title}</p>
                                                                                                    <p className="text-xs text-slate-400 truncate font-mono">{url}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </a>
                                                                                    );
                                                                                }
                                                                                return <span key={i} className="whitespace-pre-line">{part}</span>;
                                                                            });
                                                                        } catch (err) {
                                                                            console.error("Error parsing resources:", err);
                                                                            return <span className="whitespace-pre-line">{round.questions}</span>;
                                                                        }
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {fb.preparationTips && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#1A237E] uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
                                                        Preparation Tips
                                                    </h4>
                                                    <div className="bg-amber-50 p-4 rounded-lg text-amber-900 text-sm border border-amber-100 leading-relaxed">
                                                        {fb.preparationTips}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Building2 size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-600">Select a Company</h3>
                        <p className="text-sm text-slate-500 mt-1">Choose a company from the list to view detailed feedback.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
