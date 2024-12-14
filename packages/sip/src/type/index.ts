export enum CONNECT_STATUS {
  WAIT_REQUEST_CONNECT = "WAIT_REQUEST_CONNECT",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

export enum RegisterStatus {
  UNREGISTERED = "UNREGISTERED",
  REGISTERED = "REGISTERED",
}

export interface SIPAccount {
  username: string;
  password: string;
}

export enum SessionDirection {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export interface Timer {
  createdAt: Date;
  receivedAt?: Date;
  answeredAt?: Date;
  hangupAt?: Date;
}

export type SessionTimers = Record<string, Timer>;
