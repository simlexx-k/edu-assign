document.querySelectorAll('.saveGrade').forEach(button => {
  button.addEventListener('click', function() {
    const submissionId = this.getAttribute('data-submission-id');
    const grade = document.querySelector(`input[name="grade-${submissionId}"]`).value;
    const feedback = document.querySelector(`textarea[name="feedback-${submissionId}"]`).value;
    const csrfToken = document.querySelector('input[name="_csrf"]').value; // Retrieve CSRF token from the form

    fetch(`/update-grade/${submissionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken // Include CSRF token in request headers
      },
      body: JSON.stringify({ grade, feedback }),
    })
    .then(response => {
      if (!response.ok) {
        console.error('Network response was not ok');
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        console.log(`Grade and feedback updated successfully for submission ID: ${submissionId}`);
        alert('Grade and feedback updated successfully');
      } else {
        console.error('Failed to update grade and feedback');
        throw new Error('Failed to update grade and feedback');
      }
    })
    .catch(error => {
      console.error('Error updating grade:', error.message);
      console.error(error.stack); // Log the entire error stack
      alert('Error updating grade and feedback');
    });
  });
});