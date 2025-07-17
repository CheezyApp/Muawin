const Applicant = require("../models/Applicant")
const mongoose = require("mongoose") // Import mongoose to use ObjectId
const { GridFSBucket } = require("mongodb") // Import GridFSBucket

// Get all applicants
const getAllApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find()

    // Transform the data to include cvFile info for frontend
    const applicantsWithCVInfo = applicants.map((applicant) => ({
      ...applicant.toObject(),
      cvFile: applicant.cvFile
        ? {
            _id: applicant.cvFile,
            fileId: applicant.cvFile,
          }
        : null,
      // For demonstration, let's add a random status.
      // In a real app, this would come from your database.
      status: Math.random() > 0.7 ? "accepted" : Math.random() > 0.4 ? "rejected" : "pending",
    }))

    res.status(200).json(applicantsWithCVInfo)
  } catch (error) {
    // console.error("Error fetching applicants:", error)


    res.status(500).json({ message: "Server error" })
  }
}

// Delete an applicant by ID
const deleteApplicant = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid applicant ID" })
    }

    const applicant = await Applicant.findById(id)

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" })
    }

    // If the applicant has a CV file, delete it from GridFS
    if (applicant.cvFile) {
      try {
        if (!global.gridfsBucket) {
          // console.error("GridFSBucket not initialized globally.")


          return res.status(500).json({ message: "File storage not available." })
        }
        const fileObjectId = new mongoose.Types.ObjectId(applicant.cvFile)
        await global.gridfsBucket.delete(fileObjectId)

        // console.log(`CV file ${applicant.cvFile} deleted from GridFS.`)

      } catch (fileDeleteError) {
        // console.error(`Error deleting CV file ${applicant.cvFile} from GridFS:`, fileDeleteError)

      }
    }

    // Delete the applicant record from the database
    await Applicant.deleteOne({ _id: id })

    res.status(200).json({ message: "Applicant and associated CV (if any) deleted successfully" })
  } catch (error) {
    // console.error("Error deleting applicant:", error)


    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getAllApplicants,
  deleteApplicant,
}
