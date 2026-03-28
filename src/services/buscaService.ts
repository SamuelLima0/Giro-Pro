import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const salvarBusca = async (produto: string, precoMax: number) => {
  if (!auth.currentUser) {
    throw new Error("Usuário não autenticado");
  }

  const path = 'buscas';
  try {
    const docRef = await addDoc(collection(db, path), {
      produto,
      precoMax: Number(precoMax),
      ativo: true,
      userId: auth.currentUser.uid,
      criadoEm: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const listarBuscas = async () => {
  if (!auth.currentUser) {
    throw new Error("Usuário não autenticado");
  }

  const path = 'buscas';
  try {
    const q = query(
      collection(db, path), 
      where("userId", "==", auth.currentUser.uid),
      where("ativo", "==", true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const atualizarBusca = async (id: string, data: any) => {
  if (!auth.currentUser) {
    throw new Error("Usuário não autenticado");
  }

  const path = `buscas/${id}`;
  try {
    const docRef = doc(db, 'buscas', id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const excluirBusca = async (id: string) => {
  if (!auth.currentUser) {
    throw new Error("Usuário não autenticado");
  }

  const path = `buscas/${id}`;
  try {
    const docRef = doc(db, 'buscas', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
