import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase/config';

export const clientStorageService = {
  uploadPhoto: async (barbershopId: string, clientId: string, file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `clients/${barbershopId}/${clientId}/profile.${fileExtension}`);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  deletePhoto: async (photoUrl: string): Promise<void> => {
    if (!photoUrl) return;
    try {
      const storageRef = ref(storage, photoUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  },
  
  getPhotoUrl: async (barbershopId: string, clientId: string, extension: string = 'jpg'): Promise<string | null> => {
    try {
      const storageRef = ref(storage, `clients/${barbershopId}/${clientId}/profile.${extension}`);
      return await getDownloadURL(storageRef);
    } catch (error) {
      return null;
    }
  }
};
