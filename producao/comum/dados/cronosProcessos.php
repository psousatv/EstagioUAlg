<?php

include "../../../global/config/dbConn.php";

// Query
$sql = "SELECT * FROM processos";
$result = mysqli_query($conn, $sql);

// Data atual
$dataAtual = new DateTime();

// Início do Card
//echo '<div class="col-lg-6">
//        <div class="card small">
//          <div class="card-header"><b>Obras Ativas - Cronologia</b></div>
//          <div class="card-body" id="lstCronos">';

while ($proc = mysqli_fetch_assoc($result)) {

    // Filtrar apenas processos "Em Curso"
    if ($proc['proces_estado_nome'] !== "Em Curso") {
        continue;
    }

    // Datas principais
    $dataAdjudicacao = new DateTime($proc['proces_data_adjudicacao']);
    $dataConsignacao = new DateTime($proc['proces_data_contrato']);

    // Calcular Data Termo
    $dataTermo = clone $dataAdjudicacao;
    $dataTermo->modify("+" . (int)$proc['proces_prz_exec'] . " days");

    // Criar datas limite
    $limite30 = (clone $dataAtual)->modify("-30 days");
    $limite10 = (clone $dataAtual)->modify("-10 days");

    // Definir badge conforme regra solicitada
    if ($dataTermo < $limite30) {
        $textoBadge = "Conforme";
        $classeBadge = "badge-success"; // Verde
    } elseif ($dataTermo < $limite10) {
        $textoBadge = "Prorrogar";
        $classeBadge = "badge-warning"; // Laranja
    } elseif ($dataTermo >= $dataAtual) {
        $textoBadge = "Vencida";
        $classeBadge = "badge-danger"; // Vermelho
    } else {
        $textoBadge = "Em análise";
        $classeBadge = "badge-secondary";
    }

    echo '<div style="position: relative; margin-bottom:15px; padding:10px; border-bottom:1px solid #ddd;">
            
            <div><strong>Data Adjudicação:</strong> ' . $dataAdjudicacao->format("d-m-Y") . '</div>
            <div><strong>Data Consignação:</strong> ' . $dataConsignacao->format("d-m-Y") . '</div>
            <div><strong>Data Termo:</strong> ' . $dataTermo->format("d-m-Y") . '</div>

            <span style="position: absolute; right: 50px; top: 10px;" 
                  class="badge ' . $classeBadge . '">' . $textoBadge . '</span>

          </div>';
}

// Fechamento do Card
//echo '    </div>
//        </div>
//      </div>';

?>
