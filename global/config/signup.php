<?php

if (isset($_POST["submit"])) {

  // First we get the form data from the URL
  $name = $_POST["inputName"];
  $email = $_POST["inputEmail"];
  $username = $_POST["inputUsername"];
  $password = $_POST["inputPassword"];
  $passwordRepeat = $_POST["inputPasswordRepeat"];

  // Then we run a bunch of error handlers to catch any user mistakes we can (you can add more than I did)
  // These functions can be found in functions.inc.php

  require_once "../../config/_myUsers.inc.php";
  require_once '../../config/validate.inc.php';

  // Left inputs empty
  // We set the functions "!== false" since "=== true" has a risk of giving us the wrong outcome
  if (emptyInputSignup($name, $username, $password, $passwordRepeat, $email) !== false) {
    header("location: ../config/signup.php?error=emptyInput");
		exit();
  } 
	// Proper username chosen
  if (invalidUsername($username) !== false) {
    header("location: ../config/signup.php?error=invalidUsername");
		exit();
  }
  // Proper email chosen
  if (invalidEmail($email) !== false) {
    header("location: ../config/signup.php?error=invalidEmail");
		exit();
  }
  // Do the two passwords match?
  if (passwordMatch($password, $passwordRepeat) !== false) {
    header("location: ../config/signup.php?error=passwordsDontMatch");
 	exit();
  }
  // Is the username taken already
  if (userExists($conn, $username) !== false) {
    header("location: ../config/signup.php?error=usernameTaken");
		exit();
  }

  // If we get to here, it means there are no user errors

  // Now we insert the user into the database
  createUser($conn, $name, $username, $password, $email);

} else {
	header("location: ../index.php");
    exit();
}
