<?php
//session_start();
include "../../../global/config/dbConn.php";

$nomeProcesso = strval($_GET['nomeProcesso']);

$query = "SELECT proces_check, proces_padm, proces_nome 
          FROM processo
          WHERE proces_nome LIKE '%"  .$nomeProcesso. "%'";


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$rows = $stmt->rowCount();

foreach($data as $row) {
echo '
    <div class="col-md-10 col-lg-10">
        <!--div class="card col-md-12 d-grid">-->
            <ul class="list-group list-group-flush" >';
echo '
                <li class="list-group-item small" onclick="codigoProcesso('.$row["proces_check"].')">
                '.$row["proces_check"]. ' - ' .$row["proces_nome"]. '
                </li>';
echo '      </ul>
        <!--/div>-->
    </div>';
};
