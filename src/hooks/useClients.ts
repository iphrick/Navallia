import { useState, useEffect, useCallback } from 'react';
import { clientService } from '@/services/client.service';
import { Client } from '@/types/client';
import { useAuth } from '@/hooks/useAuth';

export function useClients() {
  const { user, barbershopId } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!barbershopId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClients(barbershopId);
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'barbershopId'>) => {
    if (!barbershopId) throw new Error("Barbershop ID not found");
    try {
      const newClient = await clientService.createClient({
        ...data,
        barbershopId
      });
      setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
      return newClient;
    } catch (err) {
      throw err;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      await clientService.updateClient(id, data);
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date() } as Client : c));
    } catch (err) {
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientService.deleteClient(id);
      setClients(prev => prev.map(c => c.id === id ? { ...c, active: false, updatedAt: new Date() } as Client : c));
    } catch (err) {
      throw err;
    }
  };

  const searchClients = async (term: string) => {
    if (!barbershopId) return [];
    if (!term.trim()) {
      return clients;
    }
    return await clientService.searchClients(barbershopId, term);
  };

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    refreshClients: fetchClients
  };
}
