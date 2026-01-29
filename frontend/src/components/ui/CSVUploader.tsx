'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import Papa from 'papaparse';

interface CSVUploaderProps {
  onUpload: (data: any[]) => void;
  onError?: (error: string) => void;
  acceptedFields?: string[];
}

export default function CSVUploader({ onUpload, onError, acceptedFields }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [preview, setPreview] = useState<any[] | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setStatus('error');
        onError?.('Please upload a CSV file');
        return;
      }

      setFileName(file.name);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setStatus('error');
            onError?.(results.errors[0].message);
            return;
          }

          setStatus('success');
          setPreview(results.data.slice(0, 5));
          onUpload(results.data);
        },
        error: (error) => {
          setStatus('error');
          onError?.(error.message);
        },
      });
    },
    [onUpload, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'hover:border-primary-400 border-slate-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            {status === 'idle' && (
              <>
                <Upload className="h-12 w-12 text-slate-400" />
                <div>
                  <p className="text-lg font-medium text-slate-700">Drop your CSV file here</p>
                  <p className="mt-1 text-sm text-slate-500">or click to browse</p>
                </div>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div>
                  <p className="text-lg font-medium text-green-700">File uploaded successfully!</p>
                  <p className="mt-1 text-sm text-slate-500">{fileName}</p>
                </div>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500" />
                <div>
                  <p className="text-lg font-medium text-red-700">Upload failed</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Please try again with a valid CSV file
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="card">
          <h4 className="mb-3 text-sm font-medium text-slate-700">Preview (first 5 rows)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {Object.keys(preview[0]).map((key) => (
                    <th key={key} className="px-3 py-2 text-left font-medium text-slate-600">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="px-3 py-2 text-slate-700">
                        {String(value).substring(0, 30)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
