<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeCandidatura = $_GET['nomeCandidatura'];
$pathImagens = "../../global/imagens/";
$numProcessosAdjudicados = 0;

$sqlCandidaturas = "SELECT
                    ca.cand_logo as logotipo,
                    cs.candsub_estado as estado,
                    cs.candsub_max_elegivel as max_elegivel
                    FROM candidaturas_submetidas cs
                    LEFT JOIN candidaturas_avisos ca ON ca.cand_aviso = cs.candsub_aviso
                    WHERE cs.candsub_codigo LIKE '%".$nomeCandidatura."%'";

$stmt = $myConn->query($sqlCandidaturas);
$Candidaturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Logotipo da Candidatura
foreach($Candidaturas as $key) {
  $logoCandidatura[] = $key["logotipo"];
};

$logo = $pathImagens . $logoCandidatura[0];


$sqlProcessosCandidatura = "SELECT *,
                            dep_sigla,
                            (SELECT
                            SUM(fact_valor)
                            FROM factura
                            WHERE fact_proces_check = proces_check ) AS faturado,
                            (SELECT
                            SUM(fact_finan_fundo)
                            FROM factura
                            WHERE fact_proces_check = proces_check AND
                            fact_finan_pp LIKE 'PP%') AS pedido,
                            (SELECT
                            SUM(fact_finan_pago)
                            FROM factura
                            WHERE fact_proces_check = proces_check AND
                            fact_finan_pp LIKE 'PP%') AS pago
                            FROM processo
                            INNER JOIN departamento ON dep_cod = proces_departamento
                            WHERE proces_cand LIKE '%".$nomeCandidatura."%'
                            AND proces_report_valores = 1
                            ORDER BY proces_estado_nome ASC";

$stmt = $myConn->query($sqlProcessosCandidatura);
$processosCandidatura = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Totais para o cabeçalho
// Processos incluídos na Candidatura
$totalAprovado = array_sum(array_column($Candidaturas, "max_elegivel"));
$numProcessosAprovados = count($processosCandidatura); // Quantidade de Ações Aprovadas

// Quantidade de Processos adjudicados
foreach($procesossCandidatura as $key) {
  if($key["proces_val_adjudicacoes"] > 0){
    $numProcessosAdjudicados += 1; //count($key["proces_check"]);
  }
};
$totalAdjudicado = array_sum(array_column($processosCandidatura, "proces_val_adjudicacoes"));


echo '
<div class="card col-md-12">
  <div class="card-body">
  
    <div class="d-flex align-items-center justify-content-between">
      <table class="table table-responsive table-striped">
        <tr>
          <td class="bg-primary text-white">Ações Aprovadas ('.$numProcessosAprovados.')</td> 
          <td class="bg-primary text-white">'.number_format($totalAprovado, 2, ",", ".").'€</td>
          <td class="bg-secondary text-white">Adjudicados ('.$numProcessosAdjudicados.')</td>
          <td class="bg-secondary text-white">'.number_format($totalAdjudicado, 2, ",", ".").'€</td>
        </tr>
      </table>
      <img src="'.$logo.'" alt="2030" width="200" height="50">
    </div>
  <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <table class="table table-responsive table-striped small">
        <tr>
          <th>Estado</th>
          <th>DEP</th>
          <th>PADM</th>
          <th>Processo</th>
          <th>Base</th>
          <th>Adjudicado</th>
          <th>Faturado</th>
          <th>Pedido</th>
          <th>Reembolsado</th>
        </tr>';
  foreach($procesosCandidatura as $row) {
  echo '
        <tr onclick="redirectProcesso('.$row["proces_check"].')">
          <td class="bg-primary text-white">'.$row["proces_estado_nome"].'</td>
          <td class=" bg-secondary text-white">'.$row["dep_sigla"].'</td>
          <td class=" bg-info text-white">'.$row["proces_padm"].'</td>
          <td>'.$row["proces_nome"].'</td>';
          if($row["proces_val_faturacao"] == 0){
    echo '<td class="bg-primary text-white text-right">'.number_format($row["proces_val_max"], 2, ",", ".").'€</td>';
    echo '<td class="bg-secondary text-white text-right">'.number_format($row["proces_val_adjudicacoes"], 2, ",", ".").'€</td>';
    echo '<td class="bg-primary text-white text-right">'.number_format($row["faturado"], 2, ",", ".").'€</td>';
    echo '<td class="bg-secondary text-white text-right">'.number_format($row["pedido"], 2, ",", ".").'€</td>';
    echo '<td class="bg-primary text-white text-right">'.number_format($row["pago"], 2, ",", ".").'€</td>';
          } else {
    echo '<td class="bg-primary text-white text-right">'.number_format($row["proces_val_max"], 2, ",", ".").'€</td>';
    echo '<td class="bg-secondary text-white text-right">'.number_format($row["proces_val_adjudicacoes"], 2, ",", ".").'€</td>';
    echo '<td class="bg-primary text-white text-right">'.number_format($row["faturado"], 2, ",", ".").'€</td>';
    echo '<td class="bg-secondary text-white text-right">'.number_format($row["pedido"], 2, ",", ".").'€</td>';
    echo '<td class="bg-primary text-white text-right">'.number_format($row["pago"], 2, ",", ".").'€</td>';
          }
    };
  echo '
        </tr>
        </table>
      </div>
    </div>
  </div>
</div>
';

