
$(document).ready(function () {

    // ==========================================
    // DADOS FICTÍCIOS EM JSON
    // ==========================================

    const processosJSON = [
        {
            id: "1",
            name: "Instalação do estaleiro",
            start: "2026-06-29",
            end: "2026-07-12",
            progress: 100,
            dependencies: ""
        },
        {
            id: "2",
            name: "Abertura de valas",
            start: "2026-07-13",
            end: "2026-09-18",
            progress: 100,
            dependencies: "1"
        },
        {
            id: "3",
            name: "Assentamento de tubagens",
            start: "2026-08-10",
            end: "2026-10-20",
            progress: 85,
            dependencies: ""
        },
        {
            id: "4",
            name: "Ensaios e ligações",
            start: "2026-10-21",
            end: "2026-11-25",
            progress: 35,
            dependencies: "3"
        },
        {
            id: "5",
            name: "Reposição de pavimentos",
            start: "2026-11-02",
            end: "2026-12-15",
            progress: 15,
            dependencies: ""
        },
        {
            id: "6",
            name: "Receção provisória",
            start: "2026-12-26",
            end: "2026-12-26",
            progress: 0,
            dependencies: "4,5"
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
