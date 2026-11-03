(() => {
  const raw = sessionStorage.getItem('thaitrails-booking');
  if (!raw) {
    document.querySelector('#booking-note').textContent = 'No booking request was found in this browser tab. Please return to the trip page to submit a request.';
    document.querySelector('#booking-summary').hidden = true;
    document.querySelector('#booking-email').hidden = true;
    return;
  }

  const booking = JSON.parse(raw);
  document.querySelector('#booking-summary').hidden = false;
  document.querySelector('#booking-name').textContent = booking.name;
  document.querySelector('#booking-customer-email').textContent = booking.email;
  document.querySelector('#booking-date').textContent = booking.date;
  document.querySelector('#booking-people').textContent = booking.people;
  document.querySelector('#booking-email').href = booking.emailLink;
})();
