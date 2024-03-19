<?php
//session_start();
include "../../../global/config/dbConn.php";

if(isset($_POST["action"]))
{
	if($_POST["action"] == 'fetch')
	{
		//$main_query = 'SELECT 
		//			   ru.rub_tipo AS tipo,
		//			   ru.rub_rubrica AS rubrica,
		//			   ru.rub_item AS item,
		//			   ROUND(SUM(o.orcam_valor),2) AS orcamento,
		//			   ROUND(SUM(proces_val_adjudicacoes) - SUM(proces_val_faturacao_menos), 2) AS adjudicado,
		//				ROUND(SUM(proces_val_faturacao), 2) AS faturado
		//			   FROM orcamento o
		//			   INNER JOIN rubricas ru ON rub_item = o.orcam_rubrica_item ';

		$main_query = 'SELECT
						r.rub_tipo AS tipo,
						r.rub_rubrica AS rubrica,
						r.rub_item AS item,
						proces_orc_ano AS ano,
						ROUND(SUM(proces_val_base), 2) AS orcamento,
						ROUND(SUM(proces_val_adjudicacoes) - SUM(proces_val_faturacao_menos), 2) AS adjudicado,
						IF(SUM(proces_val_base) = 0 OR (SUM(proces_val_adjudicacoes) - SUM(proces_val_faturacao_menos)) = 0, 0, 
						ROUND(((SUM(proces_val_adjudicacoes) - SUM(proces_val_faturacao_menos)) / SUM(proces_val_base)) * 100, 2)) AS percent,
						ROUND(SUM(proces_val_faturacao), 2) AS faturado
						FROM processo
						JOIN rubricas r ON r.rub_cod = proces_rub_cod 
						';

        $search_query = ' ';
        
        if(isset($_POST["search"]["value"]))
        {
			$search_query .= 'WHERE proces_report_valores = 1 AND
							  proces_orc_ano LIKE "%'.$_POST["search"]["value"].'%" ';
		}
 
		$group_by_query = ' GROUP BY tipo, rubrica, item ';

		$order_by_query = '';

		if(isset($_POST["tabela"]))
        {
			$order_by_query = ' ORDER BY '.$order_column[$_POST["tabela"]["0"]["column"]].' '.$_POST["tabela"]["0"]["dir"].' ';
		}
		else
		{
			$order_by_query = ' ORDER BY tipo ASC ';
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
		
		//$data = $result->fetchAll(PDO::FETCH_ASSOC);

        $data = array();

		foreach($result as $row)
		{
			$sub_array = array();
			$sub_array[] = $row['tipo'];
            $sub_array[] = $row['rubrica'];
			$sub_array[] = $row['item'];
			$sub_array[] = $row['orcamento'];
            $sub_array[] = $row['adjudicado'];
			$sub_array[] = $row['percent'];;
			$sub_array[] = $row['faturado'];

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