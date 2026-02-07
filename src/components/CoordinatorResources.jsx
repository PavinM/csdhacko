import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { FileCheck, Building, Users } from "lucide-react";

export default function CoordinatorResources() {
    const { currentUser } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            const { data } = await api.get(`/feedback?department=${currentUser.department}`);
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedback data:", error);
        }
        setLoading(false);
    };

    // Group resources by Company
    const companyResources = feedbacks.reduce((acc, feedback) => {
        const company = feedback.companyName || 'Unknown';
        if (!acc[company]) acc[company] = [];

        // Parse questions string to find resources
        feedback.rounds?.forEach(round => {
            const text = round.questions || '';
            const resourceRegex = /\[(Link|File)\]\s*(.*?):\s*(http[s]?:\/\/[^\s]+)/g;
            let match;
            while ((match = resourceRegex.exec(text)) !== null) {
                acc[company].push({
                    type: match[1], // Link or File
                    title: match[2],
                    url: match[3],
                    round: round.name,
                    student: feedback.studentName || 'Anonymous',
                    date: feedback.driveDate
                });
            }
        });
        return acc;
    }, {});

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-500 gap-2"><div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>Loading resources...</div>;

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50 min-h-screen animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#1A237E] flex items-center gap-3">
                    <FileCheck className="text-teal-500" size={32} /> Shared Resources Library
                </h1>
                <p className="text-slate-500 mt-2">Access study materials and links shared by students from past placement drives.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company List */}
                <div className="space-y-4">
                    {Object.keys(companyResources).length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
                            No resources shared yet.
                        </div>
                    ) : Object.keys(companyResources).map(company => (
                        <div
                            key={company}
                            onClick={() => setSelectedCompany(company)}
                            className={`p-5 rounded-xl cursor-pointer transition-all border ${selectedCompany === company
                                ? 'bg-indigo-600 text-white shadow-lg border-indigo-600 transform scale-[1.02]'
                                : 'bg-white hover:bg-indigo-50 text-slate-700 border-slate-200'}`}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{company}</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${selectedCompany === company ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    {companyResources[company].length} items
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resource List (Expanded) */}
                <div className="md:col-span-2">
                    {selectedCompany ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 p-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    Resources for {selectedCompany}
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                {companyResources[selectedCompany].length > 0 ? companyResources[selectedCompany].map((res, idx) => (
                                    <div key={idx} className="p-4 hover:bg-slate-50 transition flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-lg ${res.type === 'File' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {res.type === 'File' ? <FileCheck size={18} /> : <Building size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-800 text-sm">{res.title}</h4>
                                            <p className="text-xs text-slate-400 mt-1">
                                                By {res.student} • {new Date(res.date).toLocaleDateString()} • {res.round}
                                            </p>
                                        </div>
                                        <a
                                            href={res.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition flex items-center gap-2"
                                        >
                                            {res.type === 'File' ? 'Download' : 'Open Link'}
                                        </a>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-slate-400">This company has no resources yet.</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Users className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a company to view shared resources</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
