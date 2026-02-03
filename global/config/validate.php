<?php

// Check for empty input signup
function emptyInputSignup($name, $username, $password, $passwordRepeat, $email) {
	$result;
	if (empty($name) || empty($username) || empty($password) || empty($passwordRepeat) || empty($email)) {
		$result = true;
	}
	else {
		$result = false;
	}
	return $result;
}

// Verifica se o username é válido
function invalidUsername($username) {
	$result;
	if (!preg_match("/^[a-zA-Z0-9]*$/", $username)) {
		$result = true;
	}
	else {
		$result = false;
	}
	return $result;
}

// Verifica se o email é válido
function invalidEmail($email) {
	$result;
	if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		$result = true;
	}
	else {
		$result = false;
	}
	return $result;
}

// Verifica se os imputs das passwords são iguais
function passwordMatch($password, $passwordRepeat) {
	$result;
	if ($password !== $passwordRepeat) {
		$result = true;
	}
	else {
		$result = false;
	}
	return $result;
}

// Verifica se o username existe na base de dados
function userExists($conn, $username) {
  $sql = "SELECT * FROM utilizadores WHERE username = ?;";
	$stmt = mysqli_stmt_init($conn);
	if (!mysqli_stmt_prepare($stmt, $sql)) {
	 	header("location: ../account/signup.php?error=stmtFailed");
		exit();
	}

	mysqli_stmt_bind_param($stmt, "s", $username);
	mysqli_stmt_execute($stmt);

	// Guarda o resultado da statement 
	$resultData = mysqli_stmt_get_result($stmt);


	if ($row = mysqli_fetch_assoc($resultData)) {
		return $row;
	}
	else {
		$result = false;
		return $result;
	}

	mysqli_stmt_close($stmt);
}

// Guarda os dados na bd
function createUser($conn, $name, $username, $password, $email) {
  $sql = "INSERT INTO utilizadores (name, username, password, email) 
          VALUES (?, ?, ?, ?);";

	$stmt = mysqli_stmt_init($conn);
	if (!mysqli_stmt_prepare($stmt, $sql)) {
	 	header("location: ../account/signup.php?error=stmtFailed");
		exit();
	}

	$hashedPwd = password_hash($password, PASSWORD_DEFAULT);

	mysqli_stmt_bind_param($stmt, "ssss", $name, $username, $hashedPwd, $email);
	mysqli_stmt_execute($stmt);
	mysqli_stmt_close($stmt);
	mysqli_close($conn);
	header("location: ../index.php?error=None");
	exit();
}

// Verifica se os campos estão preenchidos
function emptyInputLogin($username, $password) {
	$result;
	if (empty($username) || empty($password)) {
		$result = true;
	}
	else {
		$result = false;
	}
	return $result;
}

// Log user no site
function loginUser($conn, $username, $password) {
	$userExists = userExists($conn, $username);

	if ($userExists === false) {
		header("location: ../account/login.php?error=WrongLogin_Username");
		exit();
	}

	$pwdHashed = $userExists["password"];
	$checkPwd = password_verify($password, $pwdHashed);

	if ($checkPwd === false) {
		header("location: ../account/login.php?error=WrongLogin_Password");
		exit();
	}
	elseif ($checkPwd === true) {
		session_start();
		$_SESSION["name"] = $userExists["name"];
		$_SESSION["userName"] = $userExists["username"];
        $_SESSION["userPassword"] = $userExists["password"];
        //$cookieValue = $_SESSION["userName"];
        //setcookie("utilizadorActual", $cookieValue, time()+3600);
		header("location: ../index.php?error=None");
		exit();
	}
}