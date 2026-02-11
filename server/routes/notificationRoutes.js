import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Company from '../models/Company.js';
import Feedback from '../models/Feedback.js';
import EditRequest from '../models/EditRequest.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const notifications = [];
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (req.user.role === 'student') {
            // 1. New Drives (Last 7 days)
            const newDrives = await Company.find({
                createdAt: { $gte: lastWeek }
            }).sort({ createdAt: -1 }).limit(5);

            newDrives.forEach(drive => {
                notifications.push({
                    id: `drive-${drive._id}`,
                    type: 'drive',
                    title: 'New Placement Drive',
                    message: `${drive.name} is hiring for ${drive.roles}`,
                    date: drive.createdAt,
                    link: '/student/drives'
                });
            });

            // 2. Approved Feedbacks (Last 7 days)
            const newFeedbacks = await Feedback.find({
                status: 'approved',
                updatedAt: { $gte: lastWeek }
            }).sort({ updatedAt: -1 }).limit(5);

            newFeedbacks.forEach(fb => {
                notifications.push({
                    id: `fb-${fb._id}`,
                    type: 'feedback',
                    title: 'New Interview Experience',
                    message: `Experience shared for ${fb.companyName}`,
                    date: fb.updatedAt,
                    link: '/student/view-feedback'
                });
            });

        } else if (req.user.role === 'coordinator' || req.user.role === 'admin') {
            // 1. Pending Feedbacks
            const pendingFeedbacks = await Feedback.countDocuments({ status: 'pending' });
            if (pendingFeedbacks > 0) {
                notifications.push({
                    id: 'pending-feedbacks',
                    type: 'alert',
                    title: 'Pending Feedbacks',
                    message: `${pendingFeedbacks} feedbacks waiting for approval.`,
                    date: new Date(),
                    link: '/coordinator/feedback'
                });
            }

            // 2. Pending Edit Requests
            const pendingEdits = await EditRequest.countDocuments({ status: 'pending' });
            if (pendingEdits > 0) {
                notifications.push({
                    id: 'pending-edits',
                    type: 'alert',
                    title: 'Profile Edit Requests',
                    message: `${pendingEdits} student profile requests pending.`,
                    date: new Date(),
                    link: '/coordinator/edit-requests'
                });
            }

            // 3. New Student Registrations (Last 3 days)
            const last3Days = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
            const newStudents = await User.find({
                role: 'student',
                createdAt: { $gte: last3Days }
            }).sort({ createdAt: -1 }).limit(5);

            newStudents.forEach(s => {
                notifications.push({
                    id: `student-${s._id}`,
                    type: 'info',
                    title: 'New Student',
                    message: `${s.name} (${s.rollNo}) joined the portal.`,
                    date: s.createdAt,
                    link: '/coordinator/students'
                });
            });
        }

        // Sort by date (newest first)
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
