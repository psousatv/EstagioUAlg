<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeCandidatura = $_GET['nomeCandidatura'];

$query = 'SELECT proces_check, proces_nome, proces_estado, proces_cand, proces_estado_data, proces_estado_nome, ent_nome
          FROM processo
          INNER JOIN entidade ent ON ent_cod = proces_ent_cod
          WHERE proces_cand LIKE "%'.$nomeCandidatura.'%"
          ORDER BY proces_cod, proces_estado_data, proces_estado';

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo '
<div class="card">
  <div class="card-body">
  <div class="card-header bg-secondary text-white" >Processos na Candidatura</div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <div class="tab-content">
          <div class="tab-pane fade show active" id="curso" role="tabpanel" aria-labelledby="emCurso_tab">
            <div id="processosFaseCurso">
              <table class="table table-striped small">';
              foreach($data as $row) {
                if($row['proces_cand'] === 'EMP'){
                  echo  '
                    <tr>
                      <td onclick="candidaturaSelected('.$row["proces_check"].')">'.$row["proces_estado_nome"].'_'.$row["proces_nome"].' ('.$row["ent_nome"].')</td>
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