import auth, {
  FirebaseAuthTypes,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';

export type User = FirebaseAuthTypes.User;

/** Sign in with email and password */
export async function signInWithEmail(email: string, password: string) {
  return auth().signInWithEmailAndPassword(email, password);
}

/** Create account with email and password */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const cred = await auth().createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({ displayName });
  return cred;
}

/** Sign in with Google */
export async function signInWithGoogle(idToken: string) {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(googleCredential);
}

/** Sign out */
export async function signOut() {
  return auth().signOut();
}

/** Subscribe to auth state changes */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void
) {
  return auth().onAuthStateChanged(callback);
}

/** Get current user */
export function getCurrentUser() {
  return auth().currentUser;
}
