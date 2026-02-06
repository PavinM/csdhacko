import { useState } from 'react';
import { X, Check, Link, FileText, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ResourceUpload({ currentUser, onClose, onSuccess, initialCompany = '', initialPackage = '' }) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({}); // Field-level errors
    const [formData, setFormData] = useState({
        companyName: initialCompany,
        salaryPackage: initialPackage,
        examQuestions: [''],
        studyMaterials: '',
        websiteReferences: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (value) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleAddQuestion = () => {
        setFormData(prev => ({
            ...prev,
            examQuestions: [...prev.examQuestions, '']
        }));
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = formData.examQuestions.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            examQuestions: newQuestions.length ? newQuestions : ['']
        }));
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...formData.examQuestions];
        newQuestions[index] = value;
        setFormData(prev => ({
            ...prev,
            examQuestions: newQuestions
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cleanQuestions = formData.examQuestions.filter(q => q.trim() !== '');
            const newErrors = {};



            if (cleanQuestions.length === 0) newErrors.examQuestions = "Please add at least one exam question.";
            if (!formData.studyMaterials) newErrors.studyMaterials = "Study materials are required.";
            if (!formData.websiteReferences) newErrors.websiteReferences = "Website references are required.";

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setLoading(false);
                return;
            }

            await addDoc(collection(db, "resources"), {
                companyName: formData.companyName,
                salaryPackage: formData.salaryPackage,
                examQuestions: cleanQuestions,
                studyMaterials: formData.studyMaterials,
                websiteReferences: formData.websiteReferences,
                studentId: currentUser.uid,
                studentName: currentUser.name,
                department: currentUser.department,
                createdAt: serverTimestamp(),
                type: 'resource_contribution'
            });
            onSuccess();
        } catch (error) {
            console.error("Error submitting resources:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Share Resources</h2>
                        <p className="text-slate-500 text-sm">Help juniors with questions and materials</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="resource-form" onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Company Name</label>
                            <input
                                type="text"
                                required
                                className={`w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-medium text-slate-700 ${initialCompany ? 'opacity-70 cursor-not-allowed' : ''}`}
                                value={formData.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                placeholder="e.g. TCS, Zoho, Amazon"
                                readOnly={!!initialCompany}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Exam / Interview Questions</label>
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                                >
                                    <Plus size={14} /> Add Question
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {formData.examQuestions.map((question, index) => (
                                <div key={index} className="flex gap-2 items-start animate-fade-in">
                                    <span className="mt-3.5 text-xs font-bold text-slate-400 w-4 text-right">{index + 1}.</span>
                                    <div className="flex-1 relative group">
                                        <textarea
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-medium text-slate-700 resize-none min-h-[50px]"
                                            placeholder="Type question here..."
                                            value={question}
                                            onChange={(e) => {
                                                handleQuestionChange(index, e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                                if (e.target.value) setErrors(prev => ({ ...prev, examQuestions: '' }));
                                            }}
                                            rows={1}
                                        />
                                        {formData.examQuestions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(index)}
                                                className="absolute right-2 top-2 text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>


                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <FileText size={14} /> Study Materials
                            </label>
                            <textarea
                                className={`w-full border ${errors.studyMaterials ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 h-24 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-medium text-slate-700 resize-none`}
                                placeholder="List book names, topics, or paste drive links..."
                                value={formData.studyMaterials}
                                onChange={(e) => handleInputChange('studyMaterials', e.target.value)}
                                required
                            />
                            {errors.studyMaterials && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.studyMaterials}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <Link size={14} /> Website References
                            </label>
                            <textarea
                                className={`w-full border ${errors.websiteReferences ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'} rounded-xl p-3.5 h-24 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-medium text-slate-700 resize-none`}
                                placeholder="e.g. https://leetcode.com/problems/..."
                                value={formData.websiteReferences}
                                onChange={(e) => handleInputChange('websiteReferences', e.target.value)}
                                required
                            />
                            {errors.websiteReferences && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.websiteReferences}</p>}
                        </div>


                    </form>
                </div >

                {/* Footer */}
                <div className="p-6 bg-white border-t border-slate-100 flex flex-col items-end gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="resource-form"
                            disabled={loading}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transform active:scale-95 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Resources'} <Check size={18} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
