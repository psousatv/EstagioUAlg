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
                            SUM(fact_finan_pago)
                            FROM factura
                            WHERE fact_proces_check = proces_check AND
                            fact_finan_pp LIKE 'PP%') AS reembolsado
                            FROM processo
                            INNER JOIN departamento ON dep_cod = proces_departamento
                            WHERE proces_cand LIKE '%".$nomeCandidatura."%'
                            AND proces_report_valores = 1
                            ORDER BY proces_estado_nome ASC";

$stmt = $myConn->query($sqlProcessosCandidatura);
$processosCandidatura = $stmt->fetchAll(PDO::FETCH_ASSOC);

$sqlValoresCandidatura = "SELECT 
                          historico_proces_check AS processo,
                          MAX(CASE WHEN historico_descr_cod = 92 THEN historico_doc ELSE 0 END) AS expediente,
                          historico_num AS numero,
                          MAX(historico_dataemissao) AS registo,
                          SUM(CASE WHEN historico_descr_cod = 91 THEN historico_valor ELSE 0 END) AS valor1,
                          SUM(CASE WHEN historico_descr_cod = 92 THEN historico_valor ELSE 0 END) AS valor2
                          FROM historico 
                          WHERE historico_descr_cod IN (91, 92)
                          GROUP BY historico_proces_check, historico_num";

$stmt = $myConn->query($sqlValoresCandidatura);
$valoresCandidatura = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Totais para o cabeçalho
// Processos incluídos na Candidatura
$totalAprovado = array_sum(array_column($Candidaturas, "max_elegivel"));
$numProcessosAprovados = count($processosCandidatura); // Quantidade de Ações Aprovadas

// Quantidade de Processos adjudicados
foreach($processosCandidatura as $key) {
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
          <th>Processo</th>
          <th>Base</th>
          <th>Adjudicado</th>
          <th>Faturado</th>
          <th>Pedido</th>
          <th>Reembolsado</th>
        </tr>';
  foreach($processosCandidatura as $row) {
  echo '
        <tr onclick="redirectProcesso('.$row["proces_check"].')">
          <td class="bg-primary text-white">'.$row["proces_estado_nome"].'</td>
          <td>'.$row["proces_nome"].'</td>';
          if($row["proces_val_faturacao"] == 0){
            echo '<td class="bg-primary text-white text-right">'.number_format($row["proces_val_max"], 2, ",", ".").'€</td>';
            echo '<td class="bg-secondary text-white text-right">'.number_format($row["proces_val_adjudicacoes"], 2, ",", ".").'€</td>';
            echo '<td colspan="3"></td>';
          } else {
            echo '<td class="bg-primary text-white text-right">'.number_format($row["proces_val_max"], 2, ",", ".").'€</td>';
            echo '<td class="bg-secondary text-white text-right">'.number_format($row["proces_val_adjudicacoes"], 2, ",", ".").'€</td>';
            echo '<td class="bg-primary text-white text-right">'.number_format($row["faturado"], 2, ",", ".").'€</td>';
            echo '<td class="table-warning small">facturas</td>';
            echo '<td class="bg-primary text-white text-right">'.number_format($row["reembolsado"], 2, ",", ".").'€</td>';
            foreach($valoresCandidatura as $valores ){
              if($valores["processo"] == $row["proces_check"]){
                echo '<tr class="table table-sm table-info">';
                echo '<td colspan="2"></td>';
                echo '<td>'.$valores["expediente"].'</td>';
                echo '<td>'.$valores["registo"].'</td>';
                echo '<td>'.$valores["numero"].'</td>';
                echo '<td class="text-right">'.number_format($valores["valor1"], 2, ",", ".").'€</td>';
                echo '<td class="text-right">'.number_format($valores["valor2"], 2, ",", ".").'€</td>';
                echo '</tr>';
                }
            }
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

