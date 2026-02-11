import { useState, useEffect } from "react";
import api from "../lib/api";
import { X, Save, AlertCircle } from "lucide-react";

export default function EditCompanyModal({ company, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        visitDate: "",
        domain: "Both",
        roles: "",
        minPackage: "",
        maxPackage: "",
        cgpaMin: "",
        tenthMin: "",
        twelfthMin: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || "",
                visitDate: company.visitDate || "",
                domain: company.domain || "Both",
                roles: company.roles ? company.roles.join(", ") : "",
                minPackage: company.salaryPackage?.min || "",
                maxPackage: company.salaryPackage?.max || "",
                cgpaMin: company.eligibility?.cgpaMin || "",
                tenthMin: company.eligibility?.tenthMin || "",
                twelfthMin: company.eligibility?.twelfthMin || ""
            });
        }
    }, [company]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                visitDate: formData.visitDate,
                domain: formData.domain,
                roles: formData.roles.split(",").map(r => r.trim()),
                salaryPackage: {
                    min: Number(formData.minPackage),
                    max: Number(formData.maxPackage)
                },
                eligibility: {
                    cgpaMin: Number(formData.cgpaMin),
                    tenthMin: Number(formData.tenthMin),
                    twelfthMin: Number(formData.twelfthMin)
                }
            };

            await api.put(`/companies/${company._id}`, payload);
            onSuccess();
        } catch (err) {
            console.error("Failed to update company:", err);
            setError(err.response?.data?.message || "Failed to update company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Edit Company Details</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form id="edit-company-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Company Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Visit Date</label>
                                <input
                                    type="date"
                                    name="visitDate"
                                    value={formData.visitDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Domain</label>
                                <select
                                    name="domain"
                                    value={formData.domain}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium bg-white"
                                >
                                    <option value="Both">Both (Hardware & Software)</option>
                                    <option value="Software">Software</option>
                                    <option value="Hardware">Hardware</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Roles (comma separated)</label>
                                <input
                                    type="text"
                                    name="roles"
                                    value={formData.roles}
                                    onChange={handleChange}
                                    placeholder="e.g. SDE, Analyst"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
                            <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wider">Salary Package (LPA)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-indigo-700 mb-1 block">Min</label>
                                    <input
                                        type="number"
                                        name="minPackage"
                                        value={formData.minPackage}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-indigo-700 mb-1 block">Max</label>
                                    <input
                                        type="number"
                                        name="maxPackage"
                                        value={formData.maxPackage}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-4">
                            <h4 className="font-bold text-emerald-900 text-sm uppercase tracking-wider">Eligibility Criteria</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-emerald-700 mb-1 block">Min CGPA</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="cgpaMin"
                                        value={formData.cgpaMin}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-emerald-700 mb-1 block">10th Min %</label>
                                    <input
                                        type="number"
                                        name="tenthMin"
                                        value={formData.tenthMin}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-emerald-700 mb-1 block">12th Min %</label>
                                    <input
                                        type="number"
                                        name="twelfthMin"
                                        value={formData.twelfthMin}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-company-form"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
