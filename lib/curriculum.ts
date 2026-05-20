import { getSupabase } from "./supabase";

export async function getDomains() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("curriculum_domains")
    .select("*")
    .order("number", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getModulesByDomain(domainNumber: number) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("curriculum_modules")
    .select("*")
    .eq("domain_number", domainNumber)
    .order("module_number", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getLessonsByModule(moduleNumber: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("curriculum_lessons")
    .select("*")
    .eq("module_number", moduleNumber)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getLesson(lessonNumber: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("curriculum_lessons")
    .select(`
      *,
      curriculum_modules (
        *,
        curriculum_domains (*)
      )
    `)
    .eq("lesson_number", lessonNumber)
    .single();
  if (error) throw error;
  return data;
}

export async function getAssessmentByModule(moduleNumber: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("curriculum_assessments")
    .select("*")
    .eq("module_number", moduleNumber)
    .single();
  if (error) throw error;
  return data;
}

export async function getUserProgress(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("curriculum_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}
