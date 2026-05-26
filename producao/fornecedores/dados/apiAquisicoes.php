<?php

include "../../../global/config/dbConn.php";
require_once "aquisicoesAPI.php";

header('Content-Type: application/json; charset=utf-8');

try {

    $api = new AquisicoesAPI($myConn);

    $action = $_GET['action'] ?? '';
    $tipo = $_GET['tipo'] ?? 'geral';

    if ($action !== 'full') {
        echo json_encode(['error' => 'invalid action']);
        exit;
    }

    $fornecedor = $_GET['frmFornecedor'] ?? '';

    $entidades = $api->getEntidades($fornecedor);
    $faturas = $api->getFaturasAll($tipo);

    // =========================
    // BUILD MAP (ISTO FALTAVA)
    // =========================
    $mapEnt = [];

    foreach ($entidades as $e) {

        $e['processos'] = [];
        $e['total_anoAtual'] = 0;
        $e['total_anoAnterior'] = 0;
        $e['total_atividadeAA'] = 0;
        $e['total_atividadeARD'] = 0;
        $e['total_atividadeAmbas'] = 0;
        $e['total_faturado'] = 0;

        $mapEnt[$e['ent_cod']] = $e;
    }

    $anoAtual = (int) date('Y');
    $anoAnterior = $anoAtual - 1;

    foreach ($faturas as $f) {

        $ent = $f['fact_ent_cod'];
        $proc = $f['fact_proces_check'];

        if (!isset($mapEnt[$ent])) continue;

        if (!isset($mapEnt[$ent]['processos'][$proc])) {

            $mapEnt[$ent]['processos'][$proc] = [
                'proces_check' => $proc,
                'padm' => $f['padm'],
                'regime' => $f['regime'],
                'designacao' => $f['designacao'],
                'faturas' => []
            ];
        }

        $mapEnt[$ent]['processos'][$proc]['faturas'][] = [
            'fatura_expediente' => $f['fact_expediente'],
            'fatura' => $f['fact_num'],
            'fatura_data' => $f['fact_data'],
            'fatura_valor' => (float) $f['fact_valor'],
            'fatura_observacoes' => $f['fact_obs'],
            'fatura_atividade' => $f['atividade'],
            'fatura_rubrica' => $f['rubrica']
        ];

        $anoFatura = (int) substr($f['fact_data'], 0, 4);

        if ($anoFatura === $anoAtual) {
            $mapEnt[$ent]['total_anoAtual'] += (float) $f['fact_valor'];
            $mapEnt[$ent]['total_faturado'] += (float) $f['fact_valor'];
        } elseif ($anoFatura === $anoAnterior) {
            $mapEnt[$ent]['total_anoAnterior'] += (float) $f['fact_valor'];
        }

        if ($f['atividade'] === 'AA - Águas de Abastecimento') {
            $mapEnt[$ent]['total_atividadeAA'] += (float) $f['fact_valor'];
        } elseif ($f['atividade'] === 'AR - Águas Residuais') {
            $mapEnt[$ent]['total_atividadeARD'] += (float) $f['fact_valor'];
        } else {
            $mapEnt[$ent]['total_atividadeAmbas'] += (float) $f['fact_valor'];
        }
    }

    $result = [];

    foreach ($mapEnt as $e) {
        $e['processos'] = array_values($e['processos']);

        if ($e['total_faturado'] <= 0) continue;

        $result[] = $e;
    }

    echo json_encode([
        'data' => $result
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {

    echo json_encode([
        'error' => $e->getMessage()
    ]);
}