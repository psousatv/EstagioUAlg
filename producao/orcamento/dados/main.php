<?php
//session_start();
include "../../../global/config/dbConn.php";

if(isset($_POST["action"]))
{
	if($_POST["action"] == 'fetch')
	{
		$main_query = 'SELECT 
					   ru.rub_nome AS rubrica,
					   ru.rub_nomenclatura AS nomenclatura,
					   ROUND(SUM(proces_val_adjudicacoes),2) AS val_adjudicacoes,
					   ROUND(SUM(proces_val_faturacao),2) AS val_faturacao
					   FROM processo
					   INNER JOIN rubricas ru ON rub_cod = proces_rub_cod ';

						//ROUND(SUM(proces_val_adjudicacoes),2) AS val_adjudicacoes,
						//ROUND(SUM(proces_val_faturacao),2) AS val_faturacao,

        $search_query = 'WHERE proces_orc_ano >= YEAR(NOW())-2 AND
						 proces_report_valores > 0 AND
						 proces_estado_nome <> "Anulado" AND ';
        
        if(isset($_POST["search"]["value"]))
        {
			$search_query .= 'proces_orc_ano LIKE "%'.$_POST["search"]["value"].'%" ';
		}

		$group_by_query = ' GROUP BY rubrica ';

		$order_by_query = '';

		if(isset($_POST["tabela"]))
        {
			$order_by_query = ' ORDER BY '.$order_column[$_POST["tabela"]["0"]["column"]].' '.$_POST["tabela"]["0"]["dir"].' ';
		}
		else
		{
			$order_by_query = ' ORDER BY proces_orc_rubrica ASC ';
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
        $data = array();

		foreach($result as $row)
		{
			$sub_array = array();
            $sub_array[] = $row['nomenclatura'];
            $sub_array[] = $row['rubrica'];
            $sub_array[] = $row['val_adjudicacoes'];
            $sub_array[] = $row['val_faturacao'];

			$data[] = $sub_array;
		}

		$output = array(
			"draw"			=>	intval($_POST["draw"]),
			"recordsTotal"	=>	$total_rows,
			"recordsFiltered" => $filtered_rows,
			"data"			=>	$data
		);

		echo json_encode($output);
	}
}

?>