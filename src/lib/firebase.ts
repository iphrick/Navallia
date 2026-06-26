// Re-export firebase config from the canonical location
// This file exists because some services import from "@/lib/firebase"
export { db, auth, storage } from "@/firebase/config";
export { default } from "@/firebase/config";
