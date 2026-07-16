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

                <button class="btn btn-secondary mr-1" 
                    style="padding: 6px 14px;"
                    onclick="processoSelected('.$row["proces_check"].')"
                    title="Atualizar">
                <i class="fa fa-refresh fa-lg"></i>
            </button>

            <a href="processosSearch.html"
               class="btn btn-warning mr-1" 
               style="padding: 6px 14px;"
               title="Pesquisar">
                <i class="fa fa-search fa-lg"></i>
            </a>

            <button class="btn btn-light border" 
                    style="padding: 6px 14px;"
                    onclick="processoSelected('.$row["proces_check"].')"
                    title="Imprimir">
                <i class="fa fa-print fa-lg"></i>
            </button>

            </div>
        </div>

    </div>
    ';
};