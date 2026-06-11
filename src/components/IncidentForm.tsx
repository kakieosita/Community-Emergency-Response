import React, { useState, useEffect } from 'react';
import { IncidentType, IncidentSeverity, LocationCoordinates } from '../types';
import { AlertCircle, MapPin, Upload, Compass, Flame, Shield, HelpCircle, Activity, Info } from 'lucide-react';

interface IncidentFormProps {
  onSubmit: (formData: {
    title: string;
    type: IncidentType;
    description: string;
    peopleAffected: number;
    location: LocationCoordinates;
    imageUrl?: string;
  }) => Promise<void>;
  locationState: LocationCoordinates;
  setLocationState: React.Dispatch<React.SetStateAction<LocationCoordinates>>;
  isSubmitting: boolean;
}

const TYPE_CONFIGS: Array<{ value: IncidentType; label: string; icon: string }> = [
  { value: 'fire', label: 'Fire / Explosion', icon: '🔥' },
  { value: 'flood', label: 'Flood / Water Leak', icon: '🌊' },
  { value: 'accident', label: 'Traffic Collision / Crash', icon: '🚗' },
  { value: 'medical', label: 'Medical Emergency / Crisis', icon: '🚑' },
  { value: 'crime', label: 'Active Crime / Safety Threat', icon: '🚨' },
  { value: 'other', label: 'Utility issue / Blockage', icon: '⚙️' },
];

