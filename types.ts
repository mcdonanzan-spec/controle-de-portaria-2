export interface Visitor {
  id: number;
  name: string;
  document: string;
  company: string;
  visitReason: string;
  personVisited: string;
  photo: string;
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
  supplier: string;
  driverName: string;
  driverDocument: string;
  invoiceNumber: string;
  licensePlate: string;
  invoicePhoto: string;
  platePhoto: string;
  entryTime: Date;
  exitTime?: Date;
}