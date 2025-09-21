const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply for a job
router.post('/', [
  auth,
  requireRole(['jobseeker']),
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('coverLetter').notEmpty().withMessage('Cover letter is required'),
  body('resume').notEmpty().withMessage('Resume is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, coverLetter, resume } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return res.status(404).json({ message: 'Job not found or no longer active' });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const application = new Application({
      job: jobId,
      applicant: req.user.id,
      coverLetter,
      resume
    });

    await application.save();

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company location')
      .populate('applicant', 'name email');

    res.status(201).json(populatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's applications (jobseekers)
router.get('/my-applications', [
  auth,
  requireRole(['jobseeker'])
], async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type status')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for a specific job (employers)
router.get('/job/:jobId', [
  auth,
  requireRole(['employer', 'admin'])
], async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user owns the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email profile')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (employers)
router.put('/:applicationId/status', [
  auth,
  requireRole(['employer', 'admin']),
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(applicationId).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the job
    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    if (notes) application.notes = notes;
    if (status !== 'pending') application.reviewedAt = new Date();

    await application.save();

    const updatedApplication = await Application.findById(applicationId)
      .populate('job', 'title company location')
      .populate('applicant', 'name email');

    res.json(updatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single application details
router.get('/:applicationId', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('job', 'title company location type postedBy')
      .populate('applicant', 'name email profile');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    const isApplicant = application.applicant._id.toString() === req.user.id;
    const isJobOwner = application.job.postedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete application (jobseekers only, before review)
router.delete('/:applicationId', [
  auth,
  requireRole(['jobseeker'])
], async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the application
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }

    // Don't allow deletion if already reviewed
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete application that has been reviewed' });
    }

    await Application.findByIdAndDelete(req.params.applicationId);

    // Update job applications count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationsCount: -1 }
    });

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept application (convenience endpoint)
router.put('/:applicationId/accept', [
  auth,
  requireRole(['employer', 'admin'])
], async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;

    const application = await Application.findById(applicationId).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the job
    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = 'hired';
    if (notes) application.notes = notes;
    application.reviewedAt = new Date();

    await application.save();

    const updatedApplication = await Application.findById(applicationId)
      .populate('job', 'title company location')
      .populate('applicant', 'name email');

    res.json(updatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject application (convenience endpoint)
router.put('/:applicationId/reject', [
  auth,
  requireRole(['employer', 'admin'])
], async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;

    const application = await Application.findById(applicationId).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the job
    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = 'rejected';
    if (notes) application.notes = notes;
    application.reviewedAt = new Date();

    await application.save();

    const updatedApplication = await Application.findById(applicationId)
      .populate('job', 'title company location')
      .populate('applicant', 'name email');

    res.json(updatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
