import { create } from 'zustand';

export type UserRole = 'ADMIN_MUTU' | 'PETUGAS_UNIT' | 'TIM_SUPERVISI' | 'PIMPINAN';

export interface RoleInfo {
  id: UserRole;
  title: string;
  badge: string;
  color: string;
  description: string;
}

export const ROLES: Record<UserRole, RoleInfo> = {
  ADMIN_MUTU: {
    id: 'ADMIN_MUTU',
    title: 'Admin Komite Mutu',
    badge: 'Administrator',
    color: 'bg-emerald-600 text-white',
    description: 'Akses penuh ke seluruh modul, pengaturan sistem, validasi data, serta cadangan & pemulihan database.'
  },
  PETUGAS_UNIT: {
    id: 'PETUGAS_UNIT',
    title: 'Petugas / PIC Unit',
    badge: 'Input Pelayanan',
    color: 'bg-sky-600 text-white',
    description: 'Akses input capaian indikator mutu dan pelaporan insiden keselamatan pasien di unit kerja terkait.'
  },
  TIM_SUPERVISI: {
    id: 'TIM_SUPERVISI',
    title: 'Tim Supervisi & Audit',
    badge: 'Supervisi Klinis',
    color: 'bg-amber-600 text-white',
    description: 'Akses audit supervisi mutu, PPI, K3RS, serta kepatuhan asuhan keperawatan.'
  },
  PIMPINAN: {
    id: 'PIMPINAN',
    title: 'Direksi / Pimpinan',
    badge: 'Executive View',
    color: 'bg-purple-600 text-white',
    description: 'Akses eksekutif untuk melihat rekapitulasi capaian mutu RSUD dan mengunduh laporan resmi.'
  }
};

interface RoleState {
  currentRole: UserRole;
  userName: string;
  hydrateRole: () => void;
  setRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  currentRole: 'ADMIN_MUTU',
  userName: 'Petugas RSUD Al-Mulk',
  hydrateRole: () => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('optimus_user_role') as UserRole | null;
      const savedName = localStorage.getItem('optimus_user_name');
      set({
        currentRole: savedRole && savedRole in ROLES ? savedRole : 'ADMIN_MUTU',
        userName: savedName || 'Petugas RSUD Al-Mulk',
      });
    }
  },
  setRole: (role: UserRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('optimus_user_role', role);
    }
    set({ currentRole: role });
  },
  setUserName: (name: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('optimus_user_name', name);
    }
    set({ userName: name });
  }
}));
