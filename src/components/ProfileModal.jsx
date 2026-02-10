import { useState, useEffect } from "react";
import { XCircle, User, Mail, Hash, Cake, GraduationCap, Sparkles, TrendingUp, Clock, Edit, Save } from "lucide-react";
import api from "../lib/api";

// Helper component for editable fields
const EditableField = ({ label, value, onChange, disabled, icon: Icon, type = "text" }) => {
    if (disabled) {
        return (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                    {Icon && <Icon size={12} />} {label}
                </p>
                <p className="text-slate-800 font-semibold">{value || 'N/A'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg border-2 border-indigo-300">
            <label className="text-xs text-indigo-700 font-bold uppercase mb-2 block flex items-center gap-1">
                {Icon && <Icon size={12} />} {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 font-semibold"
            />
        </div>
    );
};

export default function ProfileModal({ currentUser, onClose }) {
    const [editRequests, setEditRequests] = useState([]);
    const [requestingEdit, setRequestingEdit] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [reason, setReason] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchEditRequests();
        // Initialize edited data with current user data
        setEditedData({
            rollNo: currentUser?.rollNo || '',
            dob: currentUser?.dob || '',
            section: currentUser?.section || '',
            year: currentUser?.year || '',
            batch: currentUser?.batch || '',
            domain: currentUser?.domain || '',
            tenthMark: currentUser?.tenthMark || '',
            twelfthMark: currentUser?.twelfthMark || '',
            cgpa: currentUser?.cgpa || ''
        });
    }, [currentUser]);

    const fetchEditRequests = async () => {
        try {
            const res = await api.get('/users/my-edit-requests');
            setEditRequests(res.data);
        } catch (error) {
            console.error("Error fetching edit requests:", error);
        }
    };

    const handleRequestEditAccess = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for your edit request');
            return;
        }

        setRequestingEdit(true);
        try {
            await api.post('/users/request-edit', { reason: reason.trim() });
            await fetchEditRequests();
            setShowReasonInput(false);
            setReason('');
            alert('Edit request submitted successfully!');
        } catch (error) {
            console.error("Error requesting edit access:", error);
            alert(error.response?.data?.message || 'Failed to submit edit request');
        } finally {
            setRequestingEdit(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.patch('/users/profile', editedData);
            alert('Profile updated successfully! The page will reload.');
            setIsEditMode(false);
            await fetchEditRequests();
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const hasApprovedRequest = editRequests.some(r => r.status === 'approved');
    const hasPendingRequest = editRequests.some(r => r.status === 'pending');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-indigo-600 to-sky-500 px-8 py-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-2xl font-bold">Profile Details</h2>
                        <p className="text-indigo-100 text-sm mt-1">
                            {isEditMode ? 'Edit your information' : 'View your account information'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 transition p-2 rounded-full"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User size={16} /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditableField label="Full Name" value={currentUser?.name} disabled={true} />
                            <EditableField label="Email" value={currentUser?.email} disabled={true} icon={Mail} />
                            <EditableField
                                label="Roll Number"
                                value={isEditMode ? editedData.rollNo : currentUser?.rollNo}
                                onChange={(val) => handleFieldChange('rollNo', val)}
                                disabled={!isEditMode}
                                icon={Hash}
                            />
                            <EditableField
                                label="Date of Birth"
                                value={isEditMode ? editedData.dob : currentUser?.dob}
                                onChange={(val) => handleFieldChange('dob', val)}
                                disabled={!isEditMode}
                                icon={Cake}
                                type="date"
                            />
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <GraduationCap size={16} /> Academic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditableField label="Department" value={currentUser?.department} disabled={true} />
                            <EditableField
                                label="Year"
                                value={isEditMode ? editedData.year : currentUser?.year}
                                onChange={(val) => handleFieldChange('year', val)}
                                disabled={!isEditMode}
                            />
                            <EditableField
                                label="Section"
                                value={isEditMode ? editedData.section : currentUser?.section}
                                onChange={(val) => handleFieldChange('section', val)}
                                disabled={!isEditMode}
                            />
                            <EditableField
                                label="Batch"
                                value={isEditMode ? editedData.batch : currentUser?.batch}
                                onChange={(val) => handleFieldChange('batch', val)}
                                disabled={!isEditMode}
                            />
                            <EditableField
                                label="Domain"
                                value={isEditMode ? editedData.domain : currentUser?.domain}
                                onChange={(val) => handleFieldChange('domain', val)}
                                disabled={!isEditMode}
                                icon={Sparkles}
                            />
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp size={16} /> Academic Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EditableField
                                label="10th Percentage"
                                value={isEditMode ? editedData.tenthMark : currentUser?.tenthMark}
                                onChange={(val) => handleFieldChange('tenthMark', val)}
                                disabled={!isEditMode}
                                type="number"
                            />
                            <EditableField
                                label="12th Percentage"
                                value={isEditMode ? editedData.twelfthMark : currentUser?.twelfthMark}
                                onChange={(val) => handleFieldChange('twelfthMark', val)}
                                disabled={!isEditMode}
                                type="number"
                            />
                            <EditableField
                                label="Current CGPA"
                                value={isEditMode ? editedData.cgpa : currentUser?.cgpa}
                                onChange={(val) => handleFieldChange('cgpa', val)}
                                disabled={!isEditMode}
                                type="number"
                            />
                        </div>
                    </div>

                    {/* Edit Request Status */}
                    {editRequests.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                                <Clock size={14} /> Edit Request Status
                            </h4>
                            <div className="space-y-2">
                                {editRequests.slice(0, 1).map(req => (
                                    <div key={req._id} className="flex justify-between items-center text-sm">
                                        <span className="text-amber-800">Latest Request:</span>
                                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {req.status.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
                    {isEditMode ? (
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setIsEditMode(false);
                                    setEditedData({
                                        rollNo: currentUser?.rollNo || '',
                                        dob: currentUser?.dob || '',
                                        section: currentUser?.section || '',
                                        year: currentUser?.year || '',
                                        batch: currentUser?.batch || '',
                                        domain: currentUser?.domain || '',
                                        tenthMark: currentUser?.tenthMark || '',
                                        twelfthMark: currentUser?.twelfthMark || '',
                                        cgpa: currentUser?.cgpa || ''
                                    });
                                }}
                                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : hasApprovedRequest ? (
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-green-700 font-bold">
                                ✓ You have edit access. Click "Edit Profile" to update your information.
                            </p>
                            <button
                                onClick={() => setIsEditMode(true)}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-md flex items-center gap-2"
                            >
                                <Edit size={16} />
                                Edit Profile
                            </button>
                        </div>
                    ) : hasPendingRequest ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <p className="text-sm font-bold text-blue-800 mb-1">⏳ Request Pending</p>
                            <p className="text-xs text-blue-600">Your edit request is awaiting coordinator approval.</p>
                        </div>
                    ) : !showReasonInput ? (
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-500 italic">
                                Need to update your information? Request edit access from your coordinator.
                            </p>
                            <button
                                onClick={() => setShowReasonInput(true)}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-md flex items-center gap-2"
                            >
                                Request Edit Access
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Reason for Edit Request <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please explain why you need to update your profile (e.g., wrong marks entered, name correction needed, etc.)"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                                    rows="3"
                                    maxLength="200"
                                />
                                <p className="text-xs text-slate-400 mt-1 text-right">{reason.length}/200 characters</p>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setShowReasonInput(false);
                                        setReason('');
                                    }}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestEditAccess}
                                    disabled={requestingEdit || !reason.trim()}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {requestingEdit ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
