import { supabase } from './supabase';

export interface UserPlan {
  user_id: string;
  plan_name: string;
  tokens: number;
  created_at?: string;
}

export const PLAN_TOKENS = {
  'Free': 100,
  'Basic': 500,
  'Pro': 1000,
  'Premium': 3000
};

export const TOKEN_COSTS = {
  RESUME_ANALYSIS: 10,
  JD_MATCHING: 25
};

export async function getUserPlan(userId: string): Promise<UserPlan | null> {
  const { data, error } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No plan found, return null
      return null;
    }
    console.error('Error fetching user plan:', error);
    return null;
  }

  return data;
}

export async function updateUserPlan(userId: string, planName: keyof typeof PLAN_TOKENS): Promise<boolean> {
  const tokens = PLAN_TOKENS[planName];
  
  const { error } = await supabase
    .from('user_plans')
    .upsert({
      user_id: userId,
      plan_name: planName,
      tokens: tokens,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating user plan:', error);
    return false;
  }

  return true;
}

export async function deductTokens(userId: string, cost: number): Promise<boolean> {
  const plan = await getUserPlan(userId);
  if (!plan || plan.tokens < cost) {
    return false;
  }

  const { error } = await supabase
    .from('user_plans')
    .update({ tokens: plan.tokens - cost })
    .eq('user_id', userId);

  if (error) {
    console.error('Error deducting tokens:', error);
    return false;
  }

  return true;
}
