const loginBtn = document.getElementById('loginBtn');
const userInfo = document.getElementById('userInfo');
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');

let accessToken = localStorage.getItem('unsplash_token');

// Login button
loginBtn.onclick = () => {
  window.location.href = 'http://localhost:4000/auth/unsplash';
};

// Handle OAuth redirect
const params = new URLSearchParams(window.location.search);
const code = params.get('code');

async function init() {
  try {
    if (code) {
      // Exchange code for access token
      const resp = await fetch(`http://localhost:4000/auth/unsplash/callback?code=${code}`);
      const data = await resp.json();
      accessToken = data.accessToken;
      localStorage.setItem('unsplash_token', accessToken);

      showUserInfo(data.unsplashUser);

      // Remove ?code from URL to avoid JSON dump
      window.history.replaceState({}, '', '/');
      loadPhotos();
    } else if (accessToken) {
      // Already logged in, fetch user info from backend
      const resp = await fetch(`http://localhost:4000/auth/unsplash/user`);
      const data = await resp.json();
      showUserInfo(data.unsplashUser);
      loadPhotos();
    }
  } catch (err) {
    console.error(err);
  }
}

init();

// Show user info
function showUserInfo(user) {
  userInfo.innerHTML = `
    <img src="${user.profile_image.small}" alt="${user.username}" />
    <span>${user.name}</span>
  `;
}

// Fetch photos
function loadPhotos(query = '') {
  gallery.innerHTML = 'Loading...';
  const url = query
    ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}`
    : `https://api.unsplash.com/photos`;

  fetch(url, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  })
    .then(r => r.json())
    .then(data => {
      const results = data.results || data;
      gallery.innerHTML = '';
      // Get liked photo IDs from localStorage
      const likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '[]');
      results.forEach(photo => {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'photo-wrapper';

        const img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description;
        img.title = photo.user.name;
        img.onclick = () => likePhoto(photo.id);

        imgWrapper.appendChild(img);

        // If liked, show label
        if (likedPhotos.includes(photo.id)) {
          const label = document.createElement('span');
          label.className = 'liked-label';
          label.textContent = 'Liked';
          imgWrapper.appendChild(label);
        }

        gallery.appendChild(imgWrapper);
      });
    });
}

// Update likePhoto to save liked photo IDs
function likePhoto(photoId) {
  if (!accessToken) return alert('Please login first!');
  let likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '[]');
  const isLiked = likedPhotos.includes(photoId);

  // If already liked, remove it
  if (isLiked) {
    likedPhotos = likedPhotos.filter(id => id !== photoId);
    localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
    loadPhotos(); // Refresh gallery to update label
   // alert('Photo removed from saved!');
    return;
  }

  // If not liked, like it
  fetch(`https://api.unsplash.com/photos/${photoId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
    .then(r => r.json())
    .then(data => {
      likedPhotos.push(photoId);
      localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
      loadPhotos(); // Refresh gallery to show label
      //alert('Photo liked!');
    })
    .catch(err => console.error(err));
}

// Search photos
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    loadPhotos(searchInput.value);
  }
});
