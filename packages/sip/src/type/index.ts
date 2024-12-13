import type { Session } from "sip.js";
import type { SessionManager } from "sip.js/lib/platform/web";

export interface SIPProviderOptions {
  webSocketServer: string;
  domain: string;
  refAudioRemote?: HTMLAudioElement;
  refVideoRemote?: HTMLVideoElement;
}

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

export interface IProviderContext {
  sessionManager: SessionManager | null;
  connectAndRegister: (sipAccount: SIPAccount) => void;
  connectStatus: CONNECT_STATUS;
  registerStatus: RegisterStatus;
  sessions: Record<string, Session>;
  sessionTimers: SessionTimers;
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
