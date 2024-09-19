<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = $_GET['codigoProcesso'];
$nomeFornecedor = $_GET['nomeFornecedor'];

$sqlNomeProcesso = 'SELECT proces_check, proces_padm, proces_nome
          FROM processo
          WHERE proces_check ="'.$codigoProcesso.'"';

$sqlNomeFornecedor = "SELECT proces_check, proces_padm, proces_nome, ent_nome
          FROM processo
          INNER JOIN entidade ent ON ent_cod = proces_ent_cod
          WHERE ent_nome LIKE '%".$nomeFornecedor."%'
          ORDER BY proces_nome ASC";


class nomeProcesso {
//Propriedades

//Métodos
function sqlNome($sqlNomeProcesso, $myConn){
  $stmt = $myConn->query($sqlNomeProcesso);
  $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

  foreach($data as $row) {
  echo  '
    <div class="btn btn-primary col-md-8 d-grid small text-white text-left">'.$row["proces_padm"].'_'.$row["proces_nome"].'</div>
    <div class="btn btn-warning" onclick="processoSelected('.$row["proces_check"].')"><i class="fa fa-solid fa-refresh"></i></div>  
    <div class="btn btn-primary"><a class="text-white" href="processosSearch.html"><i class="fa fa-solid fa-search"></i></a></div>
    <div class="btn btn-danger"><a class="text-white" href="../../index.html"><i class="fa fa-solid fa-house"></i></a></div>
  ';
  }
}
};

class nomeFornecedor {
//Propriedades

//Métodos
function sqlNomeFornecedor($sqlNomeFornecedor, $myConn){
  $stmt = $myConn->query($sqlNomeFornecedor);
  $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
  $rows = $stmt->rowCount();
  foreach($data as $row) {
    echo '
      <div class="col-md-10 col-lg-10">
        <div class="card col-md-12">
          <ul class="list-group list-group-flush" >';
    echo '
            <li class="list-group-item small" onclick="redirectProcesso('.$row["proces_check"].')">
            '.$row["ent_nome"]. ': (' .$row["proces_check"]. ') - ' .$row["proces_nome"]. '
            </li>';
    echo '</ul>
        </div>
      </div>';
    }
  }
};