let loginForm = document.getElementById('loginForm');
let errorLabel = document.getElementsByTagName('h4')[0];

loginForm.addEventListener('submit', e => {
  e.preventDefault();

  let username = document.getElementsByClassName('lineedit')[0];
  let pass = document.getElementsByClassName('lineedit')[2];
  let confpass = document.getElementsByClassName('lineedit')[3];

  if (username.value.length < 8) {
    errorLabel.innerHTML = 'Username at least most have 8 charector';
  } else if (pass.value !== confpass.value) {
    errorLabel.innerHTML = 'Password and its confirm are not maching';
  } else if (pass.value.length < 8) {
    errorLabel.innerHTML = 'Password at least most have 8 charector';
  } else {
    loginForm.submit();
  }
});
