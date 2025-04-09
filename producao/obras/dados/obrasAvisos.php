<?php
//session_start();
include "../../../global/config/dbConn.php";

//$faseProcessos = $_GET['faseProcessos'];

$query = 'SELECT *
          FROM processo
          INNER JOIN entidade ent ON ent_cod = proces_ent_cod
          ORDER BY proces_cod, proces_estado_data, proces_estado';

//WHERE descr_fase_processo ="'.$faseProcessos.'"

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$yearNow = date('Y');
//echo $yearNow;

echo '

<div class="col-sm-6">
  <div class="row">
    <div class="card">
      <div class="card-body">
      <div class="card-header bg-secondary text-white" >Empreitadas em Curso</div>
      <h1 class="mt-2"></h1>
    
        <div class="tab-content">
          <div class="tab-pane fade show active" id="curso" role="tabpanel" aria-labelledby="emCurso_tab">
            <div id="processosFaseCurso">
              <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_cpv_sigla'] === 'EMP' AND $row['proces_estado'] == '208'){
                  echo  '
                    <tr onclick="redirectObra('.$row["proces_check"].')">
                      <td>'
                      .$row["proces_estado_nome"].'</td> <td>'
                      .$row["proces_nome"].'</td> <td>'
                      .$row["ent_nome"].')</td>
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
</div>';

echo '
<div class="col-sm-6">
  <div class="row">
    <div class="card">
      <div class="card-body">
        <div class="card-header bg-primary text-white">Empreitadas Encerradas
          <span class="badge bg-secondary text-white">  Recepção Provisória Emitida</span>
        </div>
        <h1 class="mt-2"></h1>
        <div id="processosFinalizadosComRP">
          <table class="table table-striped small">';
          foreach($data as $row) {
            if($row['proces_cpv_sigla'] == "EMP" AND $row['proces_estado'] == "220" 
            AND date('Y', strtotime($row['proces_rp'])) >= $yearNow - 1){
              echo  '
                <tr onclick="redirectProcesso('.$row["proces_check"].')"><td>'
                  .$row["proces_estado_nome"].'</td> <td>'
                  .$row["proces_nome"].'</td> <td>'
                  .$row["ent_nome"].')</td>
                </tr>';
              }
            };
echo '
          </table>
        </div>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="card">
      <div class="card-body">
        <div class="card-header bg-warning text-black">Empreitadas Finalizadas - 
          <span class="badge bg-primary text-white"> Com elementos insuficientes para Encerrar</span>
        </div>
      <h1 class="mt-2"></h1>
        <div id="processosFinalizadosSemRP">
          <table class="table table-striped small">';
          foreach($data as $row) {
            if($row['proces_cpv_sigla'] === "EMP" AND $row['proces_estado'] == "219" 
            AND $row['proces_rp'] == null AND $row['proces_proced_cod'] != "30"){
              echo  '
                <tr onclick="redirectProcesso('.$row["proces_check"].')">
                  <td>'
                  .$row["proces_estado_nome"].'</td> <td>'
                  .$row["proces_nome"].'</td> <td>'
                  .$row["ent_nome"].')</td>
                </tr>';
              }
            };

echo '
          </table>
        </div>
      </div>
    </div>
  </div>
</div>';