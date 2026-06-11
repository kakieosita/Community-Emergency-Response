/**
 * Shared Type Definitions for Community Emergency Response GIS
 */

export type UserRole = 'citizen' | 'responder' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber?: string; // for responders
  createdAt: string;
}

export type IncidentType = 'fire' | 'flood' | 'accident' | 'medical' | 'crime' | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'reported' | 'dispatching' | 'active' | 'resolved';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
}

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  description: string;
  peopleAffected: number;
  imageUrl?: string; // base64 or static placeholder
  location: LocationCoordinates;
  status: IncidentStatus;
  severity: IncidentSeverity;
  citizenId: string;
  citizenName: string;
  assignedResponderId?: string;
  assignedResponderName?: string;
  responseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalIncidents: number;
  unresolvedCount: number;
  resolvedCount: number;
  criticalCount: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  hotspots: Array<{ lat: number; lng: number; count: number; address: string; type: IncidentType }>;
  recentIncidents: Incident[];
  monthlyTrends: Array<{ month: string; count: number }>;
}
