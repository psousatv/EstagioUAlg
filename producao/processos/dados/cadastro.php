<?php
//session_start();
include "../../../global/config/dbConn.php";

if(isset($_POST["action"]))
{
	if($_POST["action"] == 'fetch')
	{
		$main_query = "SELECT
					   proces_cod,
                       proces_nome,
                       proces_contrato,
					   proces_cpv_sigla,
					   proces_estado,
                       proces_estado_nome,
                       YEAR(proces_data_adjudicacao) AS ano_adjudicacao,
					   ROUND(SUM(proces_val_max),2) AS val_max,
					   ROUND(SUM(proces_val_adjudicacoes),2) AS val_adjudicacoes,
                       ROUND(SUM(proces_val_faturacao),2) AS val_faturacao
                       FROM processo ";

        $search_query = 'WHERE (proces_cod > 0 AND proces_report_valores = 1 AND
						 (proces_estado >= 201 AND proces_estado <= 208) OR 
						 (proces_estado >= 219 AND proces_estado <= 220)) AND ';
        
        if(isset($_POST["search"]["value"]))
        {
			$search_query .= '(proces_cod LIKE "%'.$_POST["search"]["value"].'%" OR
							   proces_estado_nome LIKE "%'.$_POST["search"]["value"].'%" )';
		}

		$group_by_query = " GROUP BY proces_contrato, proces_estado ";

		$order_by_query = "";
		if(isset($_POST["myDataTable"]))
        {
			$order_by_query = 'ORDER BY '.$order_column[$_POST['myDataTable']['0']['column']].' '.$_POST['myDataTable']['0']['dir'].' ';
		}
		else
		{
			$order_by_query = 'ORDER BY proces_contrato, proces_estado ASC ';
		}

		$limit_query = '';

		if($_POST["length"] != -1){
			$limit_query = 'LIMIT ' . $_POST['start'] . ', ' . $_POST['length'];
		}

		$statement = $myConn->prepare($main_query . $search_query . $group_by_query . $order_by_query);
		$statement->execute();

		$filtered_rows = $statement->rowCount();
		$statement = $myConn->prepare($main_query . $order_by_query);
		$statement->execute();

		$total_rows = $statement->rowCount();
		//$result = $myConn->query($main_query . $search_query . $group_by_query . $order_by_query . $limit_query, PDO::FETCH_ASSOC);
		$result = $myConn->query($main_query . $search_query . $group_by_query . $order_by_query . $limit_query, PDO::FETCH_ASSOC);
        $data = array();

		foreach($result as $row)
		{
			$sub_array = array();
            //$sub_array[] = $row['proces_cod'];
            //$sub_array[] = $row['proces_nome'];
            $sub_array[] = $row['proces_contrato'];
            $sub_array[] = $row['proces_estado_nome'];
			//$sub_array[] = $row['val_max'];
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