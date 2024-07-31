<?php
//session_start();
include "../../../global/config/dbConn.php";

$processo = intval($_GET['processo']);
//$q = $_GET['q'];

//Histórico Processos
$selectProcesso = 'SELECT * FROM historico
                    WHERE historico_proces_check = "' .$processo. '"
                    ORDER BY historico_dataemissao DESC' ;

$stmt = $myConn->query($selectProcesso);
$dadosProcesso = $stmt->fetchAll(PDO::FETCH_ASSOC);


echo "<table class='small'>
<tr style='text-align: center'>
<th>Data</th>
<th>Aprovado</th>
<th>Movimento</th>
<th>Documento</th>
<th>Outro</th>
<th>Valor</th>
<th>Observações</th>
<th>Notas</th>
</tr>";
foreach($dadosProcesso as $row)
{
  echo "<tr>";
  echo "<td style='width: 100px'>" .$row['historico_dataemissao']. "</td>";
  echo "<td style='width: 100px'>" .$row['historico_datamov']. "</td>";
  echo "<td style='width: 210px'>" .$row['historico_descr_nome']. "</td>";
  echo "<td style='width: 180px'>" .$row['historico_doc']. "</td>";
  echo "<td style='width: 180px'>" .$row['historico_num']. "</td>";
  echo "<td style='width: 100px; text-align:right'>" .number_format($row['historico_valor'], 2, ',', '.'). "</td>";
  echo "<td style='width: 200px'>" .$row['historico_obs']. "</td>";
  echo "<td style='width: 600px'>" .$row['historico_notas']. "</td>";
  echo "</tr>";
}
echo "</table>";

