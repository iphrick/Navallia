import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Client } from '@/types/client';

export const clientService = {
  async createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const clientsRef = collection(db, 'clients');
    const newDocRef = doc(clientsRef);
    
    const client: Client = {
      ...data,
      id: newDocRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(newDocRef, client);
    return client;
  },

  async updateClient(clientId: string, data: Partial<Client>): Promise<void> {
    const clientRef = doc(db, 'clients', clientId);
    await updateDoc(clientRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async getClient(clientId: string): Promise<Client | null> {
    const clientRef = doc(db, 'clients', clientId);
    const snap = await getDoc(clientRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Client;
    }
    return null;
  },

  async getClients(barbershopId: string): Promise<Client[]> {
    const q = query(
      collection(db, 'clients'),
      where('barbershopId', '==', barbershopId),
      orderBy('name', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  },

  async searchClients(barbershopId: string, searchTerm: string): Promise<Client[]> {
    const allClients = await this.getClients(barbershopId);
    const lowerTerm = searchTerm.toLowerCase();
    return allClients.filter(c => 
      c.name.toLowerCase().includes(lowerTerm) || 
      c.phone.includes(lowerTerm) || 
      c.whatsapp.includes(lowerTerm) || 
      (c.email && c.email.toLowerCase().includes(lowerTerm))
    );
  },

  async deleteClient(clientId: string): Promise<void> {
    // Exclusão lógica
    const clientRef = doc(db, 'clients', clientId);
    await updateDoc(clientRef, {
      active: false,
      updatedAt: Timestamp.now()
    });
  },

  async importClients(barbershopId: string, clients: Omit<Client, 'id' | 'barbershopId' | 'createdAt' | 'updatedAt' | 'totalAppointments' | 'totalSpent' | 'loyaltyPoints' | 'active'>[]): Promise<void> {
    const promises = clients.map(c => {
       return this.createClient({
         ...c,
         barbershopId,
         totalAppointments: 0,
         totalSpent: 0,
         loyaltyPoints: 0,
         active: true,
       });
    });
    await Promise.all(promises);
  }
};
