import { supabase } from './supabase';

/**
 * Parses the Supabase OAuth hash into a format setSession can use.
 */
function parseSupabaseHash(hash: string) {
  const params = new URLSearchParams(hash.substring(1)); // remove #
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  
  if (access_token && refresh_token) {
    return { access_token, refresh_token };
  }
  return null;
}

async function handlePopupAuth(url: string) {
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  const popup = window.open(
    url,
    'supabase-auth',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    throw new Error("Popup blocked. Please allow popups for this site.");
  }

  return new Promise((resolve, reject) => {
    const handleMessage = async (event: MessageEvent) => {
      // Check origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_SUCCESS') {
        window.removeEventListener('message', handleMessage);
        
        const hash = event.data.hash;
        const sessionData = parseSupabaseHash(hash);
        
        if (sessionData) {
          const { data, error } = await supabase.auth.setSession(sessionData);
          if (error) reject(error);
          resolve(data.session);
        } else {
          // Fallback check if tokens were in search or cookie
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) reject(error);
          resolve(session);
        }
      }
    };
    window.addEventListener('message', handleMessage);
  });
}

/**
 * Initiates GitHub OAuth sign-in flow via controlled popup.
 */
export async function signInWithGithub() {
  const redirectUri = `${window.location.origin}/auth/callback`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });
  
  if (error) throw error;
  if (!data.url) throw new Error("Could not construct auth URL");

  return await handlePopupAuth(data.url);
}

/**
 * Initiates Google OAuth sign-in flow via controlled popup.
 */
export async function signInWithGoogle() {
  const redirectUri = `${window.location.origin}/auth/callback`;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });
  
  if (error) throw error;
  if (!data.url) throw new Error("Could not construct auth URL");

  return await handlePopupAuth(data.url);
}
