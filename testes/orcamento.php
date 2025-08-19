<?php
//session_start();
include "../global/config/dbConn.php";

$logo = "../global/imagens/LogotipoTVerde.jpg";

$orcamentoItem = $_GET['orcamentoItem'];
$anoCorrente = $_GET['anoCorrente'] ?? date('Y');

$orcamento = "SELECT
              orc_ano AS ano,
              r1.rub_cod AS cod,
              r1.rub_tipo AS tipo,
              r1.rub_rubrica AS rubrica,
              r1.rub_item AS item,
              (SELECT DISTINCT (CASE WHEN fact_valor IS NULL THEN 0 ELSE SUM(fact_valor) END) FROM factura
              LEFT JOIN processo ON proces_check = fact_proces_check
              LEFT JOIN rubricas r2 ON r2.rub_cod = proces_rub_cod
              WHERE YEAR(fact_auto_data) = '".$anoCorrente."' AND r2.rub_tipo = r1.rub_tipo 
              AND r2.rub_rubrica = r1.rub_rubrica 
              AND r2.rub_item = r1.rub_item) AS faturado,
              CASE WHEN SUM(orc_valor_previsto) = 0 THEN 0 ELSE ROUND(SUM(orc_valor_previsto), 2) END AS previsto
              FROM orcamento
              LEFT JOIN rubricas r1 ON r1.rub_cod = orc_rub_cod
              WHERE orc_ano = '".$anoCorrente."'
              AND orc_rub_cod <> 100
              AND orc_rub_cod <> 999
              GROUP BY orc_ano, r1.rub_tipo, r1.rub_rubrica, r1.rub_item
              ORDER BY r1.rub_cod, r1.rub_tipo DESC, r1.rub_rubrica ASC, r1.rub_item ASC";



// Rúbricas no Orçamento
$sqlRubricaNoOrcamento = "SELECT  
                          orc_check AS controle,
                          orc_tipo AS tipo,
                          orc_linha AS linhaOrc,
                          orc_linha_SE AS linhaSE,
                          orc_descritivo AS descritivo,
                          orc_valor_previsto AS previsto,
                          SUM(orc_valor_previsto) AS total_previsto
                          FROM orcamento
                          WHERE orc_rub_cod = :orcamentoItem AND orc_ano = :anoCorrente
                          GROUP BY linhaOrc
                          ORDER BY linhaOrc";


$stmtRub = $myConn->prepare($sqlRubricaNoOrcamento);
$stmtRub->bindParam(':orcamentoItem', $orcamentoItem);
$stmtRub->bindParam(':anoCorrente', $anoCorrente);
$stmtRub->execute();
$orcamentoList = $stmtRub->fetchAll(PDO::FETCH_ASSOC);

//Número de processos - Orçamento' na Rúbrica
$rows = count($orcamentoList);

// Totais
$totalPrevisto = array_sum(array_column($orcamentoList, "total_previsto"));
$totalAdjudicado = array_sum(array_column($orcamentoList, "total_adjudicado"));
$totalFaturado = array_sum(array_column($orcamentoList, "total_faturado"));

// Processo indexados ao orçamento
$sqlProcessosOrcamentoItemRubrica = "SELECT
                                     proces_check,
                                     proces_orcamento,
                                     proces_padm AS padm,
                                     proced_sigla AS procedimento,
                                     proces_nome AS designacao,                                    
                                     (SELECT SUM(COALESCE(historico_valor, 0)) FROM historico
                                     WHERE historico_proces_check = proces_check 
                                     AND historico_descr_cod = 3) AS consulta,
                                     (SELECT SUM(COALESCE(historico_valor, 0)) FROM historico
                                     WHERE historico_proces_check = proces_check 
                                     AND historico_descr_cod = 14) AS adjudicado,
                                     (SELECT SUM(COALESCE(fact_valor, 0)) FROM factura
                                     WHERE fact_proces_check = proces_check) AS faturado
                                     FROM processo 
                                     INNER JOIN orcamento ON orc_check = proces_orcamento
                                     INNER JOIN procedimento ON proced_cod = proces_proced_cod
                                     WHERE proces_orcamento = orc_check
                                     AND proces_report_valores = 1
                                     ORDER BY designacao";

$stmt3 = $myConn->query($sqlProcessosOrcamentoItemRubrica);
$processosOrcamentoItemRubrica = $stmt3->fetchAll(PDO::FETCH_ASSOC);