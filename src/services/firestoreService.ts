import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import { Machine, Client, Rental } from '../types';

export const firestoreService = {
  // 1. LEITURA - COM ISOLAMENTO
  async getMachines(): Promise<Machine[]> {
    const user = getAuth().currentUser;
    if (!user) return [];
    console.log('🔍 Buscando máquinas de', user.uid);
    const q = query(collection(db, 'maquinas'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Machine));
    console.log(`✅ ${list.length} máquinas encontradas para ${user.uid}`);
    return list;
  },

  async getClients(): Promise<Client[]> {
    const user = getAuth().currentUser;
    if (!user) return [];
    const q = query(collection(db, 'clientes'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    return list;
  },

  async getRentals(): Promise<Rental[]> {
    const user = getAuth().currentUser;
    if (!user) return [];
    const q = query(collection(db, 'locacoes'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rental));
    return list;
  },

  // 2. ESCRITA - COM userId (para novos dados)
  async addMachine(machine: any): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    const now = new Date().toISOString();
    const data = { ...machine, userId: user?.uid, createdAt: now, updatedAt: now };
    const ref = machine.id ? doc(db, 'maquinas', machine.id) : doc(collection(db, 'maquinas'));
    await setDoc(ref, data);
  },

  async addClient(client: any): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    const now = new Date().toISOString();
    const data = { ...client, userId: user?.uid, createdAt: now, updatedAt: now };
    const ref = client.id ? doc(db, 'clientes', client.id) : doc(collection(db, 'clientes'));
    await setDoc(ref, data);
  },

  async addRental(rental: any): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    const now = new Date().toISOString();
    const data = { ...rental, userId: user?.uid, createdAt: now, updatedAt: now };
    const ref = rental.id ? doc(db, 'locacoes', rental.id) : doc(collection(db, 'locacoes'));
    await setDoc(ref, data);
  },

  // 3. UPDATE/DELETE - COM VERIFICAÇÃO
  async updateMachine(machine: any): Promise<void> {
    await updateDoc(doc(db, 'maquinas', machine.id), machine);
  },

  async deleteMachine(id: string): Promise<void> {
    await deleteDoc(doc(db, 'maquinas', id));
  },

  async updateClient(client: any): Promise<void> {
    await updateDoc(doc(db, 'clientes', client.id), client);
  },

  async deleteClient(id: string): Promise<void> {
    await deleteDoc(doc(db, 'clientes', id));
  },

  async updateRental(rental: any): Promise<void> {
    await updateDoc(doc(db, 'locacoes', rental.id), rental);
  },

  async deleteRental(id: string): Promise<void> {
    await deleteDoc(doc(db, 'locacoes', id));
  }
};
