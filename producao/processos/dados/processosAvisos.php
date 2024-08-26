<?php
//session_start();
include "../../../global/config/dbConn.php";

//$faseProcessos = $_GET['faseProcessos'];

$query = 'SELECT proces_check, proces_nome, proces_estado, proces_estado_data, proces_estado_nome, ent_nome
          FROM processo
          INNER JOIN entidade ent ON ent_cod = proces_ent_cod
          ORDER BY proces_cod, proces_estado_data, proces_estado';

//WHERE descr_fase_processo ="'.$faseProcessos.'"

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);



//foreach($data as $row) {
//  echo  '
//    <div class="small text-left">'.$row["proces_nome"].'</div>
//    ';
//};

echo '  
<!-- 1.ª Coluna -->
    <div class="col-sm-4">
      <div class="card">
        <div class="card-header text-white" style="background-color: green;"><i class="fas fa-person-digging"></i> Em Curso</div>
        <div class="card-body" id="processosFaseCurso">
          <table class="table table-striped small">
        ';
        foreach($data as $row) {
          if($row['proces_estado'] == '208'){
          echo  '
            <tr>
              <td>'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
            </tr>
          ';}};
  echo '
          </table>
        </div>
      </div>
    </div>
    <!-- 2.ª Coluna -->
    <div class="col-sm-4">
      <div class="card">
        <div class="card-header text-white" style="background-color: blue;"><i class="fas fa-book mr-1"></i> Em Contratação ou Adjudicado</div>
        <div class="card-body" id="processosFaseConcurso">
          <table class="table table-striped small">
        ';
        foreach($data as $row) {
          if($row['proces_estado'] == '205' OR $row['proces_estado'] == '206'){
          echo  '
            <tr>
              <td>'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
            </tr>
          ';}};
  echo '
          </table>
        </div>
      </div>
    </div>
    <!-- 3.ª Coluna -->
    <div class="col-sm-4">
      <div class="card">
        <div class="card-header text-white" style="background-color: red;"><i class="fas fa-search mr-1"></i> Em Consulta de Mercado</div>
        <div class="card-body" id="processosFaseConsulta">
          <table class="table table-striped small">
        ';
        foreach($data as $row) {
          if($row['proces_estado'] == '203'){
          echo  '
            <tr>
              <td>'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
            </tr>
          ';}};
echo '
            </table>
        </div>
      </div>
    </div>
    ';