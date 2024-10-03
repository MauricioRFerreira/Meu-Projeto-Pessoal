const registros = {};
let dataAtual = new Date();

function iniciarModoEscuro() {
    document.body.classList.add("dark");
}

function alterarData(direcao) {
    dataAtual.setDate(dataAtual.getDate() + direcao);
    exibirData();
    resetarRegistros();
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
    const entrada = document.getElementById("entrada").valueAsDate;
    const refeicaoInicio = document.getElementById("refeicaoInicio").valueAsDate;
    const refeicaoFim = document.getElementById("refeicaoFim").valueAsDate;
    const fimJornada = document.getElementById("fimJornada").valueAsDate;

    if (entrada && refeicaoInicio && refeicaoFim && fimJornada) {
        const horasTrabalhadas = (fimJornada - entrada - (refeicaoFim - refeicaoInicio)) / (1000 * 60 * 60);
        const horasDevidas = 7 - horasTrabalhadas;

        const dataFormatada = dataAtual.toISOString().split('T')[0];
        if (!registros[dataFormatada]) {
            registros[dataFormatada] = { horasTrabalhadas: 0, horasExtras: 0, devido: 0 };
        }
        registros[dataFormatada].horasTrabalhadas = horasTrabalhadas;
        registros[dataFormatada].devido = horasDevidas;

        atualizarTotais();
        adicionarRegistroTabela();
    }
}

function calcularHorasExtras() {
    const entradaExtra = document.getElementById("entradaExtra").valueAsDate;
    const saidaExtra = document.getElementById("saidaExtra").valueAsDate;

    if (entradaExtra && saidaExtra) {
        const horasExtras = (saidaExtra - entradaExtra) / (1000 * 60 * 60);

        const dataFormatada = dataAtual.toISOString().split('T')[0];
        if (!registros[dataFormatada]) {
            registros[dataFormatada] = { horasTrabalhadas: 0, horasExtras: 0, devido: 0 };
        }
        registros[dataFormatada].horasExtras = horasExtras;

        atualizarTotais();
        adicionarRegistroTabela();
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

    const estaDevendoEl = document.getElementById("estaDevendo");
    if (totalDevido < 0) {
        estaDevendoEl.textContent = `Está Devendo: -${formatarHoras(Math.abs(totalDevido))}`;
        estaDevendoEl.classList.add("negativo");
    } else {
        estaDevendoEl.textContent = `Está Devendo: ${formatarHoras(totalDevido)}`;
        estaDevendoEl.classList.remove("negativo");
    }
}

function adicionarRegistroTabela() {
    const tabelaRegistros = document.getElementById("tabelaRegistros");
    tabelaRegistros.innerHTML = "";

    for (let data in registros) {
        const novaLinha = tabelaRegistros.insertRow();

        const celulaData = novaLinha.insertCell(0);
        const celulaHorasTrabalhadas = novaLinha.insertCell(1);
        const celulaHorasExtras = novaLinha.insertCell(2);

        celulaData.textContent = data;
        celulaHorasTrabalhadas.textContent = formatarHoras(registros[data].horasTrabalhadas);
        celulaHorasExtras.textContent = formatarHoras(registros[data].horasExtras);
    }
}

function formatarHoras(horas) {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    return `${String(horasInteiras).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

window.onload = exibirData;
