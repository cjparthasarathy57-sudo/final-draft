import React from 'react';
import { Home, Upload, Settings, Eye } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Upload Plot', icon: Upload },
  { id: 2, name: 'Requirements', icon: Settings },
  { id: 3, name: 'Preview Plan', icon: Eye },
];

export const Layout: React.FC<LayoutProps> = ({ children, currentStep }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Home className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">
                AI Floor Plan Generator
              </h1>
            </div>
            
            {/* Progress Steps */}
            <nav className="flex space-x-8">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{step.name}</span>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};