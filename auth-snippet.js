/**
 * Supabase GitHub OAuth Login Snippet (Robust Popup Flow)
 * 
 * This follows AI Studio guidelines to ensure OAuth works correctly 
 * inside iframe environments and popups.
 * 
 * REQUIRED SETUP:
 * 1. Add this callback to GitHub Developer settings:
 *    https://ais-dev-hfrwzadv5z5gpqkggfbbsf-850401878991.asia-southeast1.run.app/auth/callback
 */

async function signInWithGitHub() {
  // 1. Construct the redirect URI (must match your server route)
  const redirectUri = `${window.location.origin}/auth/callback`;

  // 2. Get the auth URL from Supabase without redirecting the main window
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    }
  });

  if (error || !data.url) {
    console.error("Failed to get auth URL:", error?.message);
    return;
  }

  // 3. Open the OAuth provider's URL in a popup
  const popup = window.open(data.url, 'supabase-auth', 'width=600,height=700');

  // 4. Listen for the success message from your server-side callback
  window.addEventListener('message', async (event) => {
    if (event.origin === window.location.origin && event.data?.type === 'OAUTH_SUCCESS') {
      // 5. Sync the session (tokens are in the hash sent from the popup)
      const params = new URLSearchParams(event.data.hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        console.log("Login successful!");
      }
    }
  });
}
