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
  
      <ul class="nav flex-column nav-pills me-6" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" data-toggle="tab" id="emCurso_tab" href="#curso" role="tab" aria-selected="true">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Em curso</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" id="emContratacao_tab" href="#contratado" role="tab" aria-selected="false">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Contratado</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" id="emConsulta_tab" href="#consulta" role="tab" aria-selected="false">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Em Consulta</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-toggle="tab" id="outraSituacao_tab" href="#outro" role="tab" aria-selected="false">
            <span class="hidden-sm-up"></span>
            <span class="hidden-xs-down">Outro</span>
          </a>
        </li>
      </ul>

      <div class="tab-content">
        <div class="tab-pane fade show active" id="curso" role="tabpanel" aria-labelledby="emCurso_tab">
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
        <div class="tab-pane fade" id="contratado" role="tabpanel" aria-labelledby="emContratacao_tab">
          <div id="processosFaseConcurso">
            <table class="table table-striped small"> ';
              foreach($data as $row) {
                if($row['proces_estado'] == '205' OR $row['proces_estado'] == '206'){
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
        <div class="tab-pane fade" id="consulta" role="tabpanel" aria-labelledby="emConsulta_tab">
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
        <div class="tab-pane fade" id="outro" role="tabpanel" aria-labelledby="outraSituacao_tab">
          <div id="lstFaturas"><b>Outra situação é listada aqui...</b></div>
        </div>
      </div>

      </div>
    </div>
  </div>
</div>

<script src="js/processos.js"></script>
';
