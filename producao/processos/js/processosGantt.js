
$(document).ready(function () {

    // ==========================================
    // DADOS FICTÍCIOS EM JSON
    // ==========================================

    const processosJSON = [
        {
            id: "1",
            name: "E211 - Bodega",
            start: "2026-05-06",
            end: "2026-10-18",
            progress: 91,
            dependencies: ""
        },
        {
            id: "2",
            name: "Auto 1",
            start: "2026-05-07",
            end: "2026-05-30",
            progress: 170,
            dependencies: "1"
        },
        {
            id: "3",
            name: "Auto 2",
            start: "2026-06-01",
            end: "2026-06-30",
            progress: 90,
            dependencies: "2"
        },
        {
            id: "4",
            name: "Auto 3",
            start: "2026-07-01",
            end: "2026-07-30",
            progress: 18,
            dependencies: "3"
        },
        {
            id: "5",
            name: "Auto 4",
            start: "2026-08-01",
            end: "2026-09-03",
            progress: 20,
            dependencies: "4"
        },
        {
            id: "6",
            name: "Prorrogação",
            start: "2026-09-04",
            end: "2026-10-18",
            progress: 90,
            dependencies: ""
        },
        {
            id: "7",
            name: "Auto 5",
            start: "2026-09-04",
            end: "2026-09-30",
            progress: 30,
            dependencies: "6,5"
        },
        {
            id: "8",
            name: "Auto 6",
            start: "2026-10-01",
            end: "2026-10-18",
            progress: 39,
            dependencies: "7"
        },
        {
            id: "9",
            name: "Receção Provisória",
            start: "2026-11-17",
            end: "2026-11-17",
            progress: 0,
            dependencies: "8",
            custom_class: "bar-milestone"
        }
    ];

    // ==========================================
    // INICIALIZAR GANTT
    // ==========================================

    const primeiraData = processosJSON
    .map(t => t.start)
    .sort()[0];

    //console.log("Primeira data:", primeiraData);

    const gantt = new Gantt(
        "#processosGantt",
        processosJSON,
        {
            view_mode: "Month",
            date_format: "YYYY-MM-DD",
            scroll_to: primeiraData,

            on_click: function (task) {
                console.log("Atividade:", task.name);
            },

            on_date_change: function (task, start, end) {
                console.log(
                    "Datas alteradas:",
                    task.name,
                    start,
                    end
                );
            },

            on_progress_change: function (task, progress) {
                console.log(
                    "Execução alterada:",
                    task.name,
                    progress + "%"
                );
            }
        }
    );

});
