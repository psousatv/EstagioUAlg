<?php
//session_start();
include "../../../global/config/dbConn.php";

if (isset($_GET['nomeProcesso'])){
    $nomeProcesso = $_GET['nomeProcesso'];
    
    $query = "SELECT proces_check, proces_padm, proces_nome, ent_nome, ent_nif 
            FROM processo
            INNER JOIN entidade ON ent_cod = proces_ent_cod
            WHERE proces_nome LIKE '%".$nomeProcesso."%'
            ORDER BY proces_nome, ent_nif DESC";

    $stmt = $myConn->query($query);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $rows = $stmt->rowCount();

    echo '
        <div class="col-sm-12 col-lg-12"
            <div class="card col-sm-12">
                <table class="table table-responsive table-striped" >';
    foreach($data as $row) {
    echo '
                    <tr class="small" onclick="redirectProcesso('.$row["proces_check"].')">
                        <td>'.$row["proces_nome"].'</td>    
                        <td class="text-primary">'.$row["ent_nif"].'</td>
                        <td>'.$row["ent_nome"].'</td>
                    </tr>';
    };
    echo '      </table>
            </div>
        </div>';
} else if (isset($_GET['nomeFornecedor'])){
    $nomeFornecedor = $_GET['nomeFornecedor'];

    $query = "SELECT proces_check, proces_padm, proces_nome, ent_nome, ent_nif
            FROM processo
            INNER JOIN entidade ent ON ent_cod = proces_ent_cod
            WHERE ent_nome LIKE '%".$nomeFornecedor."%'
            ORDER BY proces_nome ASC";


    $stmt = $myConn->query($query);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $rows = $stmt->rowCount();

    //header('Content-Type: application/json');
    //echo json_encode($data);
    echo '
        <div class="col-sm-12 col-lg-12"
            <div class="card col-sm-12">
                <table class="table table-responsive table-striped" >';
    foreach($data as $row) {
    echo '
                    <tr class="small" onclick="redirectProcesso('.$row["proces_check"].')">
                        <td>'.$row["proces_nome"].'</td>    
                        <td class="text-primary">'.$row["ent_nif"].'</td>
                        <td>'.$row["ent_nome"].'</td>
                    </tr>';
    };
    echo '      </table>
            </div>
        </div>';
    } else if (isset($_GET['codigoProcessoAdministrativo'])){
        $codigoProcessoAdministrativo = $_GET['codigoProcessoAdministrativo'];
    
        $query = "SELECT proces_check, proces_padm, proces_nome, ent_nome, ent_nif
                FROM processo
                INNER JOIN entidade ent ON ent_cod = proces_ent_cod
                WHERE proces_padm LIKE '%".$codigoProcessoAdministrativo."%'
                ORDER BY proces_nome ASC";
    
    
        $stmt = $myConn->query($query);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        $rows = $stmt->rowCount();
    
        //header('Content-Type: application/json');
        //echo json_encode($data);
        echo '
            <div class="col-sm-12 col-lg-12"
                <div class="card col-sm-12">
                    <table class="table table-responsive table-striped" >';
        foreach($data as $row) {
        echo '
                        <tr class="small" onclick="redirectProcesso('.$row["proces_check"].')">
                            <td>'.$row["proces_nome"].'</td>    
                            <td class="text-primary">'.$row["ent_nif"].'</td>
                            <td>'.$row["ent_nome"].'</td>
                        </tr>';
        };
        echo '      </table>
                </div>
            </div>';
    }





