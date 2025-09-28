import React, { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Ruler } from 'lucide-react';
import { PlotData } from '../types';

interface UploadPageProps {
  onNext: (data: PlotData) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNext }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [plotWidth, setPlotWidth] = useState<string>('');
  const [plotHeight, setPlotHeight] = useState<string>('');
  const [scaleBarPx, setScaleBarPx] = useState<string>('');
  const [scaleBarM, setScaleBarM] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !plotWidth || !plotHeight) {
      alert('Please provide all required information');
      return;
    }

    const plotData: PlotData = {
      image: selectedFile,
      plotWidth: parseFloat(plotWidth),
      plotHeight: parseFloat(plotHeight),
      scaleBarPx: scaleBarPx ? parseFloat(scaleBarPx) : undefined,
      scaleBarM: scaleBarM ? parseFloat(scaleBarM) : undefined,
    };

    onNext(plotData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Your Plot Image
        </h2>
        <p className="text-lg text-gray-600">
          Upload a clear image of your plot and provide the dimensions for accurate scaling
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* File Upload */}
        <div className="card">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <ImageIcon className="w-12 h-12 text-green-600 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-green-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drop your plot image here, or{' '}
                    <label className="text-primary-600 hover:text-primary-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, GIF up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dimensions Input */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Ruler className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Plot Dimensions
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plot Width (meters) *
              </label>
              <input
                type="number"
                step="0.1"
                className="input"
                placeholder="e.g., 15.5"
                value={plotWidth}
                onChange={(e) => setPlotWidth(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plot Height (meters) *
              </label>
              <input
                type="number"
                step="0.1"
                className="input"
                placeholder="e.g., 12.0"
                value={plotHeight}
                onChange={(e) => setPlotHeight(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Optional Scale Bar */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Optional: Scale Bar (for higher accuracy)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scale Bar Length (pixels)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 100"
                  value={scaleBarPx}
                  onChange={(e) => setScaleBarPx(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scale Bar Represents (meters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder="e.g., 5.0"
                  value={scaleBarM}
                  onChange={(e) => setScaleBarM(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary px-8 py-3 text-lg"
            disabled={!selectedFile || !plotWidth || !plotHeight}
          >
            Process Image & Continue
          </button>
        </div>
      </form>
    </div>
  );
};