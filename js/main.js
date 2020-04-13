$(document).ready(function() {

    trovaGrafico();

    $('#invia-dati').on('click', function(event) {
        $('#vendite-lineare').empty();
        $('#vendite-torta').empty();
        var valoreInput = parseInt($('#valore-dati-vendita').val());
        var valoreInputInt = parseInt(valoreInput);
        var ritornaValore = ritornaNumero(valoreInputInt);
        var dataInserita = $('#select-date').val();
        var dateInserita = moment(new Date(dataInserita));
        var dateEstrapolata = dateInserita.format('DD/MM/YYYY');
        var numeroVenditore = $('#selectVenditore').val();
        var oggettoDaInserire = {};
        // console.log(oggettoDaInserire);
        // console.log(valoreInput);

        $.ajax({
            url: 'http://157.230.17.132:4017/sales',
            method: 'POST',
            data: {"salesman": numeroVenditore, "amount": valoreInput, "date": dateEstrapolata},
            success: function(data) {
                trovaGrafico();
            }
        })

    });

    function ritornaNumero(valore) {
        if(isNaN(valore)) {
            return 0;
        } else {
            return valore;
        }
    };

    function trovaGrafico() {
        $.ajax({
            url: 'http://157.230.17.132:4017/sales',
            method: 'GET',
            success: function (dataVendite) {
                var vendite = dataVendite;

                var valoriLinea = {}; //CREIAMO IL GRAFICO SENZA VALORI, COSì DA POTERLO POPOLARE IN SEGUITO
                var valoriTorta = {}; //CREIAMO IL GRAFICO A TORTA

                var mesiAnno = moment.months();
                for (var i = 0; i < vendite.length; i++) {
                    var singolaVendita = vendite[i];
                    var dataVendita = singolaVendita.date;
                    var meseVendita = moment(dataVendita, "DD/MM/YYYY").get("M");
                    if(valoriLinea[meseVendita] === undefined) {
                        valoriLinea[meseVendita] = 0;
                    }
                    valoriLinea[meseVendita] += parseInt(singolaVendita.amount);

                    var venditore = singolaVendita.salesman;
                    if(valoriTorta[venditore] === undefined) {
                        valoriTorta[venditore] = 0;
                    }
                    valoriTorta[venditore] += parseInt(singolaVendita.amount);
                    //ABBIAMO DATO VALORI AI DUE GRAFICI SU VENDITORI, VENDITE E MESE
                }
                var labelsMesi = [];
                var dataVendite = [];

                for (var key in valoriLinea) {
                    labelsMesi.push(key);
                    dataVendite.push(valoriLinea[key]);
                }
                // console.log(valoriLinea);
                //ABBIAMO POPOLATO IL GRAFICO LINEARE, ORA CI RIMANE QUELLO A TORTA

                var labelsVenditore = [];
                var dataVenditeVenditore = [];

                for (var key in valoriTorta) {
                    labelsVenditore.push(key);
                    dataVenditeVenditore.push(valoriTorta[key]);
                }
                // console.log(valoriTorta);
                //ABBIAMO TROVATO L'AMMONTARE DELLE VENDITE PER OGNI SINGOLO VENDITORE
                //ORA CREIAMO I GRAFICI, COMINCIAMO CON QUELLO LINEARE

                var ctx = $('#vendite-lineare');
                var chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: mesiAnno,
                        datasets: [{
                            label: 'Fatturato Mensile',
                            backgroundColor: 'lightgreen',
                            borderColor: 'Green',
                            data: dataVendite
                        }]
                    },
                });

                //  ABBIAMO CREATO IL GRAFICO LINEARE, ORA PASSIAMO A QUELLO A TORTA
                // PER PRIMA COSA DOBBIAMO CREARE LA PERCENTUALE PER OGNI VENDITORE

                var totaleVendite = 0;
                for(var i = 0; i < dataVenditeVenditore.length; i++) {
                    totaleVendite = totaleVendite + dataVenditeVenditore[i];
                }
                // console.log(totaleVendite);
                for(var i = 0; i < dataVenditeVenditore.length; i++) {
                    dataVenditeVenditore[i] = ((dataVenditeVenditore[i] / totaleVendite) * 100).toFixed(2); //Facciamo la percentuale e arrotondiamo a 2 decimali
                    // console.log(dataVenditeVenditore);
                }

                var ctxTorta = $('#vendite-torta');
                var chartTorta = new Chart(ctxTorta, {
                    type: 'pie',
                    data: {
                        datasets: [{
                            data: dataVenditeVenditore,
                            backgroundColor: ['lightgreen', 'lightblue', 'lightyellow', 'grey']
                        }],
                        labels: labelsVenditore
                    },
                    options: {
                        responsive: true,
                        tooltips: {
                            callbacks: {
                                label: function(tooltipItem, data) {
                                    return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
                                }
                            }
                        }
                    }
                });
            },
        })
    };

});
