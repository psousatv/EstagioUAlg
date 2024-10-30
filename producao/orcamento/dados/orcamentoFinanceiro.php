<?php
//session_start();
include "../../../global/config/dbConn.php";

$orcamentoItem = $_GET['orcamentoItem'];
$anoCorrente = 2024; // $_GET['anoCorrente'];

//Histórico Processos
$orcamentoFaturacao = "SELECT
                    proces_rub_cod,
                    proces_padm,
                    year(fact_auto_data) AS 'Ano',
                    sum(if((fact_proces_check = fact_proces_check), round(fact_valor,2),0)) AS 'Acum',
                    sum(if((month(fact_auto_data) = 1),round(fact_valor,2),0)) AS 'Jan',
                    sum(if((month(fact_auto_data) = 2),round(fact_valor,2),0)) AS 'Fev',
                    sum(if((month(fact_auto_data) = 3),round(fact_valor,2),0)) AS 'Mar',
                    sum(if((month(fact_auto_data) = 4),round(fact_valor,2),0)) AS 'Abr',
                    sum(if((month(fact_auto_data) = 5),round(fact_valor,2),0)) AS 'Mai',
                    sum(if((month(fact_auto_data) = 6),round(fact_valor,2),0)) AS 'Jun',
                    sum(if((month(fact_auto_data) = 7),round(fact_valor,2),0)) AS 'Jul',
                    sum(if((month(fact_auto_data) = 8),round(fact_valor,2),0)) AS 'Ago',
                    sum(if((month(fact_auto_data) = 9),round(fact_valor,2),0)) AS 'Set',
                    sum(if((month(fact_auto_data) = 10),round(fact_valor,2),0)) AS 'Out',
                    sum(if((month(fact_auto_data) = 11),round(fact_valor,2),0)) AS 'Nov',
                    sum(if((month(fact_auto_data) = 12),round(fact_valor,2),0)) AS 'Dez'
                    FROM factura
                    LEFT JOIN processo ON proces_check = fact_proces_check
                    
                    WHERE proces_rub_cod = '" .$orcamentoItem. "'
                    AND proces_report_valores = 1 AND proces_orc_ano='".$anoCorrente."'
                    GROUP BY proces_rub_cod, proces_padm, year(fact_auto_data)
                    ORDER BY proces_padm ASC" ;

$stmt = $myConn->query($orcamentoFaturacao);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

//Faturação
echo "

<div class='card col-md-12'>
  <div class='card-body'>
  <div class='d-flex align-items-center justify-content-between'>
    <div class='card-header bg-secondary text-white'>Faturação por Processo Administrativo</div>
  </div>
  <h1 class='mt-2'></h1>
    <div class='col col-md-12'>
      <div class='row'>
        <table class='table table-responsive table-striped small'>
          <tr style='text-align: center'>
            <th>PADM</th>
            <th>Ano</th>
            <th>Acumulado</th>
            <th>Jan</th>
            <th>Fev</th>
            <th>Mar</th>
            <th>Abr</th>
            <th>Mai</th>
            <th>Jun</th>
            <th>Jul</th>
            <th>Ago</th>
            <th>Set</th>
            <th>Out</th>
            <th>Nov</th>
            <th>Dez</th>
          </tr>";
        foreach($data as $row){
          echo "
            <tr>
              <td style='text-align:center'>" .$row['proces_padm']. "</td>
              <td style='text-align:center'>" .$row['Ano']. "</td>
              <td style='text-align:right'>" .number_format($row['Acum'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Jan'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Fev'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Mar'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Abr'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Mai'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Jun'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Jul'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Ago'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Set'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Out'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Nov'], 2, ',', '.'). "</td>
              <td style='text-align:right'>" .number_format($row['Dez'], 2, ',', '.'). "</td>
            </tr>";
          };
        echo "
        </table>
      </div>
    </div>
  </div>
</div>";

echo "<a class='hidden'>";
json_encode($data);
echo "</a>";