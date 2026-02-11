import { useState, useEffect } from "react";
import api from "../lib/api";
import { X, FileCheck, Building, Download, ExternalLink } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function CompanyResourcesModal({ company, onClose }) {
    const { currentUser, userRole } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (company) {
            fetchResources();
        }
    }, [company]);

    const fetchResources = async () => {
        try {
            // Fetch feedback for this company
            // Students get approved only by default via backend logic
            // Coordinators/Admins get all
            const res = await api.get(`/feedback?company=${company.name}`);

            const extractedResources = [];

            res.data.forEach(feedback => {
                feedback.rounds?.forEach(round => {
                    const text = round.questions || '';
                    // Regex to find [Link] Title: URL or [File] Title: URL
                    const resourceRegex = /\[(Link|File)\]\s*(.*?):\s*(http[s]?:\/\/[^\s]+)/g;
                    let match;
                    while ((match = resourceRegex.exec(text)) !== null) {
                        extractedResources.push({
                            type: match[1], // Link or File
                            title: match[2],
                            url: match[3],
                            round: round.name,
                            student: feedback.studentName || 'Anonymous',
                            date: feedback.driveDate
                        });
                    }
                });
            });

            setResources(extractedResources);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Building className="text-indigo-600" size={24} />
                            {company.name} Resources
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Shared materials and interview experiences</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500 hover:text-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p>Loading resources...</p>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="inline-flex p-4 bg-white rounded-full shadow-sm mb-4 text-slate-300">
                                <FileCheck size={32} />
                            </div>
                            <p className="text-slate-500 font-medium">No resources found for this drive.</p>
                            <p className="text-xs text-slate-400 mt-2">Check back later or ask coordinators.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {resources.map((res, idx) => (
                                <div key={idx} className="group bg-white border border-slate-100 p-4 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all flex items-start gap-4">
                                    <div className={`mt-1 p-3 rounded-xl flex-shrink-0 ${res.type === 'File'
                                            ? 'bg-red-50 text-red-500'
                                            : 'bg-blue-50 text-blue-500'
                                        }`}>
                                        {res.type === 'File' ? <Download size={20} /> : <ExternalLink size={20} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate pr-4">{res.title}</h4>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium">
                                                {res.round}
                                            </span>
                                            <span>Shared by {res.student}</span>
                                            <span>{new Date(res.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${res.type === 'File'
                                                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200'
                                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                            }`}
                                    >
                                        {res.type === 'File' ? 'Download' : 'Open'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
                    Resources are shared by alumni and students. Use them for preparation only.
                </div>
            </div>
        </div>
    );
}
