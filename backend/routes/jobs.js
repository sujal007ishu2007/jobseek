const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all jobs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      type,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Execute query with pagination
    const jobs = await Job.find(filter)
      .populate('postedBy', 'name company')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jobs posted by current user (employers)
router.get('/employer/my-jobs', [
  auth,
  requireRole(['employer', 'admin'])
], async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 });

    console.log(`Found ${jobs.length} jobs for employer ${req.user.id}`);

    // Add applications count to each job
    const jobsWithApplicationCount = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await Application.countDocuments({ job: job._id });
        console.log(`Job ${job.title} has ${applicationsCount} applications`);
        return {
          ...job.toObject(),
          applicationsCount
        };
      })
    );

    res.json(jobsWithApplicationCount);
  } catch (error) {
    console.error('Error in /employer/my-jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name company profile.company');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new job (employers only)
router.post('/', [
  auth,
  requireRole(['employer', 'admin']),
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('company').notEmpty().withMessage('Company name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('type').isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']).withMessage('Invalid job type'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = new Job(jobData);
    await job.save();

    const populatedJob = await Job.findById(job._id).populate('postedBy', 'name company');
    
    res.status(201).json(populatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job (only job poster)
router.put('/:id', [
  auth,
  requireRole(['employer', 'admin'])
], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job poster or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name company');

    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job (only job poster)
router.delete('/:id', [
  auth,
  requireRole(['employer', 'admin'])
], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job poster or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
