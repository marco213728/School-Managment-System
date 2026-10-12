import React, { createContext } from 'react';
import { User, Institution } from '../types';

export interface UserContextType {
  user: User | null;
  logout: () => void;
  openProfileModal?: () => void;
  updateCurrentUser?: (updatedUser: Partial<User>) => Promise<boolean>;
  updateUserPassword?: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  logout: () => {},
  openProfileModal: () => {},
  updateCurrentUser: async () => false,
  updateUserPassword: async () => ({ success: false }),
});

// New context for Institution data
interface InstitutionContextType {
  institution: Institution | null;
  setInstitution: (institution: Institution) => void;
}

export const InstitutionContext = createContext<InstitutionContextType>({
  institution: null,
  setInstitution: () => {},
});