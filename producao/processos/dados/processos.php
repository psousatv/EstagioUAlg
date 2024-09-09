<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeProcesso = $_GET['nomeProcesso'];

$query = "SELECT proces_check, proces_padm, proces_nome, ent_nome, ent_nif 
          FROM processo
          INNER JOIN entidade ON ent_cod = proces_ent_cod
          WHERE proces_nome LIKE '%".$nomeProcesso."%'
          ORDER BY ent_nome";


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
                '.$row["ent_nome"]. ' [' .$row["ent_nif"].']: '.$row["proces_nome"].'
                </li>';
echo '      </ul>
        </div>
    </div>';
};
