import { getSupabaseBrowser } from "./supabase";

export async function getSession() {
  const supabase = getSupabaseBrowser();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = getSupabaseBrowser();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseBrowser();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  const supabase = getSupabaseBrowser();
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = getSupabaseBrowser();
  return supabase.auth.signOut();
}
