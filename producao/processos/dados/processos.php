<?php
//session_start();
include "../../../global/config/dbConn.php";

$processo = intval($_GET['processo']);
//$q = $_GET['q'];

$query = 'SELECT * FROM processo
          WHERE (proces_cod > 0 AND proces_report_valores = 1) AND proces_estado_nome <> "Qualquer Contrato"
          AND proces_nome LIKE "%' .$processo. '%"' ;

$stmt = $myConn->query($query);

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<table class='table table-bordered'>
<tr>
<th>PAdm</th>
<th>Contrato</th>
<th>Estado</th>
<th>Nome</th>
<th>Observações/Objecto</th>
</tr>";
foreach($data as $row)
{
  echo "<tr>";
  echo "<td>" . $row['proces_padm'] . "</td>";
  echo "<td>" . $row['proces_contrato'] . "</td>";
  echo "<td>" . $row['proces_estado_nome'] . "</td>";
  echo "<td>" . $row['proces_nome'] . "</td>";
  echo "<td>" . $row['proces_obs'] . "</td>";
  echo "</tr>";
}
echo "</table>";





// Set the HTTP Content-Type header to indicate that the response is in JSON format
//header('Content-Type: application/json');

//echo json_encode($data);