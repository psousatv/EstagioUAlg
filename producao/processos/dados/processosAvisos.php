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

echo '
<div class="card">
<div class="card-body">
<div class="card-header bg-secondary text-white" >Estado dos Processos</div>
<h1 class="mt-2"></h1>
<div class="col col-md-12">
  <div class="row">
  
      <ul class="nav flex-column nav-pills" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" data-toggle="tab" id="Curso_tab" href="#curso" role="tab" aria-selected="true">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Em Curso</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" id="Adjudicado_tab" href="#adjudicado" role="tab" aria-selected="false">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Ajudicado</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" id="Concurso_tab" href="#concurso" role="tab" aria-selected="false">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Concurso</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" id="Consulta_tab" href="#consulta" role="tab" aria-selected="false">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Consulta</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" id="Preparar_tab" href="#preparar" role="tab" aria-selected="false">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Preparar</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" id="Outros_tab" href="#outros" role="tab" aria-selected="false">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Outros</span>
          </a>
        </li>
      </ul>

      <div class="tab-content">
        <div class="tab-pane fade show active" id="curso" role="tabpanel" aria-labelledby="Curso_tab">
          <div id="processosFaseCurso">
            <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_estado'] == '208'){
    echo  '
                  <tr>
                    <td onclick="codigoProcesso('.$row["proces_check"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
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
              <tr>
                <td onclick="codigoProcesso('.$row["proces_check"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
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
                <tr>
                  <td onclick="codigoProcesso('.$row["proces_check"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
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
                <tr>
                  <td onclick="codigoProcesso('.$row["proces_check"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
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
                <tr>
                  <td onclick="codigoProcesso('.$row["proces_check"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
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
                <tr>
                  <td onclick="codigoProcesso('.$row["proces_check"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
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

<script src="js/processos.js"></script>
';
