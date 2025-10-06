import React, { useState } from 'react'
import { dataService } from '../services/dataService'

interface DataManagerProps {
  isOpen: boolean
  onClose: () => void
}

const DataManager: React.FC<DataManagerProps> = ({ isOpen, onClose }) => {
  const [exportData, setExportData] = useState('')
  const [importData, setImportData] = useState('')
  const [message, setMessage] = useState('')
  const [storageInfo, setStorageInfo] = useState(dataService.getStorageInfo())

  const handleExport = () => {
    try {
      const data = dataService.exportData()
      setExportData(data)
      setMessage('Data exported successfully!')
    } catch (error) {
      setMessage('Error exporting data')
    }
  }

  const handleImport = () => {
    try {
      dataService.importData(importData)
      setMessage('Data imported successfully!')
      setImportData('')
      setStorageInfo(dataService.getStorageInfo())
      // Refresh the page to show imported data
      window.location.reload()
    } catch (error) {
      setMessage('Error importing data. Please check the format.')
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      dataService.clearAllData()
      setMessage('All data cleared successfully!')
      setStorageInfo(dataService.getStorageInfo())
      window.location.reload()
    }
  }

  const handleRestoreBackup = () => {
    try {
      dataService.restoreFromBackup()
      setMessage('Data restored from backup successfully!')
      setStorageInfo(dataService.getStorageInfo())
      window.location.reload()
    } catch (error) {
      setMessage('Error restoring from backup')
    }
  }

  const downloadData = () => {
    const data = dataService.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pikaworld-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Data Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Storage Info */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Storage Information</h3>
          <div className="text-sm text-gray-600">
            <p>Used: {(storageInfo.used / 1024).toFixed(2)} KB</p>
            <p>Available: {(storageInfo.available / 1024).toFixed(2)} KB</p>
            <p>Usage: {storageInfo.percentage}%</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Export Data</h3>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            >
              Generate Export
            </button>
            <button
              onClick={downloadData}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Download File
            </button>
          </div>
          {exportData && (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Export Data:</label>
              <textarea
                value={exportData}
                readOnly
                className="w-full h-32 p-2 border border-gray-300 rounded text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Import Data</h3>
          <div className="space-y-2">
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your exported data here..."
              className="w-full h-32 p-2 border border-gray-300 rounded text-xs font-mono"
            />
            <button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Import Data
            </button>
          </div>
        </div>

        {/* Backup & Clear Section */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Backup & Maintenance</h3>
          <div className="space-y-2">
            <button
              onClick={handleRestoreBackup}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
            >
              Restore from Backup
            </button>
            <button
              onClick={handleClearAll}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default DataManager
