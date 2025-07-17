const express = require("express")
const router = express.Router()
const { getAllApplicants, deleteApplicant } = require("../controllers/applicantController")

// GET /api/applicants - fetch all applicants
router.get("/", getAllApplicants)

// DELETE /api/applicants/:id - delete an applicant by ID
router.delete("/:id", deleteApplicant) // Assuming 'auth' middleware is applied globally or handled elsewhere for this route

module.exports = router
