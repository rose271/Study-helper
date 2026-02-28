// ─── Tab Switching ───────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Deactivate all tabs and sections
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active'));

    // Activate clicked tab and matching section
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

// ─── Form Submission ──────────────────────────────────────────────────────────
document.querySelectorAll('.submit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const label = btn.querySelector('span');

    // Show loading state
    label.textContent = type === 'login' ? 'Signing in…' : 'Creating account…';
    btn.disabled = true;

    // Simulate async request
    setTimeout(() => {
      label.textContent = type === 'login' ? '✓ Welcome back!' : '✓ Account created!';
      btn.style.background = '#2a7a4b';
      btn.style.borderColor = '#2a7a4b';
    }, 1200);
  });
});