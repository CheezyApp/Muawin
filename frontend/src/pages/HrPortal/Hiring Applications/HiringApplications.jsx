"use client"

import { useEffect, useState, useRef } from "react"
import MainContentWrapper from "./MainContentWrapper"
import { useTheme } from "@mui/material/styles"
// Import Material UI Icons
import PeopleIcon from "@mui/icons-material/People"
import DeleteIcon from "@mui/icons-material/Delete"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import * as XLSX from "xlsx"
import ReactDOM from 'react-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import useMediaQuery from '@mui/material/useMediaQuery';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

const HiringApplications = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedContent, setExpandedContent] = useState(null) // Re-enabled
  const [selectedApplicants, setSelectedApplicants] = useState([])
  const [deleteModal, setDeleteModal] = useState({ open: false, applicantId: null, applicantName: "" })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' })
  const [sortMode, setSortMode] = useState(null) // null, 'asc', 'desc'
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [selectApplicantsModalOpen, setSelectApplicantsModalOpen] = useState(false)
  const [autoSelectCount, setAutoSelectCount] = useState('')
  const [filters, setFilters] = useState({ month: '', branch: '', position: '', education: '' })
  const [allBranches, setAllBranches] = useState([])
  const [allDesignations, setAllDesignations] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false)
  const [addDesignationModal, setAddDesignationModal] = useState(false)
  const [newDesignation, setNewDesignation] = useState("")
  const [addingDesignation, setAddingDesignation] = useState(false)
  const [editingDesignationId, setEditingDesignationId] = useState(null)
  const [editingDesignationName, setEditingDesignationName] = useState("")
  const [deletingDesignationId, setDeletingDesignationId] = useState(null)
  const [processingDesignation, setProcessingDesignation] = useState(false)

  const fetchApplicants = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/applicants`);
      if (!response.ok) throw new Error("Failed to fetch applicants");
      const data = await response.json();
      setApplicants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Move fetchDesignations above useEffect
  const fetchDesignations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/designations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      const data = await response.json()
      setAllDesignations(data)
    } catch (error) {
      // console.error("Error fetching designations:", error)

    }
  }

  useEffect(() => {
    // Fetch branches
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/branches`)
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        const data = await response.json()
        setAllBranches(data)
      } catch (error) {
        // console.error("Error fetching branches:", error)

      }
    }
    fetchBranches()
    fetchDesignations()
    fetchApplicants()
  }, [])

  const handleDownloadCV = async (cvFileId, applicantName) => {
    if (!cvFileId) {
      alert("No CV file available for this applicant.")
      return
    }

    const url = `${process.env.REACT_APP_API_BASE_URL}/files/submit/download/${cvFileId}`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          alert("CV file not found. Please contact support.")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = downloadUrl
      a.download = `CV_${applicantName.replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      alert("Failed to download CV. Please try again.")
    }
  }

  const handleExpandContent = (content, title, type) => {
    // Re-enabled
    setExpandedContent({ content, title, type })
  }

  const closeExpandedContent = () => {
    // Re-enabled
    setExpandedContent(null)
  }

  const handleDeleteApplicant = (applicantId, applicantName) => {
    setDeleteModal({ open: true, applicantId, applicantName })
  }

  const confirmDeleteApplicant = async () => {
    const { applicantId, applicantName } = deleteModal
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/applicants/${applicantId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete applicant")
      }
      setApplicants(applicants.filter((app) => app._id !== applicantId))
      setDeleteModal({ open: false, applicantId: null, applicantName: "" })
      setSnackbar({ open: true, message: `${applicantName}'s application deleted successfully!`, type: 'success' })
    } catch (error) {
      // console.error("Error deleting applicant:", error)


      setDeleteModal({ open: false, applicantId: null, applicantName: "" })
      setSnackbar({ open: true, message: `Failed to delete ${applicantName}'s application. Please try again.`, type: 'error' })
    }
  }

  // Snackbar auto-hide effect
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar((s) => ({ ...s, open: false })), 3000)
      return () => clearTimeout(timer)
    }
  }, [snackbar.open])

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }))

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, applicantId: null, applicantName: "" })
  }

  const handleToggleSelectApplicant = (applicantId) => {
    setSelectedApplicants((prevSelected) =>
      prevSelected.includes(applicantId)
        ? prevSelected.filter((id) => id !== applicantId)
        : [...prevSelected, applicantId],
    )
  }

  const handleAutoSelectApplicants = () => {
    setSelectApplicantsModalOpen(true);
  }
  const closeSelectApplicantsModal = () => {
    setSelectApplicantsModalOpen(false);
    setAutoSelectCount('');
  }

  // Helper to format date as DD/MM/YY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  // Export selected applicants to Excel (excluding CV and Status, add Submission Date)
  const handleExportToExcel = () => {
    if (selectedApplicants.length === 0) return;
    const selectedData = applicants
      .filter((app) => selectedApplicants.includes(app._id))
      .map((app) => ({
        "Form Number": app.formNumber || "",
        Name: app.name || "",
        CNIC: app.cnic || "",
        Mobile: app.mobileNumber || "",
        Age: app.age || "",
        Address: app.address || "",
        Education: app.education || "",
        Position: app.designation || "",
        Branch: app.branch || "",
        Experience: app.experience || "",
        "Submission Date": app.createdAt ? formatDate(app.createdAt) : "N/A",
      }));
    const worksheet = XLSX.utils.json_to_sheet(selectedData);

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 14 }, // Form Number
      { wch: 20 }, // Name
      { wch: 18 }, // CNIC
      { wch: 16 }, // Mobile
      { wch: 8 },  // Age
      { wch: 30 }, // Address
      { wch: 18 }, // Education
      { wch: 18 }, // Position
      { wch: 18 }, // Branch
      { wch: 24 }, // Experience
      { wch: 16 }, // Submission Date
    ];

    // Add bold headers and borders
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
      if (!worksheet[cellAddress]) continue
      worksheet[cellAddress].s = {
        font: { bold: true },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
        alignment: { horizontal: "center" },
      }
    }
    // Add borders to all data cells
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (!worksheet[cellAddress]) continue
        worksheet[cellAddress].s = {
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        }
      }
    }
    // Freeze the header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants")
    XLSX.writeFile(workbook, "Selected_Applicants.xlsx")
  }

  const ExpandableCell = ({ content, title, maxLength = 30, type = "text" }) => {
    const isLong = content && String(content).length > maxLength
    const truncated = isLong ? String(content).substring(0, maxLength) + "..." : String(content) || "N/A"

    return (
      <div
        style={{
          position: "relative",
          cursor: isLong ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
        onClick={() => isLong && handleExpandContent(String(content), title, type)} // Re-enabled
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {truncated}
        </span>
        {isLong && (
          <span
            style={{
              fontSize: "14px",
              color: "#f15a22",
              opacity: 0.7,
              transition: "all 0.2s ease",
              transform: "scale(1)",
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = "1"
              e.target.style.transform = "scale(1.2)"
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = "0.7"
              e.target.style.transform = "scale(1)"
            }}
          >
            🔍
          </span>
        )}
      </div>
    )
  }

  const ContentModal = ({ content, title, type, onClose }) => {
    // Re-enabled
    if (!content) return null

    return (
      <div
        style={styles.modalOverlay}
        onClick={onClose}
      >
        <div
          style={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.modalTitleBar}>
            <h3 style={styles.modalTitle}>{title}</h3>
            <button
              onClick={onClose}
              style={styles.modalCloseBtn}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDarkMode ? '#232323' : '#f1f5f9'
                e.target.style.color = '#f15a22'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = isDarkMode ? '#b0b0b0' : '#64748b'
              }}
            >
              ×
            </button>
          </div>
          <div style={styles.modalContentText}>
            {content}
          </div>
        </div>
        <style jsx>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    )
  }

  const styles = {
    container: {
      padding: "24px",
      backgroundColor: isDarkMode ? "#181818" : "#f8fafc",
      minHeight: "100vh",
      height: "100vh",
      overflow: "hidden",
    },
    header: {
      marginBottom: "32px",
      textAlign: "center",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      color: isDarkMode ? "#fff" : "#1e293b",
      marginBottom: "8px",
      background: isDarkMode
        ? `linear-gradient(135deg, #f15a22, #ff7849)`
        : `linear-gradient(135deg, #f15a22, #ff7849)` ,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    subtitle: {
      fontSize: "16px",
      color: isDarkMode ? "#b0b0b0" : "#64748b",
      fontWeight: "400",
    },
    statsContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "24px",
      marginBottom: "32px",
      flexWrap: "wrap",
    },
    statCard: {
      backgroundColor: isDarkMode ? "#232323" : "white",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: isDarkMode
        ? "0 4px 12px -1px rgba(0,0,0,0.5)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      minWidth: "120px",
      border: isDarkMode ? "1px solid #333" : "1px solid #e2e8f0",
      transition: "all 0.3s ease",
    },
    statNumber: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#f15a22",
      marginBottom: "4px",
    },
    statLabel: {
      fontSize: "14px",
      color: isDarkMode ? "#b0b0b0" : "#64748b",
      fontWeight: "500",
    },
    tableContainer: {
      backgroundColor: isDarkMode ? "#232323" : "white",
      borderRadius: "16px",
      boxShadow: isDarkMode
        ? "0 10px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.2)"
        : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      overflow: "hidden",
      border: isDarkMode ? "1px solid #333" : "1px solid #e2e8f0",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      backgroundColor: isDarkMode ? "#181818" : "#f15a22",
      color: "white",
    },
    th: {
      padding: "16px 12px",
      textAlign: "left",
      fontWeight: "600",
      fontSize: "14px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: isDarkMode ? "2px solid #333" : "2px solid #e53e3e",
    },
    tbody: {
      backgroundColor: isDarkMode ? "#232323" : "white",
    },
    tr: {
      borderBottom: isDarkMode ? "1px solid #333" : "1px solid #e2e8f0",
      transition: "all 0.2s ease",
    },
    trHover: {
      backgroundColor: isDarkMode ? "#232323" : "#fef7f0",
      transform: "translateY(-1px)",
      boxShadow: isDarkMode
        ? "0 4px 8px rgba(0,0,0,0.4)"
        : "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    td: {
      padding: "16px 12px",
      fontSize: "14px",
      color: isDarkMode ? "#e0e0e0" : "#374151",
      verticalAlign: "middle",
      maxWidth: "200px",
    },
    downloadButton: {
      backgroundColor: "#f15a22",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      textTransform: "uppercase",
      letterSpacing: "0.025em",
      boxShadow: isDarkMode
        ? "0 2px 4px rgba(241, 90, 34, 0.3)"
        : "0 2px 4px rgba(241, 90, 34, 0.2)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      justifyContent: "center",
    },
    downloadButtonHover: {
      backgroundColor: "#d14d1f",
      transform: "translateY(-2px)",
      boxShadow: isDarkMode
        ? "0 6px 12px rgba(241, 90, 34, 0.5)"
        : "0 6px 12px rgba(241, 90, 34, 0.4)",
    },
    noCV: {
      color: isDarkMode ? "#888" : "#9ca3af",
      fontSize: "12px",
      fontStyle: "italic",
      padding: "8px 16px",
      backgroundColor: isDarkMode ? "#232323" : "#f3f4f6",
      borderRadius: "6px",
      display: "inline-block",
      border: isDarkMode ? "1px dashed #444" : "1px dashed #d1d5db",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "400px",
      flexDirection: "column",
    },
    loadingSpinner: {
      width: "40px",
      height: "40px",
      border: isDarkMode ? "4px solid #232323" : "4px solid #f3f4f6",
      borderTop: "4px solid #f15a22",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "16px",
    },
    loadingText: {
      color: isDarkMode ? "#b0b0b0" : "#64748b",
      fontSize: "16px",
    },
    errorContainer: {
      backgroundColor: isDarkMode ? "#2d1a1a" : "#fef2f2",
      border: isDarkMode ? "1px solid #a94442" : "1px solid #fecaca",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
      color: isDarkMode ? "#ffb4b4" : "#dc2626",
      fontSize: "16px",
    },
    actionButton: {
      backgroundColor: "#f15a22",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: isDarkMode
        ? "0 2px 4px rgba(241, 90, 34, 0.3)"
        : "0 2px 4px rgba(241, 90, 34, 0.2)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    actionButtonHover: {
      backgroundColor: "#d14d1f",
      transform: "translateY(-2px)",
      boxShadow: isDarkMode
        ? "0 4px 8px rgba(241, 90, 34, 0.5)"
        : "0 4px 8px rgba(241, 90, 34, 0.3)",
    },
    deleteButton: {
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 12px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: isDarkMode
        ? "0 2px 4px rgba(239, 68, 68, 0.3)"
        : "0 2px 4px rgba(239, 68, 68, 0.2)",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      justifyContent: "center",
    },
    deleteButtonHover: {
      backgroundColor: "#dc2626",
      transform: "translateY(-1px)",
      boxShadow: isDarkMode
        ? "0 4px 8px rgba(239, 68, 68, 0.5)"
        : "0 4px 8px rgba(239, 68, 68, 0.3)",
    },
    statusIcon: {
      width: "20px",
      height: "20px",
      verticalAlign: "middle",
      marginRight: "5px",
    },
    checkbox: {
      marginRight: "8px",
      accentColor: "#f15a22",
      cursor: "pointer",
    },
    // MODAL DARK MODE
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
    },
    modalContent: {
      backgroundColor: isDarkMode ? "#232323" : "white",
      borderRadius: "16px",
      padding: "24px",
      maxWidth: "500px",
      width: "100%",
      maxHeight: "70vh",
      overflow: "auto",
      boxShadow: isDarkMode
        ? "0 25px 50px -12px rgba(0,0,0,0.7)"
        : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      position: "relative",
      animation: "modalSlideIn 0.3s ease-out",
    },
    modalTitleBar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px",
      paddingBottom: "16px",
      borderBottom: `2px solid #f15a22`,
    },
    modalTitle: {
      margin: 0,
      color: isDarkMode ? "#fff" : "#1e293b",
      fontSize: "20px",
      fontWeight: "600",
    },
    modalCloseBtn: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: isDarkMode ? "#b0b0b0" : "#64748b",
      padding: "4px",
      borderRadius: "6px",
      transition: "all 0.2s ease",
    },
    modalContentText: {
      color: isDarkMode ? "#e0e0e0" : "#374151",
      lineHeight: "1.6",
      fontSize: "15px",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },
    // FILTER PANEL
    filterPanel: {
      position: 'absolute',
      left: 0,
      top: 'calc(100% + 10px)',
      background: isDarkMode ? '#232323' : '#fff',
      border: isDarkMode ? '1px solid #333' : '1px solid #e2e8f0',
      borderRadius: 12,
      boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.32)' : '0 8px 32px rgba(0,0,0,0.12)',
      padding: '24px 20px 16px 20px',
      zIndex: 11000,
      minWidth: 260,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      marginTop: 0,
    },
    filterLabel: {
      fontWeight: 600,
      color: isDarkMode ? '#e0e0e0' : '#374151',
      fontSize: 14,
    },
    filterSelect: {
      width: '100%',
      marginTop: 4,
      padding: 6,
      borderRadius: 6,
      border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb',
      background: isDarkMode ? '#232323' : '#fff',
      color: isDarkMode ? '#e0e0e0' : '#374151',
    },
    filterClearBtn: {
      marginTop: 8,
      background: isDarkMode ? '#232323' : '#f3f4f6',
      color: isDarkMode ? '#e0e0e0' : '#374151',
      border: 'none',
      borderRadius: 8,
      padding: '8px 0',
      fontWeight: 600,
      fontSize: 15,
      cursor: 'pointer',
    },
    rowEven: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      color: isDarkMode ? '#e0e0e0' : '#374151',
    },
    rowOdd: {
      backgroundColor: isDarkMode ? '#181818' : '#f9f9f9',
      color: isDarkMode ? '#e0e0e0' : '#374151',
    },
  }

  // Sorting logic for Submission Date
  const cycleSortMode = () => {
    setSortMode((prev) => {
      if (prev === null) return 'asc'
      if (prev === 'asc') return 'desc'
      return null
    })
  }

  const getSortedApplicants = () => {
    if (sortMode === 'asc') {
      return [...applicants].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortMode === 'desc') {
      return [...applicants].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return applicants
  }
  // Unique filter options
  const months = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  // Branches: filter out hidden branches as in UserForm
  const hiddenBranches = [
    "Cheezious Peshawar",
    "Cheezious Mardan",
    "Cheezious Warehouse Humak",
    "Cheezious Headquarters",
    "Cheezious Workshop",
    "Cheezious Support Center"
  ];
  const displayBranches = allBranches.filter(branch => !hiddenBranches.includes(branch.name || branch))
  const branchOptions = ['', ...displayBranches.map(branch => branch.name || branch), "ANY RAWALPINDI BRANCH", "ANY ISLAMABAD BRANCH", "ANY BRANCH"]
  // Designations
  const positionOptions = ['', ...allDesignations]
  // Education (still from applicants, as it's static in the form)
  const uniqueEducations = ['', 'Matric', 'Intermediate', 'Bachelors', 'Masters']

  // Filtering logic
  const applyFilters = (apps) => {
    return apps.filter(app => {
      // Month filter
      if (filters.month) {
        const d = new Date(app.createdAt)
        const monthName = months[d.getMonth() + 1]
        if (monthName !== filters.month) return false
      }
      // Branch filter
      if (filters.branch && app.branch !== filters.branch) return false
      // Position filter
      if (filters.position && app.designation !== filters.position) return false
      // Education filter
      if (filters.education && app.education !== filters.education) return false
      return true
    })
  }

  // Compose: sort, then filter
  const displayedApplicants = applyFilters(getSortedApplicants())

  const handleFilterChange = (field, value) => {
    setFilters(f => ({ ...f, [field]: value }))
  }
  const clearFilters = () => setFilters({ month: '', branch: '', position: '', education: '' })

  // Close filter popup when clicking outside
  const filterPanelRef = useRef(null)
  const filterBtnRef = useRef(null)
  useEffect(() => {
    if (!filterPanelOpen) return
    const handleClick = (e) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target)
      ) {
        setFilterPanelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filterPanelOpen])

  // Calculate filter popup position for portal
  const [filterPanelCoords, setFilterPanelCoords] = useState({ left: 0, top: 0, width: 0 });
  useEffect(() => {
    function updateCoords() {
      if (filterPanelOpen && filterBtnRef.current) {
        const rect = filterBtnRef.current.getBoundingClientRect();
        setFilterPanelCoords({
          left: rect.left,
          top: rect.bottom + 10, // 10px below the button
          width: rect.width,
        });
      }
    }
    if (filterPanelOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [filterPanelOpen]);

  // Remove height/overflow for mobile
  const containerStyle = isMobile
    ? { ...styles.container, height: 'auto', minHeight: '100vh', overflow: 'visible', paddingBottom: 32 }
    : styles.container;

  if (loading) {
    return (
      <MainContentWrapper>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <div style={styles.loadingText}>Loading applicants...</div>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </MainContentWrapper>
    )
  }

  if (error) {
    return (
      <MainContentWrapper>
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <h3 style={{ margin: "0 0 8px 0" }}>Error Loading Applications</h3>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        </div>
      </MainContentWrapper>
    )
  }

  const totalApplicants = applicants.length
  // Only totalApplicants is needed for the tile now

  // Card style for mobile
  const cardStyles = {
    background: isDarkMode ? '#232323' : '#fff',
    borderRadius: 14,
    boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.32)' : '0 2px 8px rgba(0,0,0,0.10)',
    margin: '0 0 18px 0',
    padding: '18px 14px 14px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    border: isDarkMode ? '1px solid #333' : '1px solid #e2e8f0',
    position: 'relative',
  };

  const handleBulkDeleteApplicants = () => {
    setBulkDeleteModal(true)
  }
  const closeBulkDeleteModal = () => {
    setBulkDeleteModal(false)
  }
  const confirmBulkDeleteApplicants = async () => {
    setBulkDeleteModal(false)
    if (selectedApplicants.length === 0) return
    try {
      // Delete all selected applicants in parallel
      await Promise.all(selectedApplicants.map(applicantId =>
        fetch(`${process.env.REACT_APP_API_BASE_URL}/applicants/${applicantId}`, { method: "DELETE" })
      ))
      setSnackbar({ open: true, message: `Selected applications deleted successfully!`, type: 'success' })
      setSelectedApplicants([])
      fetchApplicants()
    } catch (error) {
      setSnackbar({ open: true, message: `Failed to delete some applications. Please try again.`, type: 'error' })
      fetchApplicants()
    }
  }

  const openAddDesignationModal = () => {
    setNewDesignation("")
    setAddDesignationModal(true)
  }
  const closeAddDesignationModal = () => {
    setAddDesignationModal(false)
    setNewDesignation("")
  }
  const handleAddDesignation = async () => {
    if (!newDesignation.trim()) {
      setSnackbar({ open: true, message: 'Designation name cannot be empty.', type: 'error' })
      return
    }
    if (allDesignations.some(d => d.name === newDesignation.trim())) {
      setSnackbar({ open: true, message: 'Designation already exists.', type: 'error' })
      return
    }
    setAddingDesignation(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/designations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newDesignation.trim() })
      })
      if (!response.ok) throw new Error('Failed to add designation')
      setSnackbar({ open: true, message: 'Designation added successfully!', type: 'success' })
      setAddDesignationModal(false)
      setNewDesignation("")
      await fetchDesignations()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add designation. Please try again.', type: 'error' })
    } finally {
      setAddingDesignation(false)
    }
  }

  const startEditDesignation = (id, name) => {
    setEditingDesignationId(id)
    setEditingDesignationName(name)
  }
  const cancelEditDesignation = () => {
    setEditingDesignationId(null)
    setEditingDesignationName("")
  }
  const saveEditDesignation = async (id) => {
    if (!editingDesignationName.trim()) {
      setSnackbar({ open: true, message: 'Designation name cannot be empty.', type: 'error' })
      return
    }
    if (allDesignations.some(d => d.name === editingDesignationName.trim() && d._id !== id)) {
      setSnackbar({ open: true, message: 'Designation already exists.', type: 'error' })
      return
    }
    setProcessingDesignation(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/designations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingDesignationName.trim() })
      })
      if (!response.ok) throw new Error('Failed to update designation')
      setSnackbar({ open: true, message: 'Designation updated successfully!', type: 'success' })
      setEditingDesignationId(null)
      setEditingDesignationName("")
      await fetchDesignations()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update designation. Please try again.', type: 'error' })
    } finally {
      setProcessingDesignation(false)
    }
  }
  const confirmDeleteDesignation = async (id) => {
    setProcessingDesignation(true)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/designations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to delete designation')
      setSnackbar({ open: true, message: 'Designation deleted successfully!', type: 'success' })
      setDeletingDesignationId(null)
      await fetchDesignations()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete designation. Please try again.', type: 'error' })
    } finally {
      setProcessingDesignation(false)
    }
  }

  return (
    <MainContentWrapper>
      <div style={containerStyle}>
        {/* Heading section always visible */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', marginBottom: 32, gap: isMobile ? 18 : 0 }}>
          <div>
            <h1 style={styles.title}>Hiring Applications</h1>
            <p style={styles.subtitle}>Manage and review job applications</p>
          </div>
          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
              })
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, {
                transform: "translateY(0)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              })
            }}
          >
            <div style={styles.statNumber}>{totalApplicants}</div>
            <div style={styles.statLabel}>Total Applications</div>
          </div>
        </div>
        {/* Desktop/tablet action buttons */}
        {!isMobile && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", gap: "12px" }}>
            <button
              onClick={fetchApplicants}
              style={{
                ...styles.actionButton,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: refreshing ? (isDarkMode ? '#232323' : '#f3f4f6') : styles.actionButton.backgroundColor,
                color: refreshing ? (isDarkMode ? '#f15a22' : '#f15a22') : styles.actionButton.color,
                cursor: refreshing ? 'wait' : styles.actionButton.cursor,
                border: refreshing ? '1.5px solid #f15a22' : styles.actionButton.border,
                pointerEvents: refreshing ? 'none' : 'auto',
                minWidth: 44,
                minHeight: 44,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                transition: 'background 0.2s',
              }}
              disabled={refreshing}
              title="Refresh Applicants"
            >
              <RefreshIcon
                sx={{
                  fontSize: 22,
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  color: '#fff', // Always white
                  verticalAlign: 'middle',
                }}
              />
              {refreshing ? 'Refreshing...' : 'Refresh'}
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                ref={filterBtnRef}
                onClick={() => setFilterPanelOpen((open) => !open)}
                style={{
                  ...styles.actionButton,
                  backgroundColor: filterPanelOpen ? '#f59e0b' : styles.actionButton.backgroundColor,
                  color: filterPanelOpen ? '#fff' : styles.actionButton.color,
                  border: filterPanelOpen ? '1.5px solid #f59e0b' : styles.actionButton.border,
                  position: 'relative',
                  zIndex: 11001,
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  transition: 'background 0.2s',
                }}
                id="filters-btn"
              >
                🔎 Filters
              </button>
              {filterPanelOpen && ReactDOM.createPortal(
                <div
                  ref={filterPanelRef}
                  style={{
                    position: 'fixed',
                    left: filterPanelCoords.left,
                    top: filterPanelCoords.top,
                    width: filterPanelCoords.width,
                    background: isDarkMode ? '#232323' : '#fff',
                    border: isDarkMode ? '1px solid #333' : '1px solid #e2e8f0',
                    borderRadius: 12,
                    boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.32)' : '0 8px 32px rgba(0,0,0,0.12)',
                    padding: '24px 20px 16px 20px',
                    zIndex: 12000,
                    minWidth: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    marginTop: 0,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ position: 'absolute', top: -10, left: 24 }}>
                    <svg width="24" height="12" viewBox="0 0 24 12" style={{ display: 'block' }}>
                      <polygon points="12,0 24,12 0,12" fill={isDarkMode ? '#232323' : '#fff'} stroke={isDarkMode ? '#333' : '#e2e8f0'} strokeWidth="1" />
                    </svg>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Month</label>
                    <select
                      value={filters.month}
                      onChange={e => handleFilterChange('month', e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 6, border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb' }}
                    >
                      {months.map((m, i) => <option key={i} value={m}>{m || 'All'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Branch</label>
                    <select
                      value={filters.branch}
                      onChange={e => handleFilterChange('branch', e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 6, border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb' }}
                    >
                      {branchOptions.map((b, i) => <option key={i} value={b}>{b || 'All'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Position</label>
                    <select
                      value={filters.position}
                      onChange={e => handleFilterChange('position', e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 6, border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb' }}
                    >
                      {positionOptions.map((p, i) => <option key={i} value={p}>{p || 'All'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Education</label>
                    <select
                      value={filters.education}
                      onChange={e => handleFilterChange('education', e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 6, border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb' }}
                    >
                      {uniqueEducations.map((e, i) => <option key={i} value={e}>{e || 'All'}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={clearFilters}
                    style={{
                      marginTop: 8,
                      background: isDarkMode ? '#232323' : '#f3f4f6',
                      color: isDarkMode ? '#e0e0e0' : '#374151',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 0',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                    }}
                  >
                    Clear Filters
                  </button>
                </div>,
                document.body
              )}
            </div>
            <button
              onClick={handleAutoSelectApplicants}
              style={styles.actionButton}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.actionButtonHover)
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, styles.actionButton)
              }}
            >
              <PeopleIcon sx={{ fontSize: 18 }} /> Select Applicants
            </button>
            <button
              onClick={handleExportToExcel}
              style={{
                ...styles.actionButton,
                backgroundColor: selectedApplicants.length === 0 ? "#e5e7eb" : styles.actionButton.backgroundColor,
                color: selectedApplicants.length === 0 ? "#9ca3af" : styles.actionButton.color,
                cursor: selectedApplicants.length === 0 ? "not-allowed" : styles.actionButton.cursor,
                pointerEvents: selectedApplicants.length === 0 ? "none" : "auto",
              }}
              disabled={selectedApplicants.length === 0}
            >
              💾 Export to Excel
            </button>
            <button
              onClick={handleBulkDeleteApplicants}
              style={{
                ...styles.actionButton,
                backgroundColor: selectedApplicants.length === 0 ? "#e5e7eb" : "#ef4444",
                color: selectedApplicants.length === 0 ? "#9ca3af" : "#fff",
                cursor: selectedApplicants.length === 0 ? "not-allowed" : styles.actionButton.cursor,
                pointerEvents: selectedApplicants.length === 0 ? "none" : "auto",
                border: selectedApplicants.length === 0 ? styles.actionButton.border : 'none',
              }}
              disabled={selectedApplicants.length === 0}
            >
              <DeleteIcon sx={{ fontSize: 18 }} /> Delete Selected
            </button>
            <button
              onClick={openAddDesignationModal}
              style={{
                ...styles.actionButton,
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                minWidth: 44,
                minHeight: 44,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                transition: 'background 0.2s',
              }}
            >
              + Add Designation
            </button>
          </div>
        )}

        {isMobile ? (
          <div style={{ marginTop: 8, marginLeft: 0, marginRight: 0, padding: '0 8px', marginBottom: 40 }}>
            {/* Action buttons stacked and full width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <button
                ref={filterBtnRef}
                onClick={() => setFilterPanelOpen((open) => !open)}
                style={{
                  ...styles.actionButton,
                  width: '100%',
                  minWidth: 0,
                  minHeight: 40,
                  fontSize: 16,
                  borderRadius: 16,
                  justifyContent: 'center',
                  padding: '10px 0',
                  boxShadow: '0 1.5px 6px rgba(241,90,34,0.08)',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                id="filters-btn"
                onTouchStart={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(241,90,34,0.18)'}
                onTouchEnd={e => e.currentTarget.style.boxShadow = '0 1.5px 6px rgba(241,90,34,0.08)'}
              >
                <FilterAltIcon sx={{ fontSize: 22, marginRight: 2 }} /> Filters
              </button>
              <button
                onClick={handleAutoSelectApplicants}
                style={{
                  ...styles.actionButton,
                  width: '100%',
                  minWidth: 0,
                  minHeight: 40,
                  fontSize: 16,
                  borderRadius: 16,
                  justifyContent: 'center',
                  padding: '10px 0',
                  boxShadow: '0 1.5px 6px rgba(241,90,34,0.08)',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onTouchStart={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(241,90,34,0.18)'}
                onTouchEnd={e => e.currentTarget.style.boxShadow = '0 1.5px 6px rgba(241,90,34,0.08)'}
              >
                <PeopleIcon sx={{ fontSize: 22, marginRight: 2 }} /> Select Applicants
              </button>
              <button
                onClick={handleExportToExcel}
                style={{
                  ...styles.actionButton,
                  width: '100%',
                  minWidth: 0,
                  minHeight: 40,
                  fontSize: 16,
                  borderRadius: 16,
                  justifyContent: 'center',
                  padding: '10px 0',
                  boxShadow: '0 1.5px 6px rgba(241,90,34,0.08)',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: selectedApplicants.length === 0 ? '#e5e7eb' : styles.actionButton.backgroundColor,
                  color: selectedApplicants.length === 0 ? '#9ca3af' : styles.actionButton.color,
                  cursor: selectedApplicants.length === 0 ? 'not-allowed' : styles.actionButton.cursor,
                  pointerEvents: selectedApplicants.length === 0 ? 'none' : 'auto',
                }}
                disabled={selectedApplicants.length === 0}
                onTouchStart={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(241,90,34,0.18)'}
                onTouchEnd={e => e.currentTarget.style.boxShadow = '0 1.5px 6px rgba(241,90,34,0.08)'}
              >
                <SaveAltIcon sx={{ fontSize: 22, marginRight: 2 }} /> Export to Excel
              </button>
              <button
                onClick={handleBulkDeleteApplicants}
                style={{
                  ...styles.actionButton,
                  width: '100%',
                  minWidth: 0,
                  minHeight: 40,
                  fontSize: 16,
                  borderRadius: 16,
                  justifyContent: 'center',
                  padding: '10px 0',
                  boxShadow: '0 1.5px 6px rgba(241,90,34,0.08)',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: selectedApplicants.length === 0 ? '#e5e7eb' : '#ef4444',
                  color: selectedApplicants.length === 0 ? '#9ca3af' : '#fff',
                  cursor: selectedApplicants.length === 0 ? 'not-allowed' : styles.actionButton.cursor,
                  pointerEvents: selectedApplicants.length === 0 ? 'none' : 'auto',
                }}
                disabled={selectedApplicants.length === 0}
                onTouchStart={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.18)'}
                onTouchEnd={e => e.currentTarget.style.boxShadow = '0 1.5px 6px rgba(241,90,34,0.08)'}
              >
                <DeleteIcon sx={{ fontSize: 22, marginRight: 2 }} /> Delete Selected
              </button>
            </div>
            {/* Mobile filter panel */}
            {filterPanelOpen && ReactDOM.createPortal(
              <div
                ref={filterPanelRef}
                style={{
                  position: 'fixed',
                  left: 8,
                  top: filterPanelCoords.top,
                  width: 'calc(100vw - 16px)',
                  background: isDarkMode ? '#232323' : '#fff',
                  border: isDarkMode ? '1px solid #333' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.32)' : '0 8px 32px rgba(0,0,0,0.12)',
                  padding: '24px 20px 16px 20px',
                  zIndex: 12000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  marginTop: 0,
                }}
                onClick={e => e.stopPropagation()}
              >
                <div>
                  <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Month</label>
                  <select
                    value={filters.month}
                    onChange={e => handleFilterChange('month', e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 6, border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb' }}
                  >
                    {months.map((m, i) => <option key={i} value={m}>{m || 'All'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Branch</label>
                  <select
                    value={filters.branch}
                    onChange={e => handleFilterChange('branch', e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 6, border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb' }}
                  >
                    {branchOptions.map((b, i) => <option key={i} value={b}>{b || 'All'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Position</label>
                  <select
                    value={filters.position}
                    onChange={e => handleFilterChange('position', e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 6, border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb' }}
                  >
                    {positionOptions.map((p, i) => <option key={i} value={p}>{p || 'All'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Education</label>
                  <select
                    value={filters.education}
                    onChange={e => handleFilterChange('education', e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 6, border: isDarkMode ? '1px solid #444' : '1px solid #e5e7eb' }}
                  >
                    {uniqueEducations.map((e, i) => <option key={i} value={e}>{e || 'All'}</option>)}
                  </select>
                </div>
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: 8,
                    background: isDarkMode ? '#232323' : '#f3f4f6',
                    color: isDarkMode ? '#e0e0e0' : '#374151',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 0',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  Clear Filters
                </button>
              </div>,
              document.body
            )}
            {displayedApplicants.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', fontSize: 18 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p>No applications found</p>
              </div>
            )}
            {displayedApplicants.map((applicant) => (
              <div key={applicant._id} style={{ ...cardStyles, margin: '0 0 22px 0', padding: '20px 14px 16px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    style={{ ...styles.checkbox, marginRight: 8, minWidth: 22, minHeight: 22 }}
                    checked={selectedApplicants.includes(applicant._id)}
                    onChange={() => handleToggleSelectApplicant(applicant._id)}
                  />
                  <div style={{ fontWeight: 700, fontSize: 18, color: isDarkMode ? '#fff' : '#1e293b', flex: 1, lineHeight: 1.2 }}>
                    {applicant.name}
                  </div>
                  <span style={{ fontWeight: 700, color: '#f15a22', fontSize: 15, letterSpacing: 0.5 }}>#{applicant.formNumber}</span>
                </div>
                <div style={{ fontSize: 15, color: isDarkMode ? '#e0e0e0' : '#374151', marginBottom: 2 }}>
                  <b>Position:</b> {applicant.designation}<br />
                  <b>Branch:</b> {applicant.branch}<br />
                  <b>Date:</b> {applicant.createdAt ? formatDate(applicant.createdAt) : 'N/A'}<br />
                  <b>Education:</b> {applicant.education}<br />
                  <b>CNIC:</b> {applicant.cnic}<br />
                  <b>Mobile:</b> {applicant.mobileNumber}
                </div>
                {applicant.address && (
                  <div style={{ fontSize: 14, color: isDarkMode ? '#b0b0b0' : '#64748b', margin: '8px 0 0 0', wordBreak: 'break-word' }}>
                    <b>Address:</b> {applicant.address}
                  </div>
                )}
                {applicant.experience && (
                  <div style={{ fontSize: 14, color: isDarkMode ? '#b0b0b0' : '#64748b', margin: '4px 0 0 0', wordBreak: 'break-word' }}>
                    <b>Experience:</b> {applicant.experience}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  {applicant.cvFile && applicant.cvFile.fileId ? (
                    <button
                      onClick={() => handleDownloadCV(applicant.cvFile.fileId, String(applicant.name))}
                      style={{ ...styles.downloadButton, width: '100%', fontSize: 16, padding: '12px 0', borderRadius: 10 }}
                      onMouseEnter={e => Object.assign(e.target.style, styles.downloadButtonHover)}
                      onMouseLeave={e => Object.assign(e.target.style, styles.downloadButton)}
                    >
                      📄 DOWNLOAD CV
                    </button>
                  ) : (
                    <span style={{ ...styles.noCV, width: '100%', textAlign: 'center', fontSize: 15, padding: '12px 0', borderRadius: 10 }}>No CV</span>
                  )}
                  <button
                    onClick={() => handleDeleteApplicant(applicant._id, String(applicant.name))}
                    style={{ ...styles.deleteButton, width: '100%', fontSize: 16, padding: '12px 0', borderRadius: 10 }}
                    onMouseEnter={e => Object.assign(e.target.style, styles.deleteButtonHover)}
                    onMouseLeave={e => Object.assign(e.target.style, styles.deleteButton)}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} /> Delete
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={openAddDesignationModal}
              style={{
                ...styles.actionButton,
                width: '100%',
                minWidth: 0,
                minHeight: 40,
                fontSize: 16,
                borderRadius: 16,
                justifyContent: 'center',
                padding: '10px 0',
                boxShadow: '0 1.5px 6px rgba(37,99,235,0.08)',
                backgroundColor: '#2563eb',
                color: '#fff',
                marginBottom: 8,
              }}
            >
              + Add Designation
            </button>
          </div>

        ) : (
          <div
            style={{
              ...styles.tableContainer,
            }}
          >
            <div style={{ maxHeight: 700, overflowY: 'auto', width: '100%' }}>
              <table style={{ ...styles.table, width: '100%', tableLayout: 'fixed' }}>
                <thead style={{
                  ...styles.tableHeader,
                  backgroundColor: styles.tableHeader.backgroundColor,
                }}>
                  <tr>
                    <th style={{ ...styles.th, width: "30px" }}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={selectedApplicants.length === applicants.length && applicants.length > 0}
                        onChange={() =>
                          setSelectedApplicants(
                            selectedApplicants.length === applicants.length ? [] : applicants.map((app) => app._id),
                          )
                        }
                      />
                    </th>
                    <th style={styles.th}>Form Number</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>CNIC</th>
                    <th style={styles.th}>Mobile</th>
                    <th style={styles.th}>Age</th>
                    <th style={styles.th}>Address</th>
                    <th style={styles.th}>Education</th>
                    <th style={styles.th}>Position</th>
                    <th style={styles.th}>Branch</th>
                    <th style={styles.th}>Experience</th>
                    <th
                      style={{ ...styles.th, cursor: 'pointer' }}
                      onClick={cycleSortMode}
                      onMouseEnter={e => (e.target.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.target.style.textDecoration = 'none')}
                    >
                      Submission Date
                      {sortMode === 'asc' && <span style={{ marginLeft: 6, fontSize: 13 }}>▲</span>}
                      {sortMode === 'desc' && <span style={{ marginLeft: 6, fontSize: 13 }}>▼</span>}
                    </th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>CV</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody style={styles.tbody}>
                  {displayedApplicants.map((applicant, idx) => (
                    <tr
                      key={String(applicant._id)}
                      style={{
                        ...styles.tr,
                        ...(selectedApplicants.includes(applicant._id)
                          ? { backgroundColor: isDarkMode ? '#263c2a' : '#e6f9ec', borderLeft: '4px solid #34c759' }
                          : (idx % 2 === 0 ? styles.rowEven : styles.rowOdd)),
                      }}
                      onMouseEnter={(e) => {
                        Object.assign(e.currentTarget.style, styles.trHover)
                        e.currentTarget.style.backgroundColor = selectedApplicants.includes(applicant._id)
                          ? (isDarkMode ? '#263c2a' : '#e6f9ec')
                          : styles.trHover.backgroundColor
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = selectedApplicants.includes(applicant._id)
                          ? (isDarkMode ? '#263c2a' : '#e6f9ec')
                          : (idx % 2 === 0 ? styles.rowEven.backgroundColor : styles.rowOdd.backgroundColor)
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "none"
                      }}
                    >
                      <td style={styles.td}>
                        <input
                          type="checkbox"
                          style={styles.checkbox}
                          checked={selectedApplicants.includes(applicant._id)}
                          onChange={() => handleToggleSelectApplicant(applicant._id)}
                        />
                      </td>
                      <td style={styles.td}>{String(applicant.formNumber)}</td>
                      <td style={{
                        ...styles.td,
                        fontWeight: "600",
                        color: isDarkMode ? "#fff" : "#1e293b"
                      }}>{String(applicant.name)}</td>
                      <td style={styles.td}>{String(applicant.cnic)}</td>
                      <td style={styles.td}>{String(applicant.mobileNumber)}</td>
                      <td style={styles.td}>{String(applicant.age)}</td>
                      <td style={styles.td}>
                        <ExpandableCell
                          content={applicant.address}
                          title={`${String(applicant.name)}'s Address`}
                          maxLength={25}
                          type="address"
                        />
                      </td>
                      <td style={styles.td}>{String(applicant.education)}</td>
                      <td style={{ ...styles.td, fontWeight: "500", color: "#f15a22" }}>{String(applicant.designation)}</td>
                      <td style={styles.td}>{String(applicant.branch)}</td>
                      <td style={styles.td}>
                        <ExpandableCell
                          content={applicant.experience}
                          title={`${String(applicant.name)}'s Experience`}
                          maxLength={20}
                          type="experience"
                        />
                      </td>
                      <td style={styles.td}>{applicant.createdAt ? formatDate(applicant.createdAt) : "N/A"}</td>
                      <td style={styles.td}>
                        {applicant.cvFile && applicant.cvFile.fileId ? (
                          <button
                            onClick={() => handleDownloadCV(applicant.cvFile.fileId, String(applicant.name))}
                            style={styles.downloadButton}
                            onMouseEnter={(e) => {
                              Object.assign(e.target.style, styles.downloadButtonHover)
                            }}
                            onMouseLeave={(e) => {
                              Object.assign(e.target.style, styles.downloadButton)
                            }}
                          >
                            📄 Download
                          </button>
                        ) : (
                          <span style={styles.noCV}>No CV</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDeleteApplicant(applicant._id, String(applicant.name))}
                          style={styles.deleteButton}
                          onMouseEnter={(e) => {
                            Object.assign(e.target.style, styles.deleteButtonHover)
                          }}
                          onMouseLeave={(e) => {
                            Object.assign(e.target.style, styles.deleteButton)
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {applicants.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#64748b",
              fontSize: "18px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
            <p>No applications found</p>
          </div>
        )}

        {expandedContent && (
          <ContentModal
            content={expandedContent.content}
            title={expandedContent.title}
            type={expandedContent.type}
            onClose={closeExpandedContent}
          />
        )}
        {deleteModal.open && (
          <div
            style={styles.modalOverlay}
            onClick={closeDeleteModal}
          >
            <div
              style={{
                ...styles.modalContent,
                padding: "32px 28px 24px 28px",
                minWidth: "340px",
                maxWidth: "90vw",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: isDarkMode ? "#ffb4b4" : "#dc2626", margin: 0, fontWeight: 700, fontSize: 22 }}>Delete Application?</h2>
              <p style={{ color: isDarkMode ? "#b0b0b0" : "#64748b", margin: "18px 0 0 0", fontSize: 15 }}>
                Are you sure you want to <b>delete</b> the application for <b>{deleteModal.applicantName}</b>?<br/>
                <span style={{ color: isDarkMode ? "#ffb4b4" : "#dc2626" }}>This action cannot be undone.</span>
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
                <button
                  onClick={closeDeleteModal}
                  style={{
                    background: isDarkMode ? "#232323" : "#f3f4f6",
                    color: isDarkMode ? "#e0e0e0" : "#374151",
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginRight: 8,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteApplicant}
                  style={{
                    background: "#ef4444",
                    color: isDarkMode ? "#fff" : "#fff",
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: isDarkMode
                      ? "0 2px 4px rgba(239,68,68,0.3)"
                      : "0 2px 4px rgba(239,68,68,0.15)",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <style jsx>{`
              @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
          </div>
        )}
        
        {/* Select Applicants Modal */}
        {selectApplicantsModalOpen && ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 13000,
              animation: 'modalFadeIn 0.25s',
              padding: '16px',
            }}
            onClick={closeSelectApplicantsModal}
          >
            <div
              style={{
                background: isDarkMode ? '#232323' : '#fff',
                borderRadius: 16,
                padding: '24px 20px 20px 20px',
                width: '100%',
                maxWidth: isMobile ? '95vw' : '500px',
                boxShadow: isDarkMode
                  ? '0 12px 48px 0 rgba(0,0,0,0.85)'
                  : '0 12px 48px 0 rgba(0,0,0,0.18)',
                position: 'relative',
                animation: 'modalSlideIn 0.3s cubic-bezier(.4,2,.6,1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: 32, marginBottom: 8, color: '#f15a22' }}>👥</div>
                <h2 style={{ color: isDarkMode ? '#fff' : '#1e293b', margin: 0, fontWeight: 800, fontSize: 22, textAlign: 'center', letterSpacing: 0.5 }}>Auto Select Applicants</h2>
                <div style={{ color: isDarkMode ? '#b0b0b0' : '#64748b', fontSize: 14, margin: '10px 0 18px 0', textAlign: 'center', maxWidth: 320 }}>
                  Choose filters and enter the number of applicants to auto-select. You can input any positive number.
                </div>
                <div style={{ width: '100%', borderBottom: isDarkMode ? '1px solid #333' : '1px solid #e5e7eb', margin: '0 0 24px 0' }} />
              </div>
              <div style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
                <div>
                  <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Month</label>
                  <select
                    value={filters.month}
                    onChange={e => handleFilterChange('month', e.target.value)}
                    style={{ width: '100%', marginTop: 5, padding: 6, borderRadius: 8, border: isDarkMode ? '1.5px solid #444' : '1.5px solid #e5e7eb', background: isDarkMode ? '#232323' : '#fff', color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 15 }}
                  >
                    {months.map((m, i) => <option key={i} value={m}>{m || 'Any'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Branch</label>
                  <select
                    value={filters.branch}
                    onChange={e => handleFilterChange('branch', e.target.value)}
                    style={{ width: '100%', marginTop: 5, padding: 6, borderRadius: 8, border: isDarkMode ? '1.5px solid #444' : '1.5px solid #e5e7eb', background: isDarkMode ? '#232323' : '#fff', color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 15 }}
                  >
                    {branchOptions.map((b, i) => <option key={i} value={b}>{b || 'Any'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Position</label>
                  <select
                    value={filters.position}
                    onChange={e => handleFilterChange('position', e.target.value)}
                    style={{ width: '100%', marginTop: 5, padding: 6, borderRadius: 8, border: isDarkMode ? '1.5px solid #444' : '1.5px solid #e5e7eb', background: isDarkMode ? '#232323' : '#fff', color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 15 }}
                  >
                    {positionOptions.map((p, i) => <option key={i} value={p}>{p || 'Any'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 14 }}>Education</label>
                  <select
                    value={filters.education}
                    onChange={e => handleFilterChange('education', e.target.value)}
                    style={{ width: '100%', marginTop: 5, padding: 6, borderRadius: 8, border: isDarkMode ? '1.5px solid #444' : '1.5px solid #e5e7eb', background: isDarkMode ? '#232323' : '#fff', color: isDarkMode ? '#e0e0e0' : '#374151', fontSize: 15 }}
                  >
                    {uniqueEducations.map((e, i) => <option key={i} value={e}>{e || 'Any'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 700, color: '#f15a22', fontSize: 15, marginBottom: 4 }}>Number of Applicants to Select</label>
                  <input
                    type="number"
                    min={1}
                    value={autoSelectCount}
                    onChange={e => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) setAutoSelectCount(val);
                    }}
                    style={{
                      width: '100%',
                      marginTop: 6,
                      padding: '10px 8px',
                      borderRadius: 10,
                      border: '2px solid #f15a22',
                      background: isDarkMode ? '#181818' : '#f9fafb',
                      color: isDarkMode ? '#fff' : '#1e293b',
                      fontSize: 18,
                      fontWeight: 700,
                      outline: 'none',
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                      transition: 'border 0.2s, box-shadow 0.2s',
                    }}
                    placeholder="Enter any positive number"
                    onFocus={e => e.target.style.border = '2.5px solid #f15a22'}
                    onBlur={e => e.target.style.border = '2px solid #f15a22'}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, width: '100%' }}>
                <button
                  onClick={closeSelectApplicantsModal}
                  style={{
                    background: isDarkMode ? '#232323' : '#f3f4f6',
                    color: isDarkMode ? '#e0e0e0' : '#374151',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginRight: 8,
                    boxShadow: isDarkMode ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(0,0,0,0.07)',
                    transition: 'background 0.2s',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const count = parseInt(autoSelectCount, 10);
                    if (!count || count < 1) {
                      setSnackbar({ open: true, message: 'Please enter a valid number.', type: 'error' });
                      return;
                    }
                    // Use filters to get eligible applicants
                    let eligible = applicants;
                    // Month filter
                    if (filters.month) {
                      const monthsArr = [ '', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
                      eligible = eligible.filter(app => {
                        const d = new Date(app.createdAt);
                        const monthName = monthsArr[d.getMonth() + 1];
                        return monthName === filters.month;
                      });
                    }
                    if (filters.branch) eligible = eligible.filter(app => app.branch === filters.branch);
                    if (filters.position) eligible = eligible.filter(app => app.designation === filters.position);
                    if (filters.education) eligible = eligible.filter(app => app.education === filters.education);
                    if (eligible.length < count) {
                      setSnackbar({ open: true, message: `Only ${eligible.length} applicants available for selection.`, type: 'error' });
                      return;
                    }
                    // Shuffle eligible applicants
                    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, count);
                    setSelectedApplicants(selected.map(app => app._id));
                    // Export to Excel
                    const selectedData = selected.map((app) => ({
                      "Form Number": app.formNumber || "",
                      Name: app.name || "",
                      CNIC: app.cnic || "",
                      Mobile: app.mobileNumber || "",
                      Age: app.age || "",
                      Address: app.address || "",
                      Education: app.education || "",
                      Position: app.designation || "",
                      Branch: app.branch || "",
                      Experience: app.experience || "",
                      "Submission Date": app.createdAt ? formatDate(app.createdAt) : "N/A",
                    }));
                    const worksheet = XLSX.utils.json_to_sheet(selectedData);
                    worksheet['!cols'] = [
                      { wch: 14 }, // Form Number
                      { wch: 20 }, // Name
                      { wch: 18 }, // CNIC
                      { wch: 16 }, // Mobile
                      { wch: 8 },  // Age
                      { wch: 30 }, // Address
                      { wch: 18 }, // Education
                      { wch: 18 }, // Position
                      { wch: 18 }, // Branch
                      { wch: 24 }, // Experience
                      { wch: 16 }, // Submission Date
                    ];
                    const range = XLSX.utils.decode_range(worksheet['!ref']);
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
                      if (!worksheet[cellAddress]) continue;
                      worksheet[cellAddress].s = {
                        font: { bold: true },
                        border: {
                          top: { style: "thin", color: { rgb: "000000" } },
                          bottom: { style: "thin", color: { rgb: "000000" } },
                          left: { style: "thin", color: { rgb: "000000" } },
                          right: { style: "thin", color: { rgb: "000000" } },
                        },
                        alignment: { horizontal: "center" },
                      };
                    }
                    for (let R = 1; R <= range.e.r; ++R) {
                      for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[cellAddress]) continue;
                        worksheet[cellAddress].s = {
                          border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } },
                          },
                        };
                      }
                    }
                    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");
                    XLSX.writeFile(workbook, "Auto_Selected_Applicants.xlsx");
                    setSelectApplicantsModalOpen(false);
                    setAutoSelectCount('');
                    setSnackbar({ open: true, message: `${count} applicant${count > 1 ? 's' : ''} selected and exported.`, type: 'success' });
                  }}
                  style={{
                    background: '#f15a22',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: isDarkMode ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(0,0,0,0.07)',
                    transition: 'background 0.2s',
                    letterSpacing: 0.2,
                  }}
                >
                  Auto Select
                </button>
              </div>
              <style jsx>{`
                @keyframes modalSlideIn {
                  from { opacity: 0; transform: translateY(40px) scale(0.97); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes modalFadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
              `}</style>
            </div>
          </div>,
          document.body
        )}
        
        {snackbar.open && (
          <div
            style={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              minWidth: 260,
              background: snackbar.type === 'success'
                ? (isDarkMode ? '#15803d' : '#22c55e')
                : (isDarkMode ? '#7f1d1d' : '#ef4444'),
              color: isDarkMode ? '#fff' : '#fff',
              borderRadius: 8,
              boxShadow: isDarkMode
                ? '0 4px 16px rgba(0,0,0,0.32)'
                : '0 4px 16px rgba(0,0,0,0.15)',
              padding: '16px 28px 16px 20px',
              zIndex: 12000,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 15,
              fontWeight: 500,
              animation: 'snackbarIn 0.2s',
            }}
          >
            <span style={{ flex: 1 }}>{snackbar.message}</span>
            <button
              onClick={closeSnackbar}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 18,
                cursor: 'pointer',
                marginLeft: 8,
                opacity: 0.7,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.target.style.opacity = 1)}
              onMouseLeave={e => (e.target.style.opacity = 0.7)}
              aria-label="Close notification"
            >
              ×
            </button>
            <style jsx>{`
              @keyframes snackbarIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}
        {/* Bulk Delete Confirmation Modal */}
        {bulkDeleteModal && ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 13000,
              animation: 'modalFadeIn 0.25s',
              padding: '16px',
            }}
            onClick={closeBulkDeleteModal}
          >
            <div
              style={{
                background: isDarkMode ? '#232323' : '#fff',
                borderRadius: 16,
                padding: '24px 20px 20px 20px',
                width: '100%',
                maxWidth: isMobile ? '95vw' : '400px',
                boxShadow: isDarkMode
                  ? '0 12px 48px 0 rgba(0,0,0,0.85)'
                  : '0 12px 48px 0 rgba(0,0,0,0.18)',
                position: 'relative',
                animation: 'modalSlideIn 0.3s cubic-bezier(.4,2,.6,1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontSize: 32, marginBottom: 8, color: '#ef4444' }}>🗑️</div>
              <h2 style={{ color: isDarkMode ? '#fff' : '#1e293b', margin: 0, fontWeight: 800, fontSize: 22, textAlign: 'center', letterSpacing: 0.5 }}>Delete Selected Applications?</h2>
              <div style={{ color: isDarkMode ? '#b0b0b0' : '#64748b', fontSize: 15, margin: '18px 0 0 0', textAlign: 'center', maxWidth: 320 }}>
                Are you sure you want to <b>delete</b> {selectedApplicants.length} selected application{selectedApplicants.length > 1 ? 's' : ''}?<br/>
                <span style={{ color: isDarkMode ? '#ffb4b4' : '#dc2626' }}>This action cannot be undone.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, width: '100%' }}>
                <button
                  onClick={closeBulkDeleteModal}
                  style={{
                    background: isDarkMode ? '#232323' : '#f3f4f6',
                    color: isDarkMode ? '#e0e0e0' : '#374151',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginRight: 8,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDeleteApplicants}
                  style={{
                    background: '#ef4444',
                    color: isDarkMode ? '#fff' : '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: isDarkMode
                      ? '0 2px 4px rgba(239,68,68,0.3)'
                      : '0 2px 4px rgba(239,68,68,0.15)',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <style jsx>{`
              @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(40px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>,
          document.body
        )}
        {/* Add Designation Modal */}
        {addDesignationModal && ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 13000,
              animation: 'modalFadeIn 0.25s',
              padding: '16px',
            }}
            onClick={closeAddDesignationModal}
          >
            <div
              style={{
                background: isDarkMode ? '#232323' : '#fff',
                borderRadius: 16,
                padding: '24px 20px 20px 20px',
                width: '100%',
                maxWidth: isMobile ? '95vw' : '400px',
                boxShadow: isDarkMode
                  ? '0 12px 48px 0 rgba(0,0,0,0.85)'
                  : '0 12px 48px 0 rgba(0,0,0,0.18)',
                position: 'relative',
                animation: 'modalSlideIn 0.3s cubic-bezier(.4,2,.6,1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ color: isDarkMode ? '#fff' : '#1e293b', margin: 0, fontWeight: 800, fontSize: 22, textAlign: 'center', letterSpacing: 0.5 }}>Add New Designation</h2>
              <div style={{ color: isDarkMode ? '#b0b0b0' : '#64748b', fontSize: 15, margin: '18px 0 0 0', textAlign: 'center', maxWidth: 320 }}>
                Enter the name of the new designation to add it to the system.
              </div>
              <input
                type="text"
                value={newDesignation}
                onChange={e => setNewDesignation(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 18,
                  padding: '10px 8px',
                  borderRadius: 10,
                  border: '2px solid #2563eb',
                  background: isDarkMode ? '#181818' : '#f9fafb',
                  color: isDarkMode ? '#fff' : '#1e293b',
                  fontSize: 18,
                  fontWeight: 700,
                  outline: 'none',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
                placeholder="e.g. Assistant Manager"
                onFocus={e => e.target.style.border = '2.5px solid #2563eb'}
                onBlur={e => e.target.style.border = '2px solid #2563eb'}
                disabled={addingDesignation || editingDesignationId !== null || processingDesignation}
              />
              {/* List of designations with edit/delete */}
              <div style={{ width: '100%', marginTop: 28, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: isDarkMode ? '#fff' : '#1e293b', fontSize: 16, marginBottom: 8 }}>Current Designations</div>
                <div style={{ maxHeight: 180, overflowY: 'auto', border: isDarkMode ? '1px solid #333' : '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: isDarkMode ? '#181818' : '#f9fafb' }}>
                  {allDesignations.length === 0 && <div style={{ color: '#888', fontSize: 14 }}>No designations found.</div>}
                  {allDesignations.map(d => (
                    <div key={d._id || d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {editingDesignationId === d._id ? (
                        <>
                          <input
                            type="text"
                            value={editingDesignationName}
                            onChange={e => setEditingDesignationName(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1.5px solid #2563eb',
                              background: isDarkMode ? '#232323' : '#fff',
                              color: isDarkMode ? '#fff' : '#1e293b',
                              fontSize: 15,
                              fontWeight: 600,
                            }}
                            disabled={processingDesignation}
                          />
                          <button
                            onClick={() => saveEditDesignation(d._id)}
                            style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, fontSize: 14, cursor: processingDesignation ? 'wait' : 'pointer', opacity: processingDesignation ? 0.7 : 1 }}
                            disabled={processingDesignation}
                          >Save</button>
                          <button
                            onClick={cancelEditDesignation}
                            style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                            disabled={processingDesignation}
                          >Cancel</button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1, color: isDarkMode ? '#fff' : '#1e293b', fontWeight: 600, fontSize: 15 }}>{d.designation || d.name}</span>
                          <button
                            onClick={() => startEditDesignation(d._id, d.designation || d.name)}
                            style={{
                              background: '#f15a22',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '4px 10px',
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: editingDesignationId !== null || processingDesignation ? 'not-allowed' : 'pointer',
                              opacity: editingDesignationId !== null || processingDesignation ? 0.6 : 1
                            }}
                            disabled={editingDesignationId !== null || processingDesignation}
                          > Edit</button>
                          <button
                            onClick={() => setDeletingDesignationId(d._id)}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, fontSize: 13, cursor: editingDesignationId !== null || processingDesignation ? 'not-allowed' : 'pointer', opacity: editingDesignationId !== null || processingDesignation ? 0.6 : 1 }}
                            disabled={editingDesignationId !== null || processingDesignation}
                          >Delete</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Confirm Delete Modal */}
              {deletingDesignationId && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.35)', zIndex: 14000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: isDarkMode ? '#232323' : '#fff', borderRadius: 12, padding: 24, minWidth: 260, maxWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, color: '#ef4444', marginBottom: 8 }}>🗑️</div>
                    <div style={{ color: isDarkMode ? '#fff' : '#1e293b', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>Delete Designation?</div>
                    <div style={{ color: isDarkMode ? '#b0b0b0' : '#64748b', fontSize: 15, marginBottom: 18 }}>Are you sure you want to delete this designation? This action cannot be undone.</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                      <button
                        onClick={() => setDeletingDesignationId(null)}
                        style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        disabled={processingDesignation}
                      >Cancel</button>
                      <button
                        onClick={() => confirmDeleteDesignation(deletingDesignationId)}
                        style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 15, cursor: processingDesignation ? 'wait' : 'pointer', opacity: processingDesignation ? 0.7 : 1 }}
                        disabled={processingDesignation}
                      >Delete</button>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, width: '100%' }}>
                <button
                  onClick={closeAddDesignationModal}
                  style={{
                    background: isDarkMode ? '#232323' : '#f3f4f6',
                    color: isDarkMode ? '#e0e0e0' : '#374151',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginRight: 8,
                    boxShadow: isDarkMode ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(0,0,0,0.07)',
                    transition: 'background 0.2s',
                  }}
                  disabled={addingDesignation || editingDesignationId !== null || processingDesignation}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDesignation}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: addingDesignation || editingDesignationId !== null || processingDesignation ? 'not-allowed' : 'pointer',
                    boxShadow: isDarkMode ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(0,0,0,0.07)',
                    transition: 'background 0.2s',
                    letterSpacing: 0.2,
                    opacity: addingDesignation || editingDesignationId !== null || processingDesignation ? 0.7 : 1,
                  }}
                  disabled={addingDesignation || editingDesignationId !== null || processingDesignation}
                >
                  {addingDesignation ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
            <style jsx>{`
              @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(40px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>,
          document.body
        )}
      </div>
    </MainContentWrapper>
  )
}

export default HiringApplications