export default function IncidentForm({ onSubmit, locationState, setLocationState, isSubmitting }: IncidentFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IncidentType>('fire');
  const [description, setDescription] = useState('');
  const [peopleAffected, setPeopleAffected] = useState<number>(1);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'success' | 'failed'>('idle');
  const [dragActive, setDragActive] = useState(false);

  // Real-time Local Severity Prediction Preview (Visualizes the Intelligent Engine)
  const [predictedSeverity, setPredictedSeverity] = useState<IncidentSeverity>('low');
  const [predictedReason, setPredictedReason] = useState('');

  // Auto update real-time prediction indicator as fields change
  useEffect(() => {
    const descLower = description.toLowerCase();
    let score = 1; // 1: Low, 2: Med, 3: High, 4: Critical

    // Determine base on type
    if (type === 'fire') score = 3;
    else if (type === 'flood') score = 2;
    else if (type === 'accident') score = 2;
    else if (type === 'medical') score = 3;
    else if (type === 'crime') score = 2;

    // Word checking
    const criticalWords = ['unresponsive', 'cpr', 'shooting', 'active shooter', 'hostage', 'explosion', 'heart attack', 'cardiac', 'bomb'];
    const highWords = ['armed', 'robbery', 'knife', 'struggling', 'trapped', 'broken neck', 'bleeding', 'toxic leak', 'gas leak', 'arson', 'stroke', 'weapons'];
    const lowWords = ['noise', 'parking', 'trash', 'complaint', 'litter', 'lost dog'];

    if (criticalWords.some(w => descLower.includes(w))) score = Math.max(score, 4);
    else if (highWords.some(w => descLower.includes(w))) score = Math.max(score, 3);
    else if (lowWords.some(w => descLower.includes(w))) {
      if (!highWords.some(w => descLower.includes(w)) && !criticalWords.some(w => descLower.includes(w))) {
        score = 1;
      }
    }

    // Impact adjustment
    if (peopleAffected >= 20) score += 2;
    else if (peopleAffected >= 5) score += 1;

    let finalSeverity: IncidentSeverity = 'low';
    let reasonText = 'Minor localized disturbance, low urgency.';

    if (score >= 4) {
      finalSeverity = 'critical';
      reasonText = 'Immediate life threat. Full agency dispatch required.';
    } else if (score === 3) {
      finalSeverity = 'high';
      reasonText = 'Escalating safety or physical structures damage risks.';
    } else if (score === 2) {
      finalSeverity = 'medium';
      reasonText = 'Moderate hazard status, requires rapid triage.';
    }

    setPredictedSeverity(finalSeverity);
    setPredictedReason(reasonText);
  }, [type, description, peopleAffected]);

  // Handle Geolocation capture
  const handleGPSCapture = () => {
    setGpsStatus('fetching');
    if (!navigator.geolocation) {
      setGpsStatus('failed');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocationState({
          lat,
          lng,
          address: 'GPS Auto-Captured coordinates',
        });
        setGpsStatus('success');
      },
      (error) => {
        console.warn('Geolocation access failed. Falling back to default SF center coordinates.', error);
        // Fallback to SF Mission district center
        setGpsStatus('failed');
        setLocationState({
          lat: 37.765,
          lng: -122.42,
          address: 'SF Mission District (Fallback Area)',
        });
      },
      { timeout: 8000 }
    );
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationState.lat || !locationState.lng) {
      return;
    }
    onSubmit({
      title,
      type,
      description,
      peopleAffected: Number(peopleAffected) || 1,
      location: locationState,
      imageUrl: imagePreview || undefined,
    });
  };

  const severityStyles: Record<IncidentSeverity, { bg: string; text: string; border: string }> = {
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200/80' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/80' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200/80' },
    low: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-2xl mx-auto text-slate-900">
      <div>
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <span>🚨</span> Report New Emergency Incident
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Submit details below. The backend severity engine will instantly classify the incident and dispatch responders.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Incident Heading / Title <span className="text-rose-500">*</span></label>
        <input
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Structure Fire, Major Pileup, Flooded Roadway..."
          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
        />
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incident Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Category Type <span className="text-rose-500">*</span></label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as IncidentType)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition cursor-pointer"
          >
            {TYPE_CONFIGS.map((t) => (
              <option key={t.value} value={t.value} className="text-slate-900">
                {t.icon} {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Citizens Affected */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">People Affected (Approx) <span className="text-rose-500">*</span></label>
          <input
            required
            type="number"
            min="1"
            value={peopleAffected}
            onChange={(e) => setPeopleAffected(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition font-mono"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Event Description & Key Warnings <span className="text-rose-500">*</span></label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe exact details, landmarks, visible hazards, injuries, weapon presence..."
          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
        />
      </div>

      {/* GPS Location Module */}
      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> GIS Coordinates Location
          </span>
          <button
            type="button"
            onClick={handleGPSCapture}
            className="text-[10px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded shadow-sm transition flex items-center gap-1 cursor-pointer"
          >
            <Compass className={`w-3 h-3 ${gpsStatus === 'fetching' ? 'animate-spin' : ''}`} />
            {gpsStatus === 'fetching' ? 'Positioning...' : 'Auto Capture'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div>Lat: <span className="font-mono text-slate-900 font-semibold">{locationState.lat ? locationState.lat.toFixed(5) : 'pending...'}</span></div>
          <div>Lng: <span className="font-mono text-slate-900 font-semibold">{locationState.lng ? locationState.lng.toFixed(5) : 'pending...'}</span></div>
        </div>

        <p className="text-[10px] text-slate-500 flex items-center gap-1">
          <Info className="w-2.5 h-2.5 text-amber-600 inline shrink-0" />
          You can also click anywhere on the Map to dynamically set exact coordinates.
        </p>
      </div>

      {/* Drag & Drop Image Upload */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Incident Image Upload (Optional)</label>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'} rounded-xl p-4 text-center cursor-pointer transition relative`}
        >
          <input
            type="file"
            id="image-file-input"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <label htmlFor="image-file-input" className="cursor-pointer space-y-1.5 block">
            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-700">Drag & drop your file here, or <span className="text-emerald-600 underline font-semibold">browse files</span></div>
            <p className="text-[10px] text-slate-400">Supports PNG, JPG, JPEG up to 5MB</p>
          </label>

          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img src={imagePreview} alt="upload preview" className="h-16 w-32 object-cover rounded border border-slate-200 shadow-sm" />
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setImagePreview(''); }}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[10px] leading-3 h-4 w-4 flex items-center justify-center p-0 hover:bg-red-650 transition"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Predictive Triage Feedback (Visualizes the Intelligent Engine) */}
      <div className={`p-4 rounded-xl border ${severityStyles[predictedSeverity].border} ${severityStyles[predictedSeverity].bg} flex gap-3 transition-colors duration-300`}>
        <div className="shrink-0 pt-0.5">
          <Activity className={`w-4 h-4 ${predictedSeverity === 'critical' ? 'text-red-600 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <div className="space-y-1 text-xs">
          <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
            Intelligent Triage Analyzer:
            <span className={`font-black ${severityStyles[predictedSeverity].text}`}>
              {predictedSeverity}
            </span>
          </h5>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {predictedReason} Description keywords and incident properties matches local triage protocol. On report, the server will refine classification with Google Gemini AI.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <button
        type="submit"
        disabled={isSubmitting || !locationState.lat || !locationState.lng}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-3 px-4 rounded-xl transition cursor-pointer text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5"
      >
        {isSubmitting ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Submitting Report Triage...
          </>
        ) : (
          <>
            <span>🛰️</span> Dispatch Emergency Report & Map Coordinates
          </>
        )}
      </button>

      {!locationState.lat && (
        <p className="text-[10px] text-center text-rose-600 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" /> Please capture GPS or click on the map to define the precise incident coordinate pin before submitting.
        </p>
      )}
    </form>
  );
}
