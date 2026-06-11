import mongoose, { Schema as MongooseSchema, Model } from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Incident } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'server-db.json');

export interface UserRecord extends User {
  passwordHash: string;
}

interface Schema {
  users: UserRecord[];
  incidents: Incident[];
}

let dbCache: Schema = { users: [], incidents: [] };
let isMongoConnected = false;

// ---------------------------------------------------------
// User Mongoose Schema
// ---------------------------------------------------------
const UserSchema = new MongooseSchema<UserRecord>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { type: String, required: true },
  badgeNumber: { type: String },
  passwordHash: { type: String, required: true },
  createdAt: { type: String, required: true }
});

// ---------------------------------------------------------
// Incident Mongoose Schema
// ---------------------------------------------------------
const IncidentSchema = new MongooseSchema<Incident>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  peopleAffected: { type: Number, required: true },
  imageUrl: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  status: { type: String, required: true },
  severity: { type: String, required: true },
  citizenId: { type: String, required: true },
  citizenName: { type: String, required: true },
  assignedResponderId: { type: String },
  assignedResponderName: { type: String },
  responseNotes: { type: String },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
}, { timestamps: false });

export let UserModel: Model<UserRecord>;
export let IncidentModel: Model<Incident>;

try {
  UserModel = mongoose.model<UserRecord>('User', UserSchema);
  IncidentModel = mongoose.model<Incident>('Incident', IncidentSchema);
} catch {
  UserModel = mongoose.model<UserRecord>('User');
  IncidentModel = mongoose.model<Incident>('Incident');
}

// Default initial seed data
const SEED_USERS: UserRecord[] = [
  {
    id: 'u-1',
    name: 'Chief Admin Officer',
    email: 'admin@citizen-response.gov',
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: bcrypt.hashSync('admin123', 10),
  },
  {
    id: 'u-2',
    name: 'Officer J. Davidson',
    email: 'responder1@emergency.gov',
    role: 'responder',
    badgeNumber: 'SF-RESP-889',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: bcrypt.hashSync('responder123', 10),
  },
  {
    id: 'u-3',
    name: 'Paramedic E. Thorne',
    email: 'responder2@emergency.gov',
    role: 'responder',
    badgeNumber: 'SF-MED-442',
    createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: bcrypt.hashSync('responder123', 10),
  },
  {
    id: 'u-4',
    name: 'Jane Doe',
    email: 'citizen@example.com',
    role: 'citizen',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: bcrypt.hashSync('citizen123', 10),
  },
];

const SEED_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Structure Fire - Commercial Building',
    type: 'fire',
    description: 'Active smoke and visible flames coming from the third floor of the retail building on Mission St. Bystanders reporting everyone got out but immediate intervention is needed to protect adjacent properties.',
    peopleAffected: 25,
    location: {
      lat: 37.7652,
      lng: -122.4183,
      address: '1975 Mission St, San Francisco, CA 94103',
    },
    status: 'active',
    severity: 'critical',
    citizenId: 'u-4',
    citizenName: 'Jane Doe',
    assignedResponderId: 'u-2',
    assignedResponderName: 'Officer J. Davidson',
    responseNotes: 'Engine Co. 3 on scene. Commenced localized spray containment. Utilities isolated.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-2',
    title: 'Multi-Vehicle Traffic Accident',
    type: 'accident',
    description: 'Two-car head-on collision on Market St near Castro. Airbags deployed, drivers are breathing but conscious and unable to exit safely on their own. Oil leaking onto road surface.',
    peopleAffected: 4,
    location: {
      lat: 37.7628,
      lng: -122.4348,
      address: '2280 Market St, San Francisco, CA 94114',
    },
    status: 'dispatching',
    severity: 'high',
    citizenId: 'u-4',
    citizenName: 'Jane Doe',
    assignedResponderId: 'u-3',
    assignedResponderName: 'Paramedic E. Thorne',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-3',
    title: 'Severe Flash Flooding on Low Area',
    type: 'flood',
    description: 'Ruptured primary main water valve flooding the underground pedestrian passageway near Golden Gate Park. Depth is approx 2 feet, threatening to submerge electrical control boxes.',
    peopleAffected: 8,
    location: {
      lat: 37.7694,
      lng: -122.4862,
      address: 'Martin Luther King Jr Dr, San Francisco, CA 94122',
    },
    status: 'reported',
    severity: 'medium',
    citizenId: 'u-4',
    citizenName: 'Jane Doe',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 mins ago
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-4',
    title: 'Acute Cardio Respiratory Emergency',
    type: 'medical',
    description: 'Elderly citizen has collapsed in front of the public library. Appears completely unresponsive. Bystanders have initiated high-quality CPR and retrieved public access AED.',
    peopleAffected: 1,
    location: {
      lat: 37.7786,
      lng: -122.4161,
      address: '100 Larkin St, San Francisco, CA 94102',
    },
    status: 'resolved',
    severity: 'critical',
    citizenId: 'u-4',
    citizenName: 'Jane Doe',
    assignedResponderId: 'u-3',
    assignedResponderName: 'Paramedic E. Thorne',
    responseNotes: 'Patient stabilized via defibrillator shock on scene. Heart rate recovered. Safely transported to SF General ICU under secondary observation.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-5',
    title: 'Commercial Break In - Active Trespass',
    type: 'crime',
    description: 'Individual broken through a back-alley window of the convenience shop and is actively filling duffel bags. Owner viewing remotely via live feed.',
    peopleAffected: 2,
    location: {
      lat: 37.7885,
      lng: -122.4075,
      address: '845 Market St, San Francisco, CA 94103',
    },
    status: 'active',
    severity: 'high',
    citizenId: 'u-4',
    citizenName: 'Jane Doe',
    assignedResponderId: 'u-2',
    assignedResponderName: 'Officer J. Davidson',
    responseNotes: 'Officer dispatched, ETA 3 minutes.',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 mins ago
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-6',
    title: 'Fallen Power Line and Sparks',
    type: 'other',
    description: 'Large pine branch broke in storm, pulling down high-voltage lines. Cable is actively sparking on the wet pavement. Pedestrians currently routed away.',
    peopleAffected: 12,
    location: {
      lat: 37.7516,
      lng: -122.4435,
      address: 'Twin Peaks Blvd, San Francisco, CA 94131',
    },
    status: 'reported',
    severity: 'high',
    citizenId: 'u-4',
    citizenName: 'Jane Doe',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

function initFileDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      if (!dbCache.users) dbCache.users = [];
      if (!dbCache.incidents) dbCache.incidents = [];
    } else {
      dbCache = { users: SEED_USERS, incidents: SEED_INCIDENTS };
      saveDb();
    }
  } catch (error) {
    console.error('Error initializing file-based database. Using in-memory fallback:', error);
    dbCache = { users: SEED_USERS, incidents: SEED_INCIDENTS };
  }
}

export function saveDb() {
  if (isMongoConnected) return; // Managed by MongoDB, file save skipped.
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving to file-based database:', err);
  }
}

export async function initDb() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri !== 'MY_MONGODB_URI' && uri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB Database...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB Database.');

      // Check schemas are seeded
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('Seeding MongoDB with initial users...');
        await UserModel.insertMany(SEED_USERS);
      }

      const incidentCount = await IncidentModel.countDocuments();
      if (incidentCount === 0) {
        console.log('Seeding MongoDB with initial incidents...');
        await IncidentModel.insertMany(SEED_INCIDENTS);
      }
    } catch (err) {
      console.error('Failed to connect to MongoDB. Falling back to local file database.', err);
      isMongoConnected = false;
      initFileDb();
    }
  } else {
    console.log('No MONGODB_URI configured. Booting in file-based fallback sandbox mode.');
    isMongoConnected = false;
    initFileDb();
  }
}

export async function getUsers(): Promise<UserRecord[]> {
  if (isMongoConnected) {
    try {
      const docs = await UserModel.find().lean();
      return docs as unknown as UserRecord[];
    } catch (err) {
      console.error('MongoDB query error in getUsers, falling back to cache:', err);
    }
  }
  return dbCache.users;
}

export async function getIncidents(): Promise<Incident[]> {
  if (isMongoConnected) {
    try {
      const docs = await IncidentModel.find().sort({ createdAt: -1 }).lean();
      return docs as unknown as Incident[];
    } catch (err) {
      console.error('MongoDB query error in getIncidents, falling back to cache:', err);
    }
  }
  return dbCache.incidents;
}

export async function addIncident(incident: Incident): Promise<void> {
  if (isMongoConnected) {
    try {
      const newInc = new IncidentModel(incident);
      await newInc.save();
      return;
    } catch (err) {
      console.error('MongoDB add error in addIncident, falling back to cache:', err);
    }
  }
  dbCache.incidents.unshift(incident);
  saveDb();
}

export async function updateIncident(updated: Incident): Promise<boolean> {
  if (isMongoConnected) {
    try {
      const res = await IncidentModel.updateOne(
        { id: updated.id },
        { $set: { ...updated, updatedAt: new Date().toISOString() } }
      );
      return res.modifiedCount > 0 || res.matchedCount > 0;
    } catch (err) {
      console.error('MongoDB update error in updateIncident, falling back to cache:', err);
    }
  }
  const index = dbCache.incidents.findIndex((inc) => inc.id === updated.id);
  if (index !== -1) {
    dbCache.incidents[index] = { ...updated, updatedAt: new Date().toISOString() };
    saveDb();
    return true;
  }
  return false;
}

export async function addUser(user: UserRecord): Promise<void> {
  if (isMongoConnected) {
    try {
      const newUser = new UserModel(user);
      await newUser.save();
      return;
    } catch (err) {
      console.error('MongoDB insert error in addUser, falling back to cache:', err);
    }
  }
  dbCache.users.push(user);
  saveDb();
}

export async function deleteIncident(id: string): Promise<boolean> {
  if (isMongoConnected) {
    try {
      const res = await IncidentModel.deleteOne({ id });
      return res.deletedCount > 0;
    } catch (err) {
      console.error('MongoDB delete error in deleteIncident:', err);
    }
  }
  const idx = dbCache.incidents.findIndex((inc) => inc.id === id);
  if (idx !== -1) {
    dbCache.incidents.splice(idx, 1);
    saveDb();
    return true;
  }
  return false;
}
