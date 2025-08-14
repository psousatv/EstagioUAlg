<?php
//session_start();
include "../../../global/config/dbConn.php";

//$faseProcessos = $_GET['faseProcessos'];

$query = 'SELECT *
          FROM processo
          INNER JOIN entidade ent ON ent_cod = proces_ent_cod
          WHERE proces_report_valores > 0
          ORDER BY proces_cod, proces_data_estado, proces_estado';

//WHERE descr_fase_processo ="'.$faseProcessos.'"

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo '
<div class="card">
<div class="card-body">
<div class="card-header bg-secondary text-white" >Estado dos Processos</div>
<h1 class="mt-2"></h1>
<div class="row">
  <div class="col-12">
  
      <ul class="nav nav-tabs" role="tablist">
        
        <li class="nav-item">
          <button class="nav-link active" id="Curso_tab" data-bs-toggle="tab"  data-bs-target="#curso" role="tab" type="button">
            <span class="hidden-xs-down">Em Curso</span>
          </button>
        </li>

        <li class="nav-item">
          <button class="nav-link" id="Adjudicado_tab" data-bs-toggle="tab"  data-bs-target="#adjudicado" role="tab" type="button">
            <span class="hidden-xs-up"></span>
            <span class="hidden-xs-down">Ajudicado</span>
          </button>
        </li>
        
        <li class="nav-item">
          <button class="nav-link" id="Concurso_tab" data-bs-toggle="tab"  data-bs-target="#concurso" role="tab" type="button">
            <span class="hidden-xs-down">Concurso</span>
          </button>
        </li>

        <li class="nav-item">
          <button class="nav-link" id="Consulta_tab" data-bs-toggle="tab"  data-bs-target="#consulta" role="tab" type="button">
            <span class="hidden-xs-down">Consulta</span>
          </button>
        </li>

        <li class="nav-item">
          <button class="nav-link" id="Preprar_tab" data-bs-toggle="tab"  data-bs-target="#preparar" role="tab" type="button">
            <span class="hidden-xs-down">Preparar</span>
          </button>
        </li>

        <li class="nav-item">
          <button class="nav-link" id="Outros_tab" data-bs-toggle="tab"  data-bs-target="#outros" role="tab" type="button">
            <span class="hidden-xs-down">Outros</span>
          </button>
        </li>

      </ul>

      <div class="tab-content border-start border-end border-bottom p-3">
        <div class="tab-pane fade show active" id="curso" role="tabpanel" aria-labelledby="Curso_tab">
          <div id="processosFaseCurso">
            <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_estado'] == '208'){
echo  '
                <tr onclick="redirectProcesso('.$row["proces_check"].')">
                  <td>'.$row["proces_estado_nome"].'<td>
                  <td>'.$row["proces_nome"].'</td>
                  <td>'.$row["ent_nome"].'</td>
                </tr>';
                }
              };
echo '
            </table>
          </div>
        </div>
        <div class="tab-pane fade" id="adjudicado" role="tabpanel" aria-labelledby="Adjudicado_tab">
          <div id="processosFaseAjudicado">
            <table class="table table-striped small"> ';
              foreach($data as $row) {
                if($row['proces_estado'] == '206'){
echo  '
                <tr onclick="redirectProcesso('.$row["proces_check"].')">
                  <td>'.$row["proces_estado_nome"].'<td>
                  <td>'.$row["proces_nome"].'</td>
                  <td>'.$row["ent_nome"].'</td>
                </tr>';
                }
              };
echo '
            </table>
          </div>
        </div>
        <div class="tab-pane fade" id="concurso" role="tabpanel" aria-labelledby="Concurso_tab">
          <div id="processosFaseConcurso">
            <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_estado'] == '205'){
echo  '
                  <tr onclick="redirectProcesso('.$row["proces_check"].')">
                    <td>'.$row["proces_estado_nome"].'<td>
                    <td>'.$row["proces_nome"].'</td>
                    <td>'.$row["ent_nome"].'</td>
                  </tr>';
                }
              };
echo '
            </table>
          </div>
        </div>
        <div class="tab-pane fade" id="consulta" role="tabpanel" aria-labelledby="Consulta_tab">
          <div id="processosFaseConsulta">
          <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_estado'] == '203'){
echo  '
                  <tr onclick="redirectProcesso('.$row["proces_check"].')">
                    <td>'.$row["proces_estado_nome"].'<td>
                    <td>'.$row["proces_nome"].'</td>
                    <td>'.$row["ent_nome"].'</td>
                  </tr>';
                }
              };
echo '
            </table>
          </div>
        </div>
        <div class="tab-pane fade" id="preparar" role="tabpanel" aria-labelledby="Preparar_tab">
          <div id="processosPreparar">
          <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_estado'] == '202' ){
echo  '
                  <tr onclick="redirectProcesso('.$row["proces_check"].')">
                    <td>'.$row["proces_estado_nome"].'<td>
                    <td>'.$row["proces_nome"].'</td>
                    <td>'.$row["ent_nome"].'</td>
                  </tr>';
                }
              };
echo '            
            </table>
          </div>
        </div>
        <div class="tab-pane fade" id="outros" role="tabpanel" aria-labelledby="Outros_tab">
          <div id="processosOutrasSituacoes">
          <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_estado'] == '200' OR $row['proces_estado'] == '201'){
echo  '
                  <tr onclick="redirectProcesso('.$row["proces_check"].')">
                    <td>'.$row["proces_estado_nome"].'<td>
                    <td>'.$row["proces_nome"].'</td>
                    <td>'.$row["ent_nome"].'</td>
                  </tr>';
                }
              };
echo '
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

';
