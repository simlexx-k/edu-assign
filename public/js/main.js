// public/js/main.js
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form.needs-validation');

  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const formData = new FormData(this);
      const formAction = this.getAttribute('action');
      const csrfToken = this.querySelector('input[name="_csrf"]').value;

      // Check if the form contains a file input (for a different handling approach)
      let hasFileInput = false;
      for (const element of formData.entries()) {
        if (element[1] instanceof File) {
          hasFileInput = true;
          break;
        }
      }

      let fetchOptions = {
        method: 'POST',
        headers: {
          'CSRF-Token': csrfToken // Correct header for CSRF token
        },
      };

      // If the form does not contain files, send as URL-encoded string
      if (!hasFileInput) {
        fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        const formBody = [];
        for (const [key, value] of formData.entries()) {
          formBody.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
        fetchOptions.body = formBody.join('&');
      } else {
        // For forms with files, send as FormData
        fetchOptions.body = formData;
      }

      fetch(formAction, fetchOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Form submission successful:', data.message); // Logging success message
        $('#feedbackModal .modal-body').html(data.message);
        $('#feedbackModal').modal('show');
      })
      .catch(error => {
        console.error('Error during form submission:', error); // Logging the entire error
        console.error(error.stack); // Logging the error stack
        $('#feedbackModal .modal-body').html('An error occurred. Please try again.');
        $('#feedbackModal').modal('show');
      });
    });
  });
});