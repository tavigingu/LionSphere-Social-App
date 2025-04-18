import mongoose from "mongoose";

const ReportSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User'
        },
        type: {
            type: String,
            required: true,
            enum: ['post', 'user', 'comment', 'general']
        },
        itemId: {
            type: String,
            // Required for post, comment, and user reports
        },
        postUserId: {
            type: String,
            // Required for post reports - the owner of the post
        },
        category: {
            type: String,
            // Required for general reports (bug, feature, content)
        },
        reason: {
            type: String,
            // Required for post, comment reports (inappropriate, spam, etc.)
        },
        text: {
            type: String,
            // Optional additional details
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
            default: 'pending'
        },
        adminNote: {
            type: String
            // Optional note from admin who reviewed report
        }
    },
    {
        timestamps: true
    }
);

ReportSchema.index({ status: 1, createdAt: -1 }); // For fetching recent reports by status
ReportSchema.index({ type: 1, status: 1 }); // For fetching reports by type and status
ReportSchema.index({ userId: 1 }); // For fetching reports by user

const ReportModel = mongoose.model('Report', ReportSchema);
export default ReportModel;