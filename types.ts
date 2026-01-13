
export type UserRole = 'admin' | 'porteiro' | 'gestor' | 'administrador';

export interface Work {
  id: number;
  name: string;
  address: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  workId?: number;
}

export interface Visitor {
  id: number;
  workId: number;
  name: string;
  document: string;
  company: string;
  visitReason: string;
  personVisited: string;
  photo?: string; // Tornou-se opcional para carga lenta
  platePhoto?: string;
  entryTime: Date;
  exitTime?: Date;
  epi: {
    helmet: boolean;
    boots: boolean;
    glasses: boolean;
  };
  vehicle: {
    model: string;
    color: string;
    plate: string;
  };
}

export interface Delivery {
  id: number;
  workId: number;
  supplier: string;
  driverName: string;
  driverDocument: string;
  invoiceNumber: string;
  licensePlate: string;
  invoicePhoto?: string; // Tornou-se opcional para carga lenta
  platePhoto?: string;
  entryTime: Date;
  exitTime?: Date;
}
