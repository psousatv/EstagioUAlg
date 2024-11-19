<?php
//session_start();
include "../../../global/config/dbConn.php";

$logo = "../../global/imagens/LogotipoTVerde.jpg";

$orcamentoItem = $_GET['orcamentoItem'];

if(isset($_GET['anoCorrente'])){
  $anoCorrente = $_GET['anoCorrente'];
} else {
  $anoCorrente = date('Y');
};

// Valores do Orçamento na Rúbrica
$sqlOrcamentoItemRubrica = "SELECT  
                          orc_check AS controle,
                          orc_tipo AS tipo,
                          orc_linha AS linha,
                          orc_descritivo AS descritivo,
                          orc_valor_previsto AS previsto
                          FROM orcamento
                          WHERE orc_rub_cod = '".$orcamentoItem."'
                          AND orc_ano='".$anoCorrente."'
                          ORDER BY orc_linha";

$stmt1 = $myConn->query($sqlOrcamentoItemRubrica);
$orcamentoItemRubrica = $stmt1->fetchAll(PDO::FETCH_ASSOC);

//Número de processos - Orçamento' na Rúbrica
$rows = count($orcamentoItemRubrica);


// Totais Valor do Orçamento na Rúbrica
$sqlTotaisOrcamentoItemRubrica = "SELECT
                                  SUM(orc_valor_previsto) AS total_previsto,
                                  (SELECT SUM(proces_val_adjudicacoes) FROM processo
                                  WHERE proces_rub_cod = '".$orcamentoItem."'
                                  AND proces_orc_ano='".$anoCorrente."' ) AS total_adjudicado,
                                  (SELECT SUM(fact_valor) FROM factura
                                  LEFT JOIN processo ON proces_check = fact_proces_check
                                  WHERE proces_rub_cod = '".$orcamentoItem."'
                                  AND proces_orc_ano='".$anoCorrente."' ) AS total_faturado
                                  FROM orcamento
                                  WHERE orc_rub_cod = '".$orcamentoItem."'
                                  AND orc_ano='".$anoCorrente."'";

$stmt2 = $myConn->query($sqlTotaisOrcamentoItemRubrica);
$totaisOrcamentoItemRubrica = $stmt2->fetchAll(PDO::FETCH_ASSOC);

$totalPrevisto = array_sum(array_column($totaisOrcamentoItemRubrica, "total_previsto"));
$totalAdjudicado = array_sum(array_column($totaisOrcamentoItemRubrica, "total_adjudicado"));
$totalFaturado = array_sum(array_column($totaisOrcamentoItemRubrica, "total_faturado"));

// Processo indexados ao orçamento
$sqlProcessosOrcamentoItemRubrica = "SELECT
                                     proces_check,
                                     proces_orcamento,
                                     proces_padm AS padm,
                                     proces_nome AS designacao,
                                     proces_val_adjudicacoes AS adjudicado
                                     FROM processo 
                                     INNER JOIN orcamento ON orc_check = proces_orcamento
                                     WHERE proces_orcamento = orc_check
                                     ORDER BY designacao";
                                     //AND orc_ano='".$anoCorrente."'
                                     //AND orc_rub_cod = '".$orcamentoItem."'";

$stmt3 = $myConn->query($sqlProcessosOrcamentoItemRubrica);
$processosOrcamentoItemRubrica = $stmt3->fetchAll(PDO::FETCH_ASSOC);

//Procurar pelo reduce em PHP para filtrar
$totalAdjudicadoProcessos = array_sum(array_column($processosOrcamentoItemRubrica, "adjudicado"));
//$soma = 0;

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
            <!--th>Adjudicado</th-->
            <th>Previsto</th>
            <!--th>Faturado</th-->
          </tr>';
          foreach($orcamentoItemRubrica as $row) {
            $soma = 0;
            echo '<tr class="bg-primary text-white">';
            echo '<td>'.$row["tipo"].'</td>';
            echo '<td>'.$row["linha"].'</td>';
            echo '<td>'.$row["descritivo"].'</td>';
            echo '<td class="text-right">'.number_format($row["previsto"], 2, ",", ".").'€</td>';
            foreach($processosOrcamentoItemRubrica as $key) {     
              
              if($row['controle'] == $key['proces_orcamento']){
                $soma += $key['adjudicado'];
                
                if($soma > $row['previsto']){
                  //echo '<tr>';
                  //  echo '<th colspan="3">Processo</th>';
                  //  echo '<th>Adjudicado</th>';
                  //echo '</tr>';
                  echo '<tr class="bg-danger text-white" onclick="redirectProcesso('.$key["proces_check"].')">';
                    echo '<td>'.$key['padm'].'</td>';
                    echo '<td colspan="2">'.$key['designacao'].'</td>';
                    echo '<td class="text-right">'.number_format($key["adjudicado"], 2, ",", ".").'€</td>';
                  echo '</tr>';       
                } else {
                  echo '<tr class="bg-success text-white" onclick="redirectProcesso('.$key["proces_check"].')">';
                    echo '<td>'.$key['padm'].'</td>';
                    echo '<td colspan="2">'.$key['designacao'].'</td>';
                    echo '<td class="text-right">'.number_format($key["adjudicado"], 2, ",", ".").'€</td>';
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

//foreach($orcamentoItemRubrica as $row) {
//  foreach($processosOrcamentoItemRubrica as $key) {
//    if($row['controle'] == $key['proces_orcamento']){
//      echo $key['designacao'];
//      echo '<br>';
//    }
//  }
//};


