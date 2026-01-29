'use client';

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { useCSVImport } from '@/hooks/useApi';
import { FileSpreadsheet, Info, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { CSVImportResult } from '@/types';

function ImportContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvImport = useCSVImport();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setParseError('Please select a CSV file');
      setSelectedFile(null);
      setPreviewData(null);
      return;
    }

    setSelectedFile(file);
    setParseError(null);

    // Parse CSV for preview using Papa Parse (already in CSVUploader)
    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());
      const headers = lines[0].split(',').map((h) => h.trim());

      const preview = lines.slice(1, 6).map((line) => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
          row[header] = values[i]?.trim() || '';
        });
        return row;
      });

      setPreviewData(preview);
    } catch {
      setParseError('Failed to parse CSV file');
      setPreviewData(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      await csvImport.importFile(selectedFile);
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = `date,wake_time,sleep_duration_hours,exercise_minutes,meditation_minutes,morning_mood,breakfast_quality,caffeine_intake,water_intake_ml,productivity_score,tasks_completed,tasks_planned,focus_hours,energy_level,stress_level,notes
2024-01-01,06:30,7.5,30,10,7,good,100,500,8,5,6,4,7,4,Good productive day
2024-01-02,07:00,8,45,15,8,excellent,80,750,9,7,8,5,8,3,Felt great after exercise`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'morning_routine_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Import Data</h1>
        <p className="mt-1 text-slate-600">
          Upload a CSV file to import your morning routine and productivity data
        </p>
      </div>

      {/* Info Card */}
      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="text-sm text-blue-800">
          <p className="mb-1 font-medium">Expected CSV Format</p>
          <p>
            Your CSV should include columns like: date, wake_time, sleep_duration_hours,
            exercise_minutes, meditation_minutes, morning_mood, productivity_score, etc.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <div className="mb-6 flex items-center gap-3">
          <FileSpreadsheet className="text-primary-600 h-6 w-6" />
          <h2 className="text-xl font-semibold text-slate-900">Upload CSV File</h2>
        </div>

        {/* File Input */}
        <div className="hover:border-primary-400 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              {!selectedFile ? (
                <>
                  <Upload className="h-12 w-12 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p className="mt-1 text-sm text-slate-500">CSV files only</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <div>
                    <p className="font-medium text-slate-700">{selectedFile.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>

        {/* Parse Error */}
        {parseError && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-red-700">{parseError}</p>
          </div>
        )}

        {/* Import Error */}
        {csvImport.error && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-red-700">{csvImport.error}</p>
          </div>
        )}

        {/* Import Success */}
        {csvImport.data && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Import Complete!</p>
                <p className="mt-1 text-sm text-green-700">
                  Successfully imported {csvImport.data.imported_count} records.
                  {csvImport.data.failed_count > 0 && (
                    <span className="text-yellow-700"> {csvImport.data.failed_count} failed.</span>
                  )}
                </p>
                {csvImport.data.errors?.length > 0 && (
                  <div className="mt-2 text-sm text-yellow-700">
                    <p className="flex items-center gap-1 font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      Errors:
                    </p>
                    <ul className="mt-1 list-inside list-disc">
                      {csvImport.data.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {previewData && previewData.length > 0 && !csvImport.data && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-slate-700">
              Preview (first {previewData.length} rows)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="px-3 py-2 text-left font-medium text-slate-600">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      {Object.values(row).map((value, j) => (
                        <td key={j} className="px-3 py-2 text-slate-700">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedFile && !csvImport.data && (
          <div className="mt-6 flex items-center justify-between">
            <button onClick={handleReset} className="btn-secondary">
              Clear
            </button>
            <button onClick={handleImport} disabled={csvImport.loading} className="btn-primary">
              {csvImport.loading
                ? 'Importing...'
                : `Import ${previewData?.length ? `~${previewData.length}+ ` : ''}Records`}
            </button>
          </div>
        )}

        {/* After successful import */}
        {csvImport.data && (
          <div className="mt-6 flex justify-end">
            <button onClick={handleReset} className="btn-primary">
              Import Another File
            </button>
          </div>
        )}
      </div>

      {/* Sample Data Section */}
      <div className="card">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Sample CSV Template</h3>
        <div className="overflow-x-auto rounded-lg bg-slate-50 p-4">
          <pre className="text-sm text-slate-600">
            {`date,wake_time,sleep_duration_hours,exercise_minutes,meditation_minutes,morning_mood,productivity_score,tasks_completed
2024-01-01,06:30,7.5,30,10,7,8,5
2024-01-02,07:00,8,45,15,8,9,7
2024-01-03,06:15,6.5,0,5,5,6,3`}
          </pre>
        </div>
        <button onClick={downloadTemplate} className="btn-secondary mt-4">
          Download Template
        </button>
      </div>
    </div>
  );
}

export default function ImportPage() {
  return (
    <RequireAuth>
      <DashboardLayout>
        <ImportContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
