/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'lucide-react' {
  const icons: Record<string, React.FC<{ size?: number; className?: string }>>;
  export default icons;
  export const Settings: React.FC<{ size?: number; className?: string }>;
  export const DollarSign: React.FC<{ size?: number; className?: string }>;
  export const TrendingUp: React.FC<{ size?: number; className?: string }>;
  export const LogIn: React.FC<{ size?: number; className?: string }>;
  export const UserPlus: React.FC<{ size?: number; className?: string }>;
  export const Users: React.FC<{ size?: number; className?: string }>;
  export const Check: React.FC<{ size?: number; className?: string }>;
  export const X: React.FC<{ size?: number; className?: string }>;
  export const Trash2: React.FC<{ size?: number; className?: string }>;
  export const Shield: React.FC<{ size?: number; className?: string }>;
  export const LogOut: React.FC<{ size?: number; className?: string }>;
}

declare module '@emailjs/browser' {
  export function send(serviceId: string, templateId: string, templateParams: Record<string, unknown>, publicKey: string): Promise<unknown>;
}

declare module 'firebase/app' {
  const firebase: {
    initializeApp: (config: Record<string, string>) => unknown;
  };
  export = firebase;
}

declare module 'firebase/firestore' {
  export function getFirestore(app: unknown): unknown;
  export function collection(db: unknown, name: string): unknown;
  export function addDoc(ref: unknown, data: Record<string, unknown>): Promise<{ id: string }>;
  export function getDocs(query: unknown): Promise<{
    docs: { id: string; data: () => Record<string, unknown> }[];
    empty: boolean;
    forEach: (callback: (doc: { id: string; data: () => Record<string, unknown> }) => void) => void;
  }>;
  export function doc(db: unknown, col: string, id: string): unknown;
  export function updateDoc(ref: unknown, data: Record<string, unknown>): Promise<void>;
  export function deleteDoc(ref: unknown): Promise<void>;
  export function query(col: unknown, ...conditions: unknown[]): unknown;
  export function where(field: string, op: string, value: string): unknown;
}
