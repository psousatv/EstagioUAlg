<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeProcesso = strval($_GET['nomeProcesso']);

//$nomeProcesso = isset($_GET['nomeProcesso']) ? $_GET['nomeProcesso'] : '';
$query = "SELECT proces_check, proces_padm, proces_nome 
          FROM processo
          WHERE proces_nome LIKE '%"  .$nomeProcesso. "%' AND proces_report_valores = 1";

if ($nomeProcesso) {
  try {
  //$stmt = $pdo->prepare($query);
  //Bind parameters
  //$stmt->bindParam('proces_nome', $nomeProcesso, PDO::PARAM_STR);
  //Executa
  //$stmt->execute();
  // Fetch data
  //$processo = $stmt->fetch();

  $stmt = $myConn->query($query);
  $fetch = $stmt->fetchAll(PDO::FETCH_ASSOC);

$data = array();
foreach($fetch as $row) {
  $data[] = $row;
}


  // Check if user exists
  if ($nomeProcesso) {
    echo json_encode($data);
  } else {
    echo json_encode(['Mensagem' => 'Processo Não encontrado']);
  }
}
  catch (PDOException $e) {
    echo json_encode(['Erro' => 'A procura Falhou: ' . $e->getMessage()]);
  }
} else {
  echo json_encode(['Erro' => 'O processo não foi encontrado']);
}


//header('Content-Type: application/json');
//echo json_encode($data);

//foreach($resultado as $row)
//{
//  echo
//  '
//  <div onclick="resumoProcesso(this.value)" id="codigoProcesso" class="btn btn-primary col-md-1 d-grid small text-left">'.$row["proces_check"].'</div>
//  <div id="nomeProcesso" class="btn btn-primary col-md-10 d-grid small text-left">'.$row["proces_padm"].'_'.$row["proces_nome"].'</div>
//
//  ';
//};

//$stmt->close();
