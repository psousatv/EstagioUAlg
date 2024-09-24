<?php
//session_start();
include "../../../global/config/dbConn.php";

//$faseProcessos = $_GET['faseProcessos'];

$query = 'SELECT proces_check, proces_nome, proces_estado, proces_cpv_sigla, proces_estado_data, proces_estado_nome, ent_nome
          FROM processo
          INNER JOIN entidade ent ON ent_cod = proces_ent_cod
          ORDER BY proces_cod, proces_estado_data, proces_estado';

//WHERE descr_fase_processo ="'.$faseProcessos.'"

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo '
<div class="card">
  <div class="card-body">
  <div class="card-header bg-secondary text-white" >Empreitadas em Curso</div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <div class="tab-content">
          <div class="tab-pane fade show active" id="curso" role="tabpanel" aria-labelledby="emCurso_tab">
            <div id="processosFaseCurso">
              <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_cpv_sigla'] === 'EMP' AND $row['proces_estado'] == '208'){
                  echo  '
                    <tr>
                      <td onclick="obraSelected('.$row["proces_check"].')">'
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
</div>
';