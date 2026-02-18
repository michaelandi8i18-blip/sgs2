'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'clerk';
  divisionId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  login: (user: User) => void;
  logout: () => void;
  setOnline: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnline: true,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setOnline: (status) => set({ isOnline: status }),
    }),
    {
      name: 'sgs-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Ground Check Task interface
export interface TPHAttachment {
  id: string;
  tphNumber: number;
  photoData: string;
}

export interface GroundCheckTask {
  id: string;
  clerkName: string;
  divisionId: string;
  divisionCode: string;
  foremanId: string;
  foremanCode: string;
  notes: string;
  status: 'draft' | 'saved';
  attachments: TPHAttachment[];
  signature?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  currentTask: GroundCheckTask | null;
  savedTasks: GroundCheckTask[];
  setCurrentTask: (task: GroundCheckTask | null) => void;
  addSavedTask: (task: GroundCheckTask) => void;
  updateSavedTask: (task: GroundCheckTask) => void;
  deleteSavedTask: (taskId: string) => void;
  clearCurrentTask: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentTask: null,
      savedTasks: [],
      setCurrentTask: (task) => set({ currentTask: task }),
      addSavedTask: (task) => set((state) => ({ 
        savedTasks: [...state.savedTasks, task] 
      })),
      updateSavedTask: (task) => set((state) => ({ 
        savedTasks: state.savedTasks.map(t => t.id === task.id ? task : t) 
      })),
      deleteSavedTask: (taskId) => set((state) => ({ 
        savedTasks: state.savedTasks.filter(t => t.id !== taskId) 
      })),
      clearCurrentTask: () => set({ currentTask: null }),
    }),
    {
      name: 'sgs-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Division and Foreman interfaces
export interface Division {
  id: string;
  code: string;
  name: string;
}

export interface Foreman {
  id: string;
  code: string;
  name: string;
  divisionId: string;
}

interface DataState {
  divisions: Division[];
  foremen: Foreman[];
  setDivisions: (divisions: Division[]) => void;
  setForemen: (foremen: Foreman[]) => void;
  addDivision: (division: Division) => void;
  addForeman: (foreman: Foreman) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      divisions: [
        { id: '1', code: '1', name: 'Divisi 1' },
        { id: '2', code: '2', name: 'Divisi 2' },
        { id: '3', code: '3', name: 'Divisi 3' },
      ],
      foremen: [
        { id: '1', code: 'A', name: 'Kemandoran A', divisionId: '1' },
        { id: '2', code: 'B', name: 'Kemandoran B', divisionId: '1' },
        { id: '3', code: 'C', name: 'Kemandoran C', divisionId: '1' },
        { id: '4', code: 'A', name: 'Kemandoran A', divisionId: '2' },
        { id: '5', code: 'B', name: 'Kemandoran B', divisionId: '2' },
        { id: '6', code: 'C', name: 'Kemandoran C', divisionId: '2' },
        { id: '7', code: 'A', name: 'Kemandoran A', divisionId: '3' },
        { id: '8', code: 'B', name: 'Kemandoran B', divisionId: '3' },
        { id: '9', code: 'C', name: 'Kemandoran C', divisionId: '3' },
      ],
      setDivisions: (divisions) => set({ divisions }),
      setForemen: (foremen) => set({ foremen }),
      addDivision: (division) => set((state) => ({ 
        divisions: [...state.divisions, division] 
      })),
      addForeman: (foreman) => set((state) => ({ 
        foremen: [...state.foremen, foreman] 
      })),
    }),
    {
      name: 'sgs-data-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// User management interface
export interface ManagedUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'clerk';
  divisionId?: string;
}

interface UserMgmtState {
  users: ManagedUser[];
  setUsers: (users: ManagedUser[]) => void;
  addUser: (user: ManagedUser) => void;
  updateUser: (user: ManagedUser) => void;
  deleteUser: (userId: string) => void;
}

export const useUserMgmtStore = create<UserMgmtState>()(
  persist(
    (set) => ({
      users: [],
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ 
        users: [...state.users, user] 
      })),
      updateUser: (user) => set((state) => ({ 
        users: state.users.map(u => u.id === user.id ? user : u) 
      })),
      deleteUser: (userId) => set((state) => ({ 
        users: state.users.filter(u => u.id !== userId) 
      })),
    }),
    {
      name: 'sgs-users-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
