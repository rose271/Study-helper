// ─── Tab Switching ───────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active'));

    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    target.classList.add('active');
  });
});

// ─── Password Visibility Toggle ──────────────────────────────────────────────
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? 'hide' : 'show';
  });
});

// ─── Signup ───────────────────────────────────────────────────────────────────
async function handleSignup(btn) {
  const label = btn.querySelector('span');

  const first_name = document.getElementById('first-name').value.trim();
  const last_name  = document.getElementById('last-name').value.trim();
  const email      = document.getElementById('signup-email').value.trim();
  const password   = document.getElementById('signup-pw').value;
  const confirmPw  = document.getElementById('signup-pw2').value;

  // ── Frontend validation ──
  if (!first_name || !last_name || !email || !password || !confirmPw) {
    alert('Please fill in all fields.');
    return;
  }

  if (password !== confirmPw) {
    alert('Passwords do not match!');
    return;
  }

  if (password.length < 8) {
    alert('Password must be at least 8 characters.');
    return;
  }

  // ── Loading state ──
  label.textContent = 'Creating account…';
  btn.disabled = true;

  try {
    const response = await fetch('http://127.0.0.1:8000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      label.textContent = '✓ Account created!';
      btn.style.background  = '#2a7a4b';
      btn.style.borderColor = '#2a7a4b';
    } else {
      alert(data.detail || data.message || 'Signup failed.');
      label.textContent = 'Create Account →';
      btn.disabled = false;
    }

  } catch (error) {
    alert('Could not connect to server. Make sure FastAPI is running.');
    label.textContent = 'Create Account →';
    btn.disabled = false;
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function handleLogin(btn) {
  const label = btn.querySelector('span');

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pw').value;

  // ── Frontend validation ──
  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  // ── Loading state ──
  label.textContent = 'Signing in…';
  btn.disabled = true;

  try {
    const response = await fetch('http://127.0.0.1:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      label.textContent = '✓ Welcome back!';
      btn.style.background  = '#2a7a4b';
      btn.style.borderColor = '#2a7a4b';

      // Save user_id for later use across pages
      localStorage.setItem('user_id', data.user_id);

      // Redirect to main page after 1 second
      setTimeout(() => {
        window.location.href = '../frontend/mainpage.html';
      }, 1000);

    } else {
      alert(data.detail || data.message || 'Invalid email or password.');
      label.textContent = 'Sign In →';
      btn.disabled = false;
    }

  } catch (error) {
    alert('Could not connect to server. Make sure FastAPI is running.');
    label.textContent = 'Sign In →';
    btn.disabled = false;
  }
}

// ─── Submit Button Handler ────────────────────────────────────────────────────
document.querySelectorAll('.submit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.type === 'signup') handleSignup(btn);
    if (btn.dataset.type === 'login')  handleLogin(btn);
  });
});