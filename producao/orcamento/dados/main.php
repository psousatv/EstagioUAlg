<?php
//session_start();
include "../../../global/config/dbConn.php";

if(isset($_POST["action"]))
{
	if($_POST["action"] == 'fetch')
	{
		$main_query = 'SELECT 
					   ru.rub_nomenclatura AS tipo,
					   ru.rub_natureza AS natureza,
					   ru.rub_nome AS rubrica,
					   ROUND(SUM(pp_valor),2) AS orcamento,
					   ROUND(SUM(p.proces_val_adjudicacoes),2) AS adjudicacoes,
					   ROUND(SUM(pp_executado_valor + pp_executado_valor_mais + pp_executado_valor_menos),2) AS faturado
					   FROM plano_pagamento
					   INNER JOIN processo p ON p.proces_check = pp_proces_check
					   INNER JOIN rubricas ru ON rub_cod = p.proces_rub_cod ';

        $search_query = 'WHERE proces_estado_nome <> "Anulado" AND ';
        
        if(isset($_POST["search"]["value"]))
        {
			$search_query .= 'pp_ano LIKE "%'.$_POST["search"]["value"].'%" ';
		}

		$group_by_query = ' GROUP BY rubrica';

		$order_by_query = '';

		if(isset($_POST["tabela"]))
        {
			$order_by_query = ' ORDER BY '.$order_column[$_POST["tabela"]["0"]["column"]].' '.$_POST["tabela"]["0"]["dir"].' ';
		}
		else
		{
			$order_by_query = ' ORDER BY natureza ASC ';
		}

		$limit_query = '';

		if($_POST["length"] != -1){
			$limit_query = 'LIMIT ' . $_POST["start"] . ', ' . $_POST["length"];
		}

		$statement = $myConn->prepare($main_query .$search_query .$group_by_query .$order_by_query);
		$statement->execute();

		$filtered_rows = $statement->rowCount();

		$statement = $myConn->prepare($main_query .$group_by_query .$order_by_query);
		$statement->execute();

		$total_rows = $statement->rowCount();

		//$result = $myConn->query($main_query . $search_query .$group_by_query . $order_by_query . $limit_query, PDO::FETCH_ASSOC);
		$result = $myConn->query($main_query .$search_query .$group_by_query .$order_by_query .$limit_query, PDO::FETCH_ASSOC);
		
		//$test = $statement->fetchAll(PDO::FETCH_ASSOC);

        $data = array();

		foreach($result as $row)
		{
			$sub_array = array();
            $sub_array[] = $row['tipo'];
			//$sub_array[] = $row['natureza'];
            $sub_array[] = $row['rubrica'];
			$sub_array[] = $row['orcamento'];
            $sub_array[] = $row['adjudicacoes'];
			$sub_array[] = $row['faturado'];
            $sub_array[] = round((($row['faturado'] / $row['adjudicacoes'] ) ) * 100 , 2) ;

			$data[] = $sub_array;
		}

		$output = array(
			"draw"			=>	intval($_POST["draw"]),
			"recordsTotal"	=>	$total_rows,
			"recordsFiltered" => $filtered_rows,
			"data"			=>	$data
		);

		echo json_encode($output);
		//echo json_encode($test);
	}
}

?>