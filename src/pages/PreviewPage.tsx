import React, { useState } from 'react';
import { Download, ArrowLeft, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { GeneratedPlan, ProcessedData } from '../types';
import { ApiService } from '../services/api';

interface PreviewPageProps {
  processedData: ProcessedData;
  generatedPlan: GeneratedPlan;
  onBack: () => void;
}

export const PreviewPage: React.FC<PreviewPageProps> = ({ 
  processedData, 
  generatedPlan, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'original' | 'analysis' | 'final'>('final');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (format: string) => {
    setIsDownloading(format);
    try {
      const blob = await ApiService.downloadFile(format, {
        processed_data: processedData,
        generated_plan: generatedPlan,
      });
      
      const filename = `floorplan.${format.toLowerCase()}`;
      ApiService.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(null);
    }
  };

  const renderOriginalView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Original Plot Analysis</h3>
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <p className="text-gray-600">Original plot image with detected boundaries</p>
        <div className="mt-4 text-sm text-gray-500">
          Plot dimensions: {processedData.plot_bbox_px[2]} × {processedData.plot_bbox_px[3]} pixels
        </div>
      </div>
    </div>
  );

  const renderAnalysisView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Computer Vision Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-3">Detected Elements</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Wall Lines:</span>
              <span className="font-medium">{processedData.wall_lines.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Openings:</span>
              <span className="font-medium">{processedData.openings.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Rooms Detected:</span>
              <span className="font-medium">{processedData.layout.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Scale:</span>
              <span className="font-medium">{processedData.meters_per_px.toFixed(4)} m/px</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-3">Room Areas</h4>
          <div className="space-y-2 text-sm">
            {processedData.layout.slice(0, 5).map((room, index) => (
              <div key={index} className="flex justify-between">
                <span>{room.name}:</span>
                <span className="font-medium">{room.area_m2.toFixed(1)} m²</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinalView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Generated Floor Plan</h3>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">Vastu Score: {generatedPlan.vastu_score}/100</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floor Plan SVG */}
        <div className="lg:col-span-2">
          <div className="card">
            <div 
              className="w-full h-96 border border-gray-200 rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: generatedPlan.svg_content }}
            />
          </div>
        </div>
        
        {/* Room Details */}
        <div className="space-y-6">
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-4">Room Details</h4>
            <div className="space-y-3">
              {generatedPlan.rooms.map((room, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{room.name}</div>
                    <div className="text-xs text-gray-500">
                      {room.w_m.toFixed(1)}m × {room.h_m.toFixed(1)}m
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {room.area_m2.toFixed(1)} m²
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Area:</span>
                  <span>{generatedPlan.total_area.toFixed(1)} m²</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vastu Suggestions */}
          <div className="card">
            <h4 className="font-medium text-gray-900 mb-4">Vastu Analysis</h4>
            <div className="space-y-3">
              {generatedPlan.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  {suggestion.includes('Good') || suggestion.includes('Perfect') ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Floor Plan is Ready!
        </h2>
        <p className="text-lg text-gray-600">
          Review your generated floor plan and download in your preferred format
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'original', label: 'Original Plot' },
          { id: 'analysis', label: 'CV Analysis' },
          { id: 'final', label: 'Final Plan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'original' && renderOriginalView()}
        {activeTab === 'analysis' && renderAnalysisView()}
        {activeTab === 'final' && renderFinalView()}
      </div>

      {/* Download Section */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Download Your Floor Plan
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { format: 'PDF', description: 'For viewing & printing' },
            { format: 'PNG', description: 'High-quality image' },
            { format: 'DXF', description: 'AutoCAD compatible' },
            { format: 'JSON', description: 'Raw data export' },
          ].map((item) => (
            <button
              key={item.format}
              onClick={() => handleDownload(item.format)}
              disabled={isDownloading === item.format}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              <Download className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">{item.format}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
              {isDownloading === item.format && (
                <div className="text-xs text-primary-600 mt-1">Downloading...</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 btn-secondary px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requirements</span>
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="btn-primary px-6 py-3"
        >
          Start New Project
        </button>
      </div>
    </div>
  );
};