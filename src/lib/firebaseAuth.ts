import {auth} from "./firebase";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth";

export function createUser(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function loginUser(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
    return auth.signOut();
}