import React, { useState } from 'react';
import { Home, Plus, Minus, X, Compass } from 'lucide-react';
import { Requirements } from '../types';

interface RequirementsPageProps {
  onNext: (requirements: Requirements) => void;
  onBack: () => void;
}

export const RequirementsPage: React.FC<RequirementsPageProps> = ({ onNext, onBack }) => {
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [kitchenOrientation, setKitchenOrientation] = useState<'north' | 'south' | 'east' | 'west'>('east');
  const [entranceDirection, setEntranceDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [masterBedroomPosition, setMasterBedroomPosition] = useState<'southwest' | 'northwest' | 'southeast' | 'northeast'>('southwest');
  const [kitchenPosition, setKitchenPosition] = useState<'southeast' | 'northwest' | 'northeast' | 'southwest'>('southeast');
  const [pujaRoom, setPujaRoom] = useState(false);
  const [additionalRooms, setAdditionalRooms] = useState<string[]>(['Living Room', 'Dining Room']);
  const [newRoom, setNewRoom] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requirements: Requirements = {
      bedrooms,
      bathrooms,
      kitchenOrientation,
      vastuPreferences: {
        entranceDirection,
        masterBedroomPosition,
        kitchenPosition,
        pujaRoom,
      },
      additionalRooms,
    };

    onNext(requirements);
  };

  const addRoom = () => {
    if (newRoom.trim() && !additionalRooms.includes(newRoom.trim())) {
      setAdditionalRooms([...additionalRooms, newRoom.trim()]);
      setNewRoom('');
    }
  };

  const removeRoom = (room: string) => {
    setAdditionalRooms(additionalRooms.filter(r => r !== room));
  };

  const Counter = ({ label, value, onChange, min = 1, max = 10 }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-700">{label}</span>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
          disabled={value <= min}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
          disabled={value >= max}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Floor Plan Requirements
        </h2>
        <p className="text-lg text-gray-600">
          Specify your requirements and Vastu preferences for the perfect floor plan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Requirements */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Home className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Basic Requirements
            </h3>
          </div>
          
          <div className="space-y-4">
            <Counter
              label="Number of Bedrooms"
              value={bedrooms}
              onChange={setBedrooms}
              min={1}
              max={6}
            />
            <Counter
              label="Number of Bathrooms"
              value={bathrooms}
              onChange={setBathrooms}
              min={1}
              max={4}
            />
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Kitchen Orientation</span>
              <select
                value={kitchenOrientation}
                onChange={(e) => setKitchenOrientation(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vastu Preferences */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Compass className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Vastu Preferences
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Entrance Direction
              </label>
              <select
                value={entranceDirection}
                onChange={(e) => setEntranceDirection(e.target.value as any)}
                className="input"
              >
                <option value="north">North (Most Auspicious)</option>
                <option value="east">East (Very Good)</option>
                <option value="west">West (Good)</option>
                <option value="south">South (Avoid if possible)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Bedroom Position
              </label>
              <select
                value={masterBedroomPosition}
                onChange={(e) => setMasterBedroomPosition(e.target.value as any)}
                className="input"
              >
                <option value="southwest">Southwest (Best)</option>
                <option value="northwest">Northwest (Good)</option>
                <option value="southeast">Southeast (Acceptable)</option>
                <option value="northeast">Northeast (Avoid)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kitchen Position
              </label>
              <select
                value={kitchenPosition}
                onChange={(e) => setKitchenPosition(e.target.value as any)}
                className="input"
              >
                <option value="southeast">Southeast (Best)</option>
                <option value="northwest">Northwest (Good)</option>
                <option value="northeast">Northeast (Acceptable)</option>
                <option value="southwest">Southwest (Avoid)</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pujaRoom"
                checked={pujaRoom}
                onChange={(e) => setPujaRoom(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="pujaRoom" className="ml-2 text-sm font-medium text-gray-700">
                Include Puja Room (Northeast preferred)
              </label>
            </div>
          </div>
        </div>

        {/* Additional Rooms */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Additional Rooms
          </h3>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="Add room (e.g., Study, Guest Room)"
                className="flex-1 input"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRoom())}
              />
              <button
                type="button"
                onClick={addRoom}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {additionalRooms.map((room) => (
                <div
                  key={room}
                  className="flex items-center space-x-2 bg-primary-100 text-primary-800 px-3 py-1 rounded-full"
                >
                  <span className="text-sm font-medium">{room}</span>
                  <button
                    type="button"
                    onClick={() => removeRoom(room)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary px-8 py-3 text-lg"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-primary px-8 py-3 text-lg"
          >
            Generate Floor Plan
          </button>
        </div>
      </form>
    </div>
  );
};