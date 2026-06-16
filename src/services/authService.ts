import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

// ============================================================
// CADASTRO
// ============================================================
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  cpf: string,
  role: string
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = credential.user;

  await updateProfile(firebaseUser, { displayName: name });

  const userData: User = {
    uid: firebaseUser.uid,
    name,
    email,
    cpf,
    role,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: serverTimestamp(),
  });

  return userData;
};

// ============================================================
// LOGIN
// ============================================================
export const loginUser = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// ============================================================
// LOGOUT
// ============================================================
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// ============================================================
// RECUPERAÇÃO DE SENHA
// ============================================================
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// ============================================================
// BUSCAR DADOS DO USUÁRIO
// ============================================================
export const getUserData = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
};

// ============================================================
// ATUALIZAR PERFIL
// ============================================================
export const updateUserProfile = async (
  uid: string,
  data: { name?: string; cpf?: string; role?: string }
): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Nenhum usuário autenticado.');

  if (data.name) {
    await updateProfile(currentUser, { displayName: data.name });
  }

  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ============================================================
// EXCLUIR CONTA
// ============================================================
export const deleteUserAccount = async (): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Nenhum usuário autenticado.');

  // Deleta os dados do Firestore
  await deleteDoc(doc(db, 'users', currentUser.uid));

  // Deleta a conta no Firebase Auth
  await deleteUser(currentUser);
};

// ============================================================
// OBSERVER DE AUTENTICAÇÃO
// ============================================================
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================================
// FORMATO CPF
// ============================================================
export const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};
