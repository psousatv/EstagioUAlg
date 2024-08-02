<?php
//session_start();
include "../../../global/config/dbConn.php";

$processo = intval($_GET['processo']);


//Seleciona o Processo
$processoSelect = "SELECT * FROM processo
                  INNER JOIN entidade ON ent_cod = proces_ent_cod
                  WHERE proces_check = '" .$processo. "'";

$stmt = $myConn->query($processoSelect);
$resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);


foreach($resultado as $row)
{
  echo 
  '<div class="btn btn-primary col-md-12 d-grid small text-left">
    '.$row["proces_padm"].'_'.$row["proces_nome"].'
    </div>
  ';
};

