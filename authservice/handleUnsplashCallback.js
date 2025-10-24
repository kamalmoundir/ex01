
import { QueryClient, QueryObserver } from '@tanstack/query-core';
const queryClient = new QueryClient();

function handleUnsplashCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return;

  const observer = new QueryObserver(queryClient, {
    queryKey: ['unsplashAuth', code],
    queryFn: () =>
      fetch(`http://localhost:4000/auth/unsplash/callback?code=${code}`).then(r => r.json()),
    enabled: !!code,
  });

  observer.subscribe(result => {
    if (result.isLoading) showLoading();
    if (result.isError) showError(result.error);
    if (result.isSuccess) {
      localStorage.setItem('unsplash_token', result.data.accessToken);
      localStorage.setItem('jwt', result.data.jwtToken);
      console.log('User:', result.data.unsplashUser);
      window.location.href = '/'; // Go back to main gallery
    }
  });
}

function loginWithUnsplash() {
  window.location.href = 'http://localhost:4000/auth/unsplash';
}