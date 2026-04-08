<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Histórico Processos
$processoFaturas = "SELECT *
                    FROM factura
                    WHERE fact_proces_check = '" .$codigoProcesso. "'
                    AND fact_tipo IN ('FTN', 'FTC', 'NC')
                    ORDER BY fact_auto_num DESC";

$stmt = $myConn->query($processoFaturas);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$processoFaturasAcumulado = array_sum(array_column($data, "fact_valor"));

//Faturação
echo "
<table class='table table-bordered table-striped table-hover small'>
<thead>
<tr>
  <th colspan='16' class='bg-primary text-white'>Faturado » ".number_format($processoFaturasAcumulado, 2, ",", ".")."€</th>
</tr>
  <tr style='text-align: center'>
    <th class='bg-secondary text-white' colspan='12'>Faturas</th>
    
    <th colspan='4' class='bg-warning'>Reembolsos</th>
  </tr>
  </thead>
  <tbody>
    <tr style='text-align: center'>
      <th>Expediente</th>
      <th>Fatura</th>
      <th>Data</th>
      <th>Auto</th>
      <th>Data</th>
      <th class='bg-info text-white'>Valor</th>
      <th class='bg-info text-white'>IVA</th>
      <th>Caução</th>
      <th class='bg-secondary text-white'>SubTotal</th>
      <th class='bg-info text-white'>Outros</th>
      <th class='bg-secondary text-white'>Pagar</th>
      <th>Garantia</th>
      <th class='bg-info text-white'>Elegível</th>
      <th class='bg-warning'>Reembolso</th>
      <th class='bg-warning'>Privado</th>
    </tr>
  </tbody";
foreach($data as $row)
{
  $tipo = substr($row['fact_expediente'], 0, 1);
  $numero = substr($row['fact_expediente'], 1, 5);
  $ano = substr($row['fact_expediente'], 6, 7);
  $expediente = $tipo. "." .$numero. "." .$ano;
  $subtotal = $row['fact_valor'] - $row['fact_duovalor'];
  $pagar = $subtotal - $row['fact_duocga'];
  $elegivel = $row['fact_valor'] + $row['fact_iva'] ;
  $fundo = $row['fact_finan_fundo'];
  $privado = $row['fact_finan_max_elegivel'] - $row['fact_finan_fundo'];

  echo "
    <tr>
      <td class='text-left'>".$expediente."</td>
      <td class='text-left''>".$row['fact_tipo'].'_'.$row['fact_num']."</td>
      <td class='text-left''>".$row['fact_data']."</td>
      <td class='text-left'>".$row['fact_auto_num']."</td>
      <td class='text-left'>".$row['fact_auto_data']."</td>
      <td class='bg-info text-right text-white'>" .number_format($row['fact_valor'], 2, ',', '.'). "</td>
      <td class='bg-info text-right text-white'>" .number_format($row['fact_iva'], 2, ',', '.'). "</td>
      <td class='text-right'>" .number_format($row['fact_duovalor'], 2, ',', '.'). "</td>
      <td class='bg-secondary text-white' style='text-align:right'>
        ".number_format($subtotal, 2, ',', '.')."
      </td>
      <td class='bg-info text-right text-white'>" .number_format($row['fact_duocga'], 2, ',', '.'). "</td>
      <td class='bg-secondary text-white' style='text-align:right'>
        ".number_format($pagar, 2, ',', '.')."
      </td>
      <td class='text-right'>" .number_format($row['fact_garban'], 2, ',', '.'). "</td>
      
      <td class='bg-info text-right text-white'>" .number_format($elegivel, 2, ',', '.'). "</td>
      <td class='bg-warning text-right'>" .number_format($fundo, 2, ',', '.'). "</td>
      
      <td class='bg-warning text-right' style='text-align:right'>
        ".number_format($privado , 2, ',', '.')."
      </td>
    </tr>";
};
echo "</table>";