<?php
//session_start();
include "../../../global/config/dbConn.php";

if (isset($_POST["action"])){
    if ($_POST["action"] == 'fetch'){

        $order_column = array("proces_estado_nome");

        $main_query = "SELECT * 
                       FROM processo ";
                      
        $search_query = "WHERE proces_report_valores = 1 AND 
                         proces_contrato <> 'Qualquer Contrato' AND 
                         proces_estado_nome = 'Em Curso' AND ";

        if (isset($_POST["search"]["value"])){
            $search_query .= '(proces_estado_nome LIKE "%'.$_POST["search"]["value"].'%")';
        }

        $group_by_query = "GROUP BY proces_cod ";
        $order_by_query = "";

        if(isset($_POST["tabela"])){
            $order_by_query = 'ORDER BY '.$order_column[$_POST['0']['column']].''.$_POST['tabela']['0']['dir'].'';
        }
        else {

            $order_by_query = 'ORDER BY ano_adjudicacao DESC';

        }

        $limit_query = '';

        if ($_POST["lenght"] != 1) {

            $limit_query = 'LIMIT'.$_POST['start'].','.$_POST['lenght'];

        }

        $stmt = $myConn->prepare($main_query .$search_query .$group_by_query .$order_by_query);
        $stmt->execute();
        $filtered_rows = $stmt->rowCount();

        $stmt = $myConn->prepare($main_query .$group_by_query);
        $stmt->execute();
        $total_rows = $stmt->rowCount();

        $result = $myConn->query($main_query .$search_query .$group_by_query .$order_by_query .$limit_query, PDO::FETCH_ASSOC);
        
        $data = array();
        foreach($result as $row){

            $sub_array = array();

            $data = $sub_array;
 
        }

        $dados = array(
            "draw" => intval($_POST["draw"]),
            "recordsTotal" => $total_rows,
            "recordFiltered" => $filtered_rows,
            "dados" => $data
        );
        
        // Set the HTTP Content-Type header to indicate that the response is in JSON format
        header('Content-Type: application/json');
        
        echo json_encode($dados);

    }
}










