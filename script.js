const registros = JSON.parse(localStorage.getItem("registros")) || {};
let dataAtual = new Date();

function iniciarModoEscuro() {
    document.body.classList.add("dark");
}

function alterarData(direcao) {
    dataAtual.setDate(dataAtual.getDate() + direcao);
    exibirData();
    resetarRegistros();
    carregarDadosSalvos();
}

function exibirData() {
    const dataFormatada = dataAtual.toISOString().split('T')[0];
    document.getElementById("data-atual").textContent = dataFormatada;
}

function resetarRegistros() {
    document.getElementById("entrada").value = "";
    document.getElementById("refeicaoInicio").value = "";
    document.getElementById("refeicaoFim").value = "";
    document.getElementById("fimJornada").value = "";
    document.getElementById("entradaExtra").value = "";
    document.getElementById("saidaExtra").value = "";

    atualizarTotais();
}

function calcularHoras() {
    const entrada = document.getElementById("entrada").value;
    const refeicaoInicio = document.getElementById("refeicaoInicio").value;
    const refeicaoFim = document.getElementById("refeicaoFim").value;
    const fimJornada = document.getElementById("fimJornada").value;

    if (entrada && refeicaoInicio && refeicaoFim && fimJornada) {
        const horasTrabalhadas = (new Date(`1970-01-01T${fimJornada}:00`) - new Date(`1970-01-01T${entrada}:00`) - 
            (new Date(`1970-01-01T${refeicaoFim}:00`) - new Date(`1970-01-01T${refeicaoInicio}:00`))) / (1000 * 60 * 60);
        const horasDevidas = 7 - horasTrabalhadas;

        const dataFormatada = dataAtual.toISOString().split('T')[0];
        if (!registros[dataFormatada]) {
            registros[dataFormatada] = { horasTrabalhadas: 0, horasExtras: 0, devido: 0 };
        }
        registros[dataFormatada].horasTrabalhadas = horasTrabalhadas;
        registros[dataFormatada].devido = horasDevidas;

        salvarRegistros();
        atualizarTotais();
        adicionarRegistroTabela();
    }
}

function calcularHorasExtras() {
    const entradaExtra = document.getElementById("entradaExtra").value;
    const saidaExtra = document.getElementById("saidaExtra").value;

    if (entradaExtra && saidaExtra) {
        const horasExtras = (new Date(`1970-01-01T${saidaExtra}:00`) - new Date(`1970-01-01T${entradaExtra}:00`)) / (1000 * 60 * 60);

        const dataFormatada = dataAtual.toISOString().split('T')[0];
        if (!registros[dataFormatada]) {
            registros[dataFormatada] = { horasTrabalhadas: 0, horasExtras: 0, devido: 0 };
        }
        registros[dataFormatada].horasExtras = horasExtras;

        salvarRegistros();
        atualizarTotais();
        adicionarRegistroTabela();
    }
}

function salvarRegistros() {
    localStorage.setItem("registros", JSON.stringify(registros));
}

function carregarDadosSalvos() {
    const dataFormatada = dataAtual.toISOString().split('T')[0];
    if (registros[dataFormatada]) {
        const registro = registros[dataFormatada];
        document.getElementById("entrada").value = registro.entrada || "";
        document.getElementById("refeicaoInicio").value = registro.refeicaoInicio || "";
        document.getElementById("refeicaoFim").value = registro.refeicaoFim || "";
        document.getElementById("fimJornada").value = registro.fimJornada || "";
        document.getElementById("entradaExtra").value = registro.entradaExtra || "";
        document.getElementById("saidaExtra").value = registro.saidaExtra || "";
    }
}

function atualizarTotais() {
    let totalHorasTrabalhadas = 0;
    let totalHorasExtras = 0;
    let totalDevido = 0;

    for (let data in registros) {
        totalHorasTrabalhadas += registros[data].horasTrabalhadas;
        totalHorasExtras += registros[data].horasExtras;
        totalDevido += registros[data].devido;
    }

    document.getElementById("totalHorasTrabalhadas").textContent = `Total Horas Trabalhadas: ${formatarHoras(totalHorasTrabalhadas)}`;
    document.getElementById("totalHorasExtras").textContent = `Total Horas Extras: ${formatarHoras(totalHorasExtras)}`;

    const DevendoEl = document.getElementById("Devendo");
    if (totalDevido < 0) {
        DevendoEl.textContent = `Devendo: ${formatarHoras(Math.abs(totalDevido))}`;
        DevendoEl.classList.add("negativo");
    } else {
        DevendoEl.textContent = `Devendo: -${formatarHoras(totalDevido)}`;
        DevendoEl.classList.remove("negativo");
    }
}

// Função para adicionar registros na tabela
function adicionarRegistroTabela() {
    const tabelaRegistros = document.getElementById("tabelaRegistros");
    const novaLinha = tabelaRegistros.insertRow();
    const dataFormatada = dataAtual.toISOString().split('T')[0];

    const celulaData = novaLinha.insertCell(0);
    const celulaHorasTrabalhadas = novaLinha.insertCell(1);
    const celulaHorasExtras = novaLinha.insertCell(2);

    celulaData.textContent = dataFormatada;
    celulaHorasTrabalhadas.textContent = formatarHoras(registros[dataFormatada].horasTrabalhadas);
    celulaHorasExtras.textContent = formatarHoras(registros[dataFormatada].horasExtras);

    salvarTabela(); // Salva a tabela sempre que ela for atualizada
}

// Função para salvar a tabela no localStorage
function salvarTabela() {
    const tabelaRegistros = document.getElementById("tabelaRegistros");
    const registrosTabela = [];

    for (let i = 0; i < tabelaRegistros.rows.length; i++) {
        const row = tabelaRegistros.rows[i];
        const data = row.cells[0].textContent;
        const horasTrabalhadas = row.cells[1].textContent;
        const horasExtras = row.cells[2].textContent;
        registrosTabela.push({ data, horasTrabalhadas, horasExtras });
    }

    localStorage.setItem("registrosTabela", JSON.stringify(registrosTabela));
}

// Função para carregar a tabela do localStorage
function carregarTabela() {
    const registrosTabela = JSON.parse(localStorage.getItem("registrosTabela")) || [];

    const tabelaRegistros = document.getElementById("tabelaRegistros");
    tabelaRegistros.innerHTML = ""; // Limpa a tabela antes de carregar os dados

    registrosTabela.forEach(registro => {
        const novaLinha = tabelaRegistros.insertRow();

        const celulaData = novaLinha.insertCell(0);
        const celulaHorasTrabalhadas = novaLinha.insertCell(1);
        const celulaHorasExtras = novaLinha.insertCell(2);

        celulaData.textContent = registro.data;
        celulaHorasTrabalhadas.textContent = registro.horasTrabalhadas;
        celulaHorasExtras.textContent = registro.horasExtras;
    });
}

function formatarHoras(horas) {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    return `${String(horasInteiras).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

// Carregar os dados da tabela e registros salvos ao carregar a página
window.onload = function() {
    exibirData();
    carregarDadosSalvos();
    carregarTabela(); // Carrega a tabela
    atualizarTotais();
};
