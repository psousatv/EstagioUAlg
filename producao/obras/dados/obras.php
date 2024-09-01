<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeProcesso = $_GET['nomeProcesso'];

$query = "SELECT proces_check, proces_padm, proces_nome
          FROM processo
          WHERE proces_nome LIKE '%".$nomeProcesso."%'";


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$rows = $stmt->rowCount();

//header('Content-Type: application/json');
//echo json_encode($data);

foreach($data as $row) {
echo '
    <div class="col-md-10 col-lg-10">
        <div class="card col-md-12">
            <ul class="list-group list-group-flush" >';
echo '
                <li class="list-group-item small" onclick="codigoProcesso('.$row["proces_check"].')">
                '.$row["proces_check"]. ' - ' .$row["proces_nome"]. '
                </li>';
echo '      </ul>
        </div>
    </div>';
};
