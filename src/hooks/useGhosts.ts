import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import type { Ghost } from '../types/ghost';

export function useGhosts() {
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'ghosts'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ghostsData: Ghost[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();

          const dateReported = new Date(data.dateReported || data.timestamp);
          const today = new Date();
          const daysOpen = Math.floor((today.getTime() - dateReported.getTime()) / (1000 * 60 * 60 * 24));

          ghostsData.push({
            ...data,
            daysOpen,
            firestoreId: docSnapshot.id,
          } as Ghost & { firestoreId: string });
        });
        setGhosts(ghostsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching ghosts:', err);
        setError('Failed to load ghosts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateGhostStatus = async (ghostId: string, status: Ghost['status']) => {
    try {
      const ghost = ghosts.find(g => g.id === ghostId);
      if (!ghost?.firestoreId) {
        throw new Error('Ghost not found or missing Firestore ID');
      }
      const ghostRef = doc(db, 'ghosts', ghost.firestoreId);
      await updateDoc(ghostRef, { status });
    } catch (err) {
      console.error('Error updating ghost status:', err);
      throw err;
    }
  };

  const updateGhost = async (ghostId: string, updates: Partial<Ghost>) => {
    try {
      const ghost = ghosts.find(g => g.id === ghostId);
      if (!ghost?.firestoreId) {
        throw new Error('Ghost not found or missing Firestore ID');
      }
      const ghostRef = doc(db, 'ghosts', ghost.firestoreId);
      await updateDoc(ghostRef, updates);
    } catch (err) {
      console.error('Error updating ghost:', err);
      throw err;
    }
  };

  return { ghosts, loading, error, updateGhostStatus, updateGhost };
}
