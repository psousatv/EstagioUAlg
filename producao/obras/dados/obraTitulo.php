<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = $_GET['codigoProcesso'];

$query = 'SELECT proces_check, proces_padm, proces_nome
          FROM processo
          WHERE proces_check ="'.$codigoProcesso.'"';


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($data as $row) {
echo  '
    <div class="row no-gutters align-items-center mb-2">

      <div class="col-10">
          <div class="d-flex justify-content-start bg-primary text-white text-truncate px-3 py-2">
              '.$row["proces_padm"].'_'.$row["proces_nome"].'
          </div>
      </div>

      <div class="col-2">
        <div class="d-flex justify-content-end px-3 py-2" style="padding: 6px 16px; min-height: 50px;">

          <a href="obraResults.html?codigoProcesso='.$row["proces_check"].'"
            class="btn btn-secondary mr-1"
            style="padding: 6px 14px;"
            title="Atualizar">
            <i class="fa-solid fa-rotate text-light"></i>
          </a>

          <a href="obrasSearch.html"
            class="btn btn-warning mr-1"
            style="padding: 6px 14px;"
            title="Procurar">
            <i class="fa-solid fa-search text-dark"></i>
          </a>

        </div>
      </div>

    </div>
';
};
