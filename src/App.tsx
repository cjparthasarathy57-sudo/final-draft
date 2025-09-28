import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { UploadPage } from './pages/UploadPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { PreviewPage } from './pages/PreviewPage';
import { ApiService } from './services/api';
import { AppState, PlotData, Requirements } from './types';
import { Loader2 } from 'lucide-react';

function App() {
  const [state, setState] = useState<AppState>({
    currentStep: 1,
    plotData: null,
    requirements: null,
    processedData: null,
    generatedPlan: null,
    isLoading: false,
    error: null,
  });

  const handleUploadNext = async (plotData: PlotData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const processedData = await ApiService.processImage(plotData);
      setState(prev => ({
        ...prev,
        plotData,
        processedData,
        currentStep: 2,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to process image',
        isLoading: false,
      }));
    }
  };

  const handleRequirementsNext = async (requirements: Requirements) => {
    if (!state.processedData) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const generatedPlan = await ApiService.generatePlan(state.processedData, requirements);
      setState(prev => ({
        ...prev,
        requirements,
        generatedPlan,
        currentStep: 3,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate plan',
        isLoading: false,
      }));
    }
  };

  const handleBack = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
      error: null,
    }));
  };

  const renderCurrentStep = () => {
    if (state.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {state.currentStep === 1 ? 'Processing your image...' : 'Generating your floor plan...'}
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            {state.currentStep === 1 
              ? 'Our AI is analyzing your plot image and detecting room boundaries. This may take a few moments.'
              : 'Creating an optimized floor plan based on your requirements and Vastu preferences.'
            }
          </p>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="text-center py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-700 mb-4">{state.error}</p>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (state.currentStep) {
      case 1:
        return <UploadPage onNext={handleUploadNext} />;
      case 2:
        return <RequirementsPage onNext={handleRequirementsNext} onBack={handleBack} />;
      case 3:
        return state.processedData && state.generatedPlan ? (
          <PreviewPage
            processedData={state.processedData}
            generatedPlan={state.generatedPlan}
            onBack={handleBack}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Layout currentStep={state.currentStep}>
      {renderCurrentStep()}
    </Layout>
  );
}

export default App;