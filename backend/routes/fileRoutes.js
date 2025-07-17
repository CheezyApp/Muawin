const express = require("express")
const router = express.Router()
const fileController = require("../controllers/fileController")

// Debug route to test if file routes are working
router.get("/test", (req, res) => {
  // console.log("File routes test endpoint hit!")


  res.json({
    message: "File routes are working!",
    timestamp: new Date().toISOString(),
  })
})

// Debug route to test CV download path
router.get("/submit/test", (req, res) => {
  // console.log("Submit test endpoint hit!")


  res.json({
    message: "Submit routes are working!",
    timestamp: new Date().toISOString(),
  })
})

// CV Download routes - Multiple variations to ensure one works
router.get("/submit/download/:fileId", (req, res, next) => {
  // console.log(`[ROUTE HIT] /submit/download/${req.params.fileId}`)


  fileController.downloadFileById(req, res, next)
})

router.get("/cv/download/:fileId", (req, res, next) => {
  // console.log(`[ROUTE HIT] /cv/download/${req.params.fileId}`)


  fileController.downloadFileById(req, res, next)
})

router.get("/downloadById/:fileId", (req, res, next) => {
  // console.log(`[ROUTE HIT] /downloadById/${req.params.fileId}`)


  fileController.downloadFileById(req, res, next)
})

router.get("/downloadById/:id", (req, res, next) => {
  // console.log(`[ROUTE HIT] /downloadById/${req.params.id}`)


  fileController.downloadFileById(req, res, next)
})

// Regular file operations
router.get("/:category/:zone/:branch", fileController.getFilesByCategory)
router.post("/:category/:zone/:branch", fileController.upload.single("file"), fileController.uploadFile)
router.get("/download/:filename", fileController.downloadFile)
router.delete("/:category/:zone/:branch/:filename", fileController.deleteFile)

module.exports = router
