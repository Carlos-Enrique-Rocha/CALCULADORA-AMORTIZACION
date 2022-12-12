
const montoInmueble = document.getElementById('montoInmueble');
const mesesCuotaInicial = document.getElementById('mesesCuotaInicial');
const cesantias = document.getElementById('cesantias');
const afp = document.getElementById('afp');
const subsidio = document.getElementById('subsidio');
const anosCredito = document.getElementById('anosCredito');
const tasaCreditoEA = document.getElementById('tasaCreditoEA');
const cuotaInicial = document.getElementById('cuotaInicial');
const btnCalcular = document.getElementById('btnCalcular');
const llenarTabla = document.querySelector('#lista-tabla tbody');
const TablaCuotaInicial = document.querySelector('#TablaCuotaInicial tbody');
const TablaCreditoVivienda = document.querySelector('#TablaCreditoV tbody');


let dataTable;
let dataTableIsInitialized =false;

const innitDataTable = async()=>{
if (dataTableIsInitialized){
    dataTable.destroy();
}
    await calcularCuota();
    dataTable=$("#TablaCuotaInicial").DataTable({})

    dataTableIsInitialized = true;
}


btnCalcular.addEventListener('click', () => {
    calcularCuota(montoInmueble.value, mesesCuotaInicial.value, cesantias.value, afp.value, subsidio.value, tasaCreditoEA.value, anosCredito.value, cuotaInicial.value);
})

/* function convertirPesosCop(valor, moneda, formatoLenguaje = undefined){
    if (typeof valor !='number'){
        throw TypeError(`El argumento ${valor}, debe ser un numero`);
    }
    if(typeof moneda != 'string'){
        throw TypeError(`El argumento ${moneda}, debe ser una cadena de caracteres.`);
    }
    return Intl.NumberFormat(formatoLenguaje, {style: 'currency', currency: moneda}).format(valor);
} */

function calcularCuota(monmontoInmueble, mesesCuotaInicial, cesantias, afp, subsidio, tasaCreditoEA, anosCredito, cuotaInicial){
    const msgIngresos = document.getElementById('msgIngresos')

    while(llenarTabla.firstChild){
        llenarTabla.removeChild(llenarTabla.firstChild);
    }
    while(TablaCuotaInicial.firstChild){
        TablaCuotaInicial.removeChild(TablaCuotaInicial.firstChild);
    }
    while(TablaCreditoVivienda.firstChild){
        TablaCreditoVivienda.removeChild(TablaCreditoVivienda.firstChild);
    }


    let fechas = [];
    let fechaActual = Date.now();
    let mes_actual = moment(fechaActual);
    mes_actual.add(1, 'month');    
     
    let cuotaInicialPorcentaje = cuotaInicial /100;
    let valorCuotaInicial = 0;
    let pagoCuotaInicialMensual = 0;
    let valorCredito = 0;
    let tasaMensualCredito = 0;
    let cuotaPrestamoMensual = 0;
    let mesesCredito = 0;
    let saldoCuotaInicial = 0;
    let IngresoSugerido =0




    mesesCredito = anosCredito * 12;
    tasaMensualCredito = (Math.pow(1+(tasaCreditoEA/100), (1/12))-1)*100;
    valorCuotaInicial = (monmontoInmueble * cuotaInicialPorcentaje);
    pagoCuotaInicialMensual = (valorCuotaInicial - cesantias - afp - subsidio) / mesesCuotaInicial;
    valorCredito = monmontoInmueble-valorCuotaInicial;
    cuotaPrestamoMensual = valorCredito * (Math.pow(1+tasaMensualCredito/100, mesesCredito)* tasaMensualCredito/100) / (Math.pow(1+tasaMensualCredito/100, mesesCredito)-1);
    IngresoSugerido = cuotaPrestamoMensual*2.5;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${valorCuotaInicial.toFixed(0)}</td>
            <td>${pagoCuotaInicialMensual.toFixed(0)}</td>
            <td>${valorCredito.toFixed(0)}</td>
            <td>${tasaMensualCredito.toFixed(3)}%</td>
            <td>${cuotaPrestamoMensual.toFixed(2)}</td>
        `;
        llenarTabla.appendChild(row)

        msgIngresos.innerHTML = ` Los ingresos familiares sugeridos para la compra de este inmueble son: $${IngresoSugerido.toFixed(2)}`;
      
contador = mesesCuotaInicial;
contadorFecha = 0;
if (cesantias > 0){
    contador ++;
}if(afp > 0){
    contador ++;
}if(subsidio > 0){
    contador ++;
}
let acumulado = pagoCuotaInicialMensual;
   let mesesPago = 0;
   let cuotaInicialMes =[];
   //Tabla de Amortización cuota inicial
    for(let i = 0; i < contador; i++) { 

        
        if (i < mesesCuotaInicial){
            mesesPago ++;
            cuotaInicialMes.push(pagoCuotaInicialMensual)
        }
        
        if (i == mesesCuotaInicial){
            cuotaInicialMes.push(parseFloat(cesantias))
            cuotaInicialMes.push(parseFloat(subsidio))
            cuotaInicialMes.push(parseFloat(afp))
        }
        if(i >= 1){
            acumulado = acumulado + cuotaInicialMes[i];
        }
        saldoCuotaInicial = valorCuotaInicial - acumulado;
        //Formato fechas
        fechas[i] = mes_actual.format('DD-MM-YYYY');
        mes_actual.add(1, 'month');
        const row2 = document.createElement('tr');
        row2.innerHTML = `
            <th>${mesesPago}</th>
            <td>${fechas[contadorFecha]}</td>
            <td>${cuotaInicialMes[i].toFixed(2)}</td>
            <td>Cuota Inicial</td>
            <td>${acumulado.toFixed(2)}</td>
            <td>${saldoCuotaInicial.toFixed(2)}</td>
        `;
   
        if (contadorFecha < (mesesCuotaInicial-1)){
            contadorFecha ++;
        }
        TablaCuotaInicial.appendChild(row2)
    } 
//Tabla de amortización crédito vivienda
    let saldoInicial = [];
    let cuotaMensual = 0;
    let abonoCapital = 0;
    let intereses = 0;
    let saldoFinal = 0;
    mesesPago = 1;
    saldoInicial.unshift(valorCredito)
    cuotaMensual = cuotaPrestamoMensual;

    for(let i = 0; i < mesesCredito; i++) { 

        intereses = saldoInicial[i] * tasaMensualCredito/100;
        abonoCapital = cuotaPrestamoMensual - intereses
        saldoFinal = saldoInicial[i] - abonoCapital;
        saldoInicial.push(saldoFinal);
        
        const row3 = document.createElement('tr');
        row3.innerHTML = `
            <th>${mesesPago}</th>
            <td>${saldoInicial[i].toFixed(2)}</td>
            <td>${cuotaPrestamoMensual.toFixed(2)}</td>
            <td>${abonoCapital.toFixed(2)}</td>
            <td>${intereses.toFixed(2)}</td>
            <td>${saldoFinal.toFixed(2)}</td>
        `;
        mesesPago ++;
        TablaCreditoVivienda.appendChild(row3)
    } 
  
  
}


