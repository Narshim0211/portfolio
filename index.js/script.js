// ========== Hamburger Menu ==========
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // ========== Contact Form via EmailJS ==========
  const form = document.getElementById('contact-form');
  if (form) {
    emailjs.init('YOUR_USER_ID'); // Replace this with your actual EmailJS User ID

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      if (!name || !email || !message) {
        alert("Please fill in all fields.");
        return;
      }

      emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        from_name: name,
        from_email: email,
        message: message,
      })
      .then(() => {
        alert('Message sent successfully!');
        form.reset();
      })
      .catch((error) => {
        alert('Failed to send message. Please try again.');
        console.error(error);
      });
    });
  }
});
