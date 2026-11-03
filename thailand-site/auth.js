(() => {
  const accountEmailKey = 'thaitrails-demo-account-email';
  const accountNameKey = 'thaitrails-demo-account-name';
  const sessionEmailKey = 'thaitrails-demo-session-email';
  const sessionNameKey = 'thaitrails-demo-session-name';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const returnPages = new Set([
    'index.html', 'destinations.html', 'reviews.html',
    'contact.html', 'booking-success.html', 'image-credits.html'
  ]);
  const requestedPage = new URLSearchParams(location.search).get('next') || 'index.html';
  const nextPage = returnPages.has(requestedPage.split('#')[0]) ? requestedPage : 'index.html';
  const nextLink = `?next=${encodeURIComponent(nextPage)}`;
  document.querySelectorAll('[data-auth-link="login"]').forEach(link => link.href = `login.html${nextLink}`);
  document.querySelectorAll('[data-auth-link="signup"]').forEach(link => link.href = `signup.html${nextLink}`);

  const showSession = (cardId, nameId, continueId) => {
    const formCard = document.querySelector(`#${cardId}`);
    const sessionCard = document.querySelector(`#${cardId.replace('-card', '-session')}`);
    const activeEmail = sessionStorage.getItem(sessionEmailKey);
    const activeName = sessionStorage.getItem(sessionNameKey);
    if (activeEmail && activeName && formCard && sessionCard) {
      formCard.hidden = true;
      sessionCard.hidden = false;
      document.querySelector(`#${nameId}`).textContent = `Welcome, ${activeName}!`;
      document.querySelector(`#${continueId}`).href = nextPage;
      return true;
    }
    return false;
  };

  if (showSession('login-card', 'login-greeting', 'login-continue')
    || showSession('signup-card', 'signup-greeting', 'signup-continue')) return;

  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    const error = document.querySelector('#login-error');
    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const email = loginForm.elements.email.value.trim().toLowerCase();
      const password = loginForm.elements.password.value;
      if (!emailPattern.test(email) || !password) {
        error.textContent = 'Enter a valid email address and a password.';
        error.hidden = false;
        return;
      }
      if (email !== (sessionStorage.getItem(accountEmailKey) || '').toLowerCase()) {
        error.textContent = 'No account was found for this email in this browser tab. Create an account first.';
        error.hidden = false;
        return;
      }
      sessionStorage.setItem(sessionEmailKey, email);
      sessionStorage.setItem(sessionNameKey, sessionStorage.getItem(accountNameKey) || email);
      showSession('login-card', 'login-greeting', 'login-continue');
    });
  }

  const signupForm = document.querySelector('#signup-form');
  if (signupForm) {
    const error = document.querySelector('#signup-error');
    signupForm.addEventListener('submit', event => {
      event.preventDefault();
      const name = signupForm.elements.name.value.trim();
      const email = signupForm.elements.email.value.trim().toLowerCase();
      const password = signupForm.elements.password.value;
      const confirm = signupForm.elements.confirm.value;
      if (name.length < 2 || !emailPattern.test(email) || password.length < 8 || password !== confirm) {
        error.textContent = 'Enter your name, a valid email, a password of at least 8 characters, and matching passwords.';
        error.hidden = false;
        return;
      }
      if (email === (sessionStorage.getItem(accountEmailKey) || '').toLowerCase()) {
        error.textContent = 'An account with this email already exists in this tab. Log in instead.';
        error.hidden = false;
        return;
      }
      sessionStorage.setItem(accountEmailKey, email);
      sessionStorage.setItem(accountNameKey, name);
      sessionStorage.setItem(sessionEmailKey, email);
      sessionStorage.setItem(sessionNameKey, name);
      showSession('signup-card', 'signup-greeting', 'signup-continue');
    });
  }

  const signoutButton = document.querySelector('#signout-button');
  if (signoutButton) {
    const message = document.querySelector('#signout-message');
    const signoutLink = document.querySelector('#signout-login');
    if (!sessionStorage.getItem(sessionEmailKey)) message.textContent = 'You are already signed out.';
    signoutButton.addEventListener('click', () => {
      sessionStorage.removeItem(sessionEmailKey);
      sessionStorage.removeItem(sessionNameKey);
      message.textContent = 'You have been signed out.';
      signoutButton.hidden = true;
      signoutLink.hidden = false;
    });
  }
})();
