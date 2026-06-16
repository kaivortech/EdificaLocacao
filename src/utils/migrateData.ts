import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Migra os documentos existentes nas coleções para incluir o userId atual.
 * Como o Firestore não permite query simples de "onde campo não existe",
 * buscamos todos os documentos e atualizamos os que não possuem userId.
 */
export const migrateDataToUser = async (userId: string): Promise<void> => {
  const collectionsToMigrate = ['machines', 'clients', 'rentals'];

  for (const collName of collectionsToMigrate) {
    const collRef = collection(db, collName);
    const snapshot = await getDocs(collRef);

    const updatePromises: Promise<void>[] = [];

    snapshot.forEach((document) => {
      const data = document.data();
      // Se não tem userId, ou é vazio/nulo, atualiza com o userId atual
      if (!data.userId || data.userId === '') {
        const docRef = doc(db, collName, document.id);
        updatePromises.push(updateDoc(docRef, { userId }));
      }
    });

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Migrados ${updatePromises.length} documentos na coleção ${collName}`);
    }
  }
};
