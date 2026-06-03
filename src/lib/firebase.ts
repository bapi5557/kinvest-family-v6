
// This file is deprecated. Please use the standardized src/firebase directory.
import { initializeFirebase } from '@/firebase';

const { firestore: db, auth } = initializeFirebase();

export { db, auth };
