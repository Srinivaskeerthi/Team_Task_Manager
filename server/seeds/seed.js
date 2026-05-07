import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});

    // Create users
    const admin = await User.create({
      name: 'Alex Morgan',
      email: 'admin@flowsphere.com',
      password: 'admin123',
      role: 'admin',
      avatar: '',
      productivityScore: 85,
      streakCount: 12,
      badges: [
        { name: 'Streak Starter', icon: '🔥' },
        { name: 'Week Warrior', icon: '⚡' },
      ],
    });

    const member1 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@flowsphere.com',
      password: 'member123',
      role: 'member',
      productivityScore: 72,
      streakCount: 5,
      badges: [{ name: 'Streak Starter', icon: '🔥' }],
    });

    const member2 = await User.create({
      name: 'James Wilson',
      email: 'james@flowsphere.com',
      password: 'member123',
      role: 'member',
      productivityScore: 68,
      streakCount: 3,
    });

    const member3 = await User.create({
      name: 'Maya Patel',
      email: 'maya@flowsphere.com',
      password: 'member123',
      role: 'member',
      productivityScore: 91,
      streakCount: 20,
      badges: [
        { name: 'Streak Starter', icon: '🔥' },
        { name: 'Week Warrior', icon: '⚡' },
        { name: 'Consistency King', icon: '👑' },
      ],
    });

    console.log('✅ Users created');

    // Create projects
    const project1 = await Project.create({
      name: 'FlowSphere Platform',
      description: 'Building the next-generation team collaboration platform with real-time features and AI-powered insights.',
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: member1._id, role: 'member' },
        { user: member2._id, role: 'member' },
        { user: member3._id, role: 'member' },
      ],
      status: 'active',
      priority: 'high',
      tags: ['web', 'react', 'fullstack'],
      category: 'Development',
      dueDate: new Date('2026-06-30'),
    });

    const project2 = await Project.create({
      name: 'Marketing Campaign Q2',
      description: 'Plan and execute the Q2 marketing campaign across social media, email, and content channels.',
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: member1._id, role: 'member' },
      ],
      status: 'active',
      priority: 'medium',
      tags: ['marketing', 'social-media'],
      category: 'Marketing',
      dueDate: new Date('2026-06-15'),
    });

    const project3 = await Project.create({
      name: 'Mobile App Redesign',
      description: 'Redesign the mobile application with new UI/UX patterns and improved performance.',
      owner: member3._id,
      members: [
        { user: member3._id, role: 'admin' },
        { user: member2._id, role: 'member' },
        { user: admin._id, role: 'member' },
      ],
      status: 'planning',
      priority: 'high',
      tags: ['mobile', 'design', 'ui/ux'],
      category: 'Design',
      dueDate: new Date('2026-07-31'),
    });

    console.log('✅ Projects created');

    // Create tasks for project 1
    const tasks = [
      { title: 'Setup project architecture', description: 'Initialize the monorepo with client and server directories', project: project1._id, assignedTo: admin._id, createdBy: admin._id, status: 'completed', priority: 'high', order: 0, completedAt: new Date('2026-05-01') },
      { title: 'Design database schemas', description: 'Create MongoDB schemas for users, projects, tasks, comments', project: project1._id, assignedTo: member1._id, createdBy: admin._id, status: 'completed', priority: 'high', order: 1, completedAt: new Date('2026-05-02') },
      { title: 'Implement authentication', description: 'JWT auth with login, signup, protected routes', project: project1._id, assignedTo: member2._id, createdBy: admin._id, status: 'completed', priority: 'urgent', order: 2, completedAt: new Date('2026-05-03') },
      { title: 'Build dashboard UI', description: 'Create the main dashboard with stats cards and charts', project: project1._id, assignedTo: member3._id, createdBy: admin._id, status: 'in-progress', priority: 'high', order: 0, dueDate: new Date('2026-05-10') },
      { title: 'Implement drag-and-drop', description: 'Add drag and drop functionality to kanban board', project: project1._id, assignedTo: member1._id, createdBy: admin._id, status: 'in-progress', priority: 'medium', order: 1, dueDate: new Date('2026-05-12') },
      { title: 'Real-time notifications', description: 'Socket.io integration for live notifications', project: project1._id, assignedTo: member2._id, createdBy: admin._id, status: 'review', priority: 'medium', order: 0, dueDate: new Date('2026-05-08') },
      { title: 'Landing page design', description: 'Create stunning SaaS landing page with animations', project: project1._id, assignedTo: member3._id, createdBy: admin._id, status: 'todo', priority: 'medium', order: 0, dueDate: new Date('2026-05-15') },
      { title: 'API documentation', description: 'Write comprehensive API docs using Swagger', project: project1._id, assignedTo: member1._id, createdBy: admin._id, status: 'todo', priority: 'low', order: 1, dueDate: new Date('2026-05-20') },
      { title: 'Performance optimization', description: 'Optimize React bundle size and API response times', project: project1._id, assignedTo: admin._id, createdBy: admin._id, status: 'todo', priority: 'medium', order: 2, dueDate: new Date('2026-05-25') },
      // Project 2 tasks
      { title: 'Create content calendar', description: 'Plan all social media posts for Q2', project: project2._id, assignedTo: member1._id, createdBy: admin._id, status: 'in-progress', priority: 'high', order: 0, dueDate: new Date('2026-05-10') },
      { title: 'Design email templates', description: 'Create responsive email templates for campaigns', project: project2._id, assignedTo: member1._id, createdBy: admin._id, status: 'todo', priority: 'medium', order: 0, dueDate: new Date('2026-05-18') },
      // Project 3 tasks
      { title: 'User research & surveys', description: 'Conduct user research for mobile app redesign', project: project3._id, assignedTo: member2._id, createdBy: member3._id, status: 'in-progress', priority: 'high', order: 0, dueDate: new Date('2026-05-12') },
      { title: 'Wireframe new screens', description: 'Create low-fidelity wireframes for all screens', project: project3._id, assignedTo: member3._id, createdBy: member3._id, status: 'todo', priority: 'high', order: 0, dueDate: new Date('2026-05-20') },
    ];

    await Task.insertMany(tasks);
    console.log('✅ Tasks created');

    console.log('\n🎉 Seed data created successfully!');
    console.log('📧 Admin login: admin@flowsphere.com / admin123');
    console.log('📧 Member login: sarah@flowsphere.com / member123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
