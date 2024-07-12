<?php
//session_start();
include "../../../global/config/dbConn.php";

if(isset($_POST["action"]))
{
	if($_POST["action"] == 'fetch')
	{

		$main_query = 'SELECT
						proces_cod AS codigo,
						proces_estado_nome AS estado,
						proces_contrato AS contrato,
						proces_padm AS padm,
						proces_nome AS designacao,
						proces_orc_ano AS ano,
						proces_orc_actividade AS actividade,
						r.rub_tipo AS tipo,
						r.rub_rubrica AS rubrica,
						r.rub_item AS item,
						ROUND((proces_val_base), 2) AS orcamento,
						ROUND((proces_val_adjudicacoes), 2) AS adjudicado,
						IF (proces_val_adjudicacoes= 0 OR proces_val_base = 0, 0, ROUND(((proces_val_adjudicacoes)  / (proces_val_base)) * 100, 2)) AS orcamento_percent,
						ROUND((proces_val_faturacao), 2) AS faturado,
						IF (proces_val_faturacao = 0 OR proces_val_adjudicacoes = 0, 0, ROUND(((proces_val_faturacao)  / (proces_val_adjudicacoes)) * 100, 2)) AS faturado_percent
						FROM processo
						INNER JOIN rubricas r ON r.rub_cod = proces_rub_cod ';


		$search_query = 'WHERE proces_report_valores = 1 ';
				
		if(isset($_POST["search"]["value"]))
		{
			$search_query .= 'AND (codigo LIKE "%'.$_POST["search"]["value"].'%" 
								   OR estado LIKE "%'.$_POST["search"]["value"].'%"
								   OR designacao LIKE "%'.$_POST["search"]["value"].'%"
								   ) ';
		}

		$order_by_query = 'ORDER BY proces_estado ASC, proces_cpv_sigla ASC ';

		$result = $myConn->query($main_query .$search_query .$order_by_query, PDO::FETCH_ASSOC);

		//$stmt = $myConn->query($query);
		//$data = $result->fetchAll(PDO::FETCH_ASSOC);

		$data = array();

		foreach($result as $row)
		{
			$sub_array = array();
			$sub_array[] = $row['codigo']; //0
            $sub_array[] = $row['estado']; //1
			$sub_array[] = $row['designacao']; //2
			$sub_array[] = $row['orcamento']; //3
			$sub_array[] = $row['adjudicado']; //4
			$sub_array[] = $row['orcamento_percent']; //5
			$sub_array[] = $row['faturado']; //6
			$sub_array[] = $row['faturado_percent']; //7

			$data[] = $sub_array;
		}

		$output = array(
			
			"data"			=>	$data
		);

		// Set the HTTP Content-Type header to indicate that the response is in JSON format
		header('Content-Type: application/json');
		echo json_encode($output);
	}
}