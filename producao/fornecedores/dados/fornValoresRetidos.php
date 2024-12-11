<?php
//session_start();
include "../../../global/config/dbConn.php";

//$logo = "../../global/imagens/LogotipoTVerde.jpg";
//$orcamentoItem = $_GET['orcamentoItem'];
//if(isset($_GET['anoCorrente'])){
//  $anoCorrente = $_GET['anoCorrente'];
//} else {
$anoCorrente = date('Y');
//};

// Valores do Orçamento na Rúbrica
$sqlOrcamentoItemRubrica = "SELECT  
                          orc_check AS controle,
                          orc_tipo AS tipo,
                          orc_linha AS linha,
                          orc_descritivo AS descritivo,
                          orc_valor_previsto AS previsto,
                          SUM(orc_valor_previsto) AS total_previsto,
                          (SELECT SUM(proces_val_adjudicacoes) FROM processo
                          WHERE proces_orcamento = controle ) AS total_adjudicado,
                          (SELECT SUM(fact_valor) FROM factura
                          LEFT JOIN processo ON proces_check = fact_proces_check
                          WHERE proces_orcamento = controle) AS total_faturado
                          FROM orcamento
                          WHERE orc_rub_cod = '".$orcamentoItem."'
                          AND orc_ano='".$anoCorrente."'
                          GROUP BY linha
                          ORDER BY orc_linha";

$stmt1 = $myConn->query($sqlOrcamentoItemRubrica);
$orcamentoItemRubrica = $stmt1->fetchAll(PDO::FETCH_ASSOC);

//Número de processos - Orçamento' na Rúbrica
$rows = count($orcamentoItemRubrica);

// Totais
$totalPrevisto = array_sum(array_column($orcamentoItemRubrica, "total_previsto"));
$totalAdjudicado = array_sum(array_column($orcamentoItemRubrica, "total_adjudicado"));
$totalFaturado = array_sum(array_column($orcamentoItemRubrica, "total_faturado"));

// Processo indexados ao orçamento
$sqlProcessosOrcamentoItemRubrica = "SELECT
                                     proces_check,
                                     proces_orcamento,
                                     proces_padm AS padm,
                                     proced_sigla AS procedimento,
                                     proces_nome AS designacao,
                                     proces_val_adjudicacoes AS adjudicado,
                                     (SELECT
                                     SUM(fact_valor)
                                     FROM factura
                                     WHERE fact_proces_check = proces_check ) AS faturado
                                     FROM processo 
                                     INNER JOIN orcamento ON orc_check = proces_orcamento
                                     INNER JOIN procedimento ON proced_cod = proces_proced_cod
                                     WHERE proces_orcamento = orc_check
                                     ORDER BY designacao";

$stmt3 = $myConn->query($sqlProcessosOrcamentoItemRubrica);
$processosOrcamentoItemRubrica = $stmt3->fetchAll(PDO::FETCH_ASSOC);

//Procurar pelo reduce em PHP para filtrar

//$totalAdjudicadoLinha = array_reduce($processosOrcamentoItemRubrica, "reduce('INV2024151',1795)");



echo '
<div class="card col-md-12">
  <div class="card-body">
  <a class="small">Os valores de orçamento são ajustados para os valores de adjudicação </a>
    <div class="d-flex align-items-center justify-content-between">
      <table class="table table-responsive table-striped">
        <tr>
          <td class="bg-primary text-white">Orçamento Previsto ('.$rows.')</td>
          <td class="bg-primary text-white">'.number_format($totalPrevisto, 2, ",", ".").'€</td>
          <td class="bg-secondary text-white">Processos Adjudicados</td>
          <td class="bg-secondary text-white">'.number_format($totalAdjudicado, 2, ",", ".").'€</td>  
          <td class="bg-success text-white">Valor Faturado</td>
          <td class="bg-success text-white">'.number_format($totalFaturado, 2, ",", ".").'€</td>
        </tr>
      </table>
      <img src="'.$logo.'" alt="2030" width="200" height="50">
    </div>
    
    <h1 class="mt-2"></h1>
    <div class="col col-md-12">
      <div class="row">
        <table class="table table-responsive table-striped small">
          <tr>
            <th>Tipo</th>
            <th>Linha</th>
            <th>Processo</th>
            <th>Previsto</th>
            <th>Adjudicado</th>
            <th>Faturado</th>
          </tr>';
          foreach($orcamentoItemRubrica as $row) {
            $soma = 0;
            echo '<tr>';
            echo '<td>'.$row["tipo"].'</td>';
            echo '<td>'.$row["linha"].'</td>';
            echo '<td>'.$row["descritivo"].'</td>';
            echo '<td colspan="3" class="text-left">'.number_format($row["previsto"], 2, ",", ".").'€</td>';
            
            foreach($processosOrcamentoItemRubrica as $key) {     
              if($row['controle'] == $key['proces_orcamento']){
                $soma += $key['adjudicado'];
                if($soma > $row['previsto']){
                  echo '<tr class="bg-danger text-white" onclick="redirectProcesso('.$key["proces_check"].')">';
                    echo '<td>'.$key['padm'].'</td>';
                    echo '<td>'.$key['procedimento'].'</td>';
                    echo '<td colspan="2">'.$key['designacao'].'</td>';
                    echo '<td class="text-right">'.number_format($key["adjudicado"], 2, ",", ".").'€</td>';
                    echo '<td class="text-right">'.number_format($key["faturado"], 2, ",", ".").'€</td>';
                  echo '</tr>';       
                } else {
                  echo '<tr class="bg-success text-white" onclick="redirectProcesso('.$key["proces_check"].')">';
                    echo '<td>'.$key['padm'].'</td>';
                    echo '<td>'.$key['procedimento'].'</td>';
                    echo '<td colspan="2">'.$key['designacao'].'</td>';
                    echo '<td class="text-right">'.number_format($key["adjudicado"], 2, ",", ".").'€</td>';
                    echo '<td class="text-right">'.number_format($key["faturado"], 2, ",", ".").'€</td>';
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
</div>';

