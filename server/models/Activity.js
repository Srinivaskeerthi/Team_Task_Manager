import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created_project', 'updated_project', 'deleted_project', 'archived_project',
      'created_task', 'updated_task', 'completed_task', 'deleted_task',
      'moved_task', 'assigned_task', 'commented',
      'joined_project', 'left_project', 'invited_member', 'removed_member',
      'uploaded_file', 'earned_badge', 'streak_milestone',
    ],
  },
  entityType: {
    type: String,
    enum: ['project', 'task', 'comment', 'user'],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for efficient activity feed queries
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
