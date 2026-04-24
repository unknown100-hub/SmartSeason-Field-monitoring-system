const express = require('express');
const router = express.Router();
const{protect,adminOnly,agentOnly}= require('../middleware/authMiddleware');
const {createField, getFields, getFieldById, updateField, deleteField} = require('../controllers/fieldcontroller');

//dashboards
router.get('/dashboard/admin',  protect, adminOnly,  getDashboardSummary);
router.get('/dashboard/agent',  protect, agentOnly,  getAgentDashboard);
 
// ── Field listing ─────────────────────────────────────────────────────────────
router.get('/',     protect, adminOnly, getAllFields);   // admin sees all
router.get('/mine', protect, agentOnly, getMyFields);   // agent sees assigned
 
// ── Single field ──────────────────────────────────────────────────────────────
router.get('/:id',    protect, getFieldById);
router.post('/',      protect, adminOnly, createField);
router.put('/:id',    protect, adminOnly, updateField);
router.delete('/:id', protect, adminOnly, deleteField);
 
// ── Assignment management (admin only) ───────────────────────────────────────
router.post('/:id/assign', protect, adminOnly, assignAgent);
router.delete('/:id/assign', protect, adminOnly, removeAgent);
 
// ── Field updates (agents only) ───────────────────────────────────────────────
router.post('/:id/updates', protect, agentOnly, addFieldUpdate);
 