import React, { createContext } from 'react';
import { User, Institution } from '../types';

interface UserContextType {
  user: User | null;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  logout: () => {},
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