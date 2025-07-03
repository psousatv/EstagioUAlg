<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = $_GET['codigoProcesso'];

$query = 'SELECT proces_rel_sec, proces_estado_nome, proces_padm, proces_nome
          FROM processo_relacoes
          INNER JOIN processo ON proces_check = proces_rel_sec
          WHERE proces_rel_prin ="'.$codigoProcesso.'"
          ORDER BY proces_cod, proces_sub';


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$rows = count($data);

echo '
<div class="card col-md-12">
  <div class="card-body">
  <div class="card-header bg-info text-white" >Avisos do Processos ('.$rows.')</div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <ul class="list-group">';
        foreach($data as $row) {
            echo  '
              <li class="list-group-item">
                '.$row["proces_nome"]. '<span class="badge bg-info text-white">'.$row["proces_estado_nome"].'</span>
              </li>
              <!--tr>
                <td onclick="redirectProcesso('.$row["proces_rel_sec"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].'</td>
              </tr-->';
          };
            echo '
        </ul>
      </div>
    </div>
  </div>
</div>';
echo '<h1 class="mt-4"></h1>';
echo '
<div class="card col-md-12">
  <div class="card-body">
  <div class="card-header bg-warning" >Processos Relacionados ('.$rows.')</div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <ul class="list-group">';
        foreach($data as $row) {
            echo  '
              <li class="list-group-item" onclick="redirectProcesso('.$row["proces_rel_sec"].')">
                <span class="badge bg-info text-white">'.$row["proces_estado_nome"].'</span>
                '.$row["proces_nome"]. '
              </li>
              <!--tr>
                <td onclick="redirectProcesso('.$row["proces_rel_sec"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].'</td>
              </tr-->';
          };
            echo '
        </ul>
      </div>
    </div>
  </div>
</div>';