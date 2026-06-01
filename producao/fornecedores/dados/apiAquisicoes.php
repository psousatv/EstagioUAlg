<?php

include "../../../global/config/dbConn.php";
require_once "aquisicoesAPI.php";

header('Content-Type: application/json; charset=utf-8');

try {

    $api = new AquisicoesAPI($myConn);

    $action = $_GET['action'] ?? '';

    if ($action !== 'full') {

        echo json_encode([
            'error' => 'invalid action'
        ]);

        exit;
    }

    $tipo = $_GET['tipo'] ?? 'setores_especiais';

    $fornecedor = trim(
        $_GET['frmFornecedor'] ?? ''
    );

    $entidades = $api->getEntidades($fornecedor);

    $faturas = $api->getFaturasAll($tipo);

    $mapEntidades = [];

    foreach ($entidades as $entidade) {

        $entidade['processos'] = [];

        $entidade['total_anoAtual'] = 0;
        $entidade['total_anoAnterior'] = 0;

        $entidade['total_atividadeAA'] = 0;
        $entidade['total_atividadeARD'] = 0;
        $entidade['total_atividadeAmbas'] = 0;

        $entidade['total_faturado'] = 0;

        $mapEntidades[$entidade['ent_cod']] = $entidade;
    }

    $anoAtual = (int) date('Y');
    $anoAnterior = $anoAtual - 1;

    foreach ($faturas as $fatura) {

        $entCod = $fatura['fact_ent_cod'];
        $procCheck = $fatura['fact_proces_check'];

        if (!isset($mapEntidades[$entCod])) {
            continue;
        }

        if (!isset($mapEntidades[$entCod]['processos'][$procCheck])) {

            $mapEntidades[$entCod]['processos'][$procCheck] = [

                'proces_check' => $procCheck,
                'padm' => $fatura['padm'],
                'regime' => $fatura['regime'],
                'designacao' => $fatura['designacao'],
                'faturas' => []
            ];
        }

        $mapEntidades[$entCod]['processos'][$procCheck]['faturas'][] = [

            'fatura_expediente' => $fatura['fact_expediente'],
            'fatura' => $fatura['fact_num'],
            'fatura_data' => $fatura['fact_data'],
            'fatura_valor' => (float)$fatura['fact_valor'],
            'fatura_observacoes' => $fatura['fact_obs'],
            'fatura_atividade' => $fatura['atividade'],
            'fatura_rubrica' => $fatura['rubrica']
        ];

        $valor = (float)$fatura['fact_valor'];

        $anoFatura = (int)date(
            'Y',
            strtotime($fatura['fact_data'])
        );

        if ($anoFatura === $anoAtual) {

            $mapEntidades[$entCod]['total_anoAtual'] += $valor;
            $mapEntidades[$entCod]['total_faturado'] += $valor;
        }
        elseif ($anoFatura === $anoAnterior) {

            $mapEntidades[$entCod]['total_anoAnterior'] += $valor;
        }

        switch ($fatura['atividade']) {

            case 'AA - Águas de Abastecimento':
                $mapEntidades[$entCod]['total_atividadeAA'] += $valor;
                break;

            case 'AR - Águas Residuais':
                $mapEntidades[$entCod]['total_atividadeARD'] += $valor;
                break;

            default:
                $mapEntidades[$entCod]['total_atividadeAmbas'] += $valor;
                break;
        }
    }

    $resultado = [];

    foreach ($mapEntidades as $entidade) {

        $entidade['processos'] = array_values(
            $entidade['processos']
        );

        if ($entidade['total_faturado'] <= 0) {
            continue;
        }

        $resultado[] = $entidade;
    }

    echo json_encode(
        [
            'data' => $resultado
        ],
        JSON_UNESCAPED_UNICODE
    );

} catch (Exception $e) {

    echo json_encode([
        'error' => $e->getMessage()
    ]);
}