<?php
include "../../../global/config/dbConn.php";

$query = '
    SELECT *
    FROM processo
    INNER JOIN entidade ent ON ent_cod = proces_ent_cod
    WHERE proces_report_valores > 0
    ORDER BY proces_cod, proces_data_estado, proces_estado
';

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Mapeamento das abas para os estados correspondentes
$abas = [
    'curso' => ['label' => 'Em Curso', 'estados' => ['208']],
    'adjudicado' => ['label' => 'Adjudicado', 'estados' => ['206']],
    'concurso' => ['label' => 'Concurso', 'estados' => ['205']],
    'consulta' => ['label' => 'Consulta', 'estados' => ['203']],
    'preparar' => ['label' => 'Preparar', 'estados' => ['202']],
    'outros' => ['label' => 'Outros', 'estados' => ['200','201']],
];

echo '
<div class="card">
    <div class="card-body">
        <div class="card-header bg-secondary text-white">Estado dos Processos</div>
        <div class="row">
            <div class="col-12">
                <ul class="nav nav-tabs" role="tablist">';
                
foreach ($abas as $id => $aba) {
    $active = $id === 'curso' ? 'active' : '';
    echo '
        <li class="nav-item">
            <button class="nav-link '.$active.'" id="'.$id.'_tab" data-bs-toggle="tab" data-bs-target="#'.$id.'" role="tab" type="button">
                '.$aba['label'].'
            </button>
        </li>';
}

echo '
                </ul>
                <div class="tab-content border-start border-end border-bottom p-3">';
                
foreach ($abas as $id => $aba) {
    $active = $id === 'curso' ? 'show active' : '';
    echo '
        <div class="tab-pane fade '.$active.'" id="'.$id.'" role="tabpanel" aria-labelledby="'.$id.'_tab">
            <div id="processos_'.$id.'">
                <table class="table table-striped small">';

    foreach ($data as $row) {
        if (in_array($row['proces_estado'], $aba['estados'])) {
            echo '
                <tr onclick="redirectProcesso('.$row["proces_check"].')">
                    <td>'.$row["proces_estado_nome"].'</td>
                    <td>'.$row["proces_nome"].'</td>
                    <td>'.$row["ent_nome"].'</td>
                </tr>';
        }
    }

    echo '
                </table>
            </div>
        </div>';
}

echo '
                </div>
            </div>
        </div>
    </div>
</div>';
