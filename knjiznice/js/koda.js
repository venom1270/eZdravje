
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

///PODATKI IZ TUKAJ: http://apps.who.int/gho/data/node.main.688?lang=en

/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
    var ehrId = "";

    // TODO: Potrebno implementirati !!!!! DODAJ ŠE INIT VITALNE ZNAKE
  
    var sessionId = getSessionId();

    var ime, priimek, datumRojstva, drzava;
    var datumInUra;
	var telesnaVisina;
	var telesnaTeza ;
	var telesnaTemperatura;
	var sistolicniKrvniTlak; //110-140
	var diastolicniKrvniTlak; //60-90
	var nasicenostKrviSKisikom;
    var merilec = "Dohtar Žiga"

    if (stPacienta === 1) {
        ime = "Zdenka";
    	priimek = "Folkertofelj";
    	datumRojstva = "1950-01-01T00:01";
    	drzava = "Slovenia";
    	datumInUra = new Date().toISOString();
	    telesnaVisina = 160;
	    telesnaTeza = 100;
	    telesnaTemperatura = 33;
	    sistolicniKrvniTlak = 90;
	    diastolicniKrvniTlak = 50;
	    nasicenostKrviSKisikom = 92;
    } else if (stPacienta === 2) {
        ime = "Fata";
    	priimek = "Čistić";
    	datumRojstva = "1977-01-01T00:01";
    	drzava = "Croatia";
    	datumInUra = new Date().toISOString();
	    telesnaVisina = 170;
	    telesnaTeza = 70;
	    telesnaTemperatura = 36;
	    sistolicniKrvniTlak = 110;
	    diastolicniKrvniTlak = 100;
	    nasicenostKrviSKisikom = 95;
    } else if (stPacienta === 3) {
        ime = "Miha";
    	priimek = "Novak";
    	datumRojstva = "1991-01-01T00:01";
    	drzava = "Slovenia";
    	datumInUra = new Date().toISOString();
	    telesnaVisina = 190;
	    telesnaTeza = 80;
	    telesnaTemperatura = 36.5;
	    sistolicniKrvniTlak = 130;
	    diastolicniKrvniTlak = 80;
	    nasicenostKrviSKisikom = 99;
    }
	

	$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	$.ajax({
	    url: baseUrl + "/ehr",
	    type: 'POST',
	    success: function (data) {
	            ehrId = data.ehrId;
	        var partyData = {
	            firstNames: ime,
	            lastNames: priimek,
	            dateOfBirth: datumRojstva,
	            address: {
	                address: drzava
	            },
	            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
	        };
	        $.ajax({
	            url: baseUrl + "/demographics/party",
	            type: 'POST',
	            contentType: 'application/json',
	            data: JSON.stringify(partyData),
	            success: function (party) {
	                $("#ehrIdPacienta").append('<option value="'+ehrId+'">'+ime+' '+priimek+'</option>');
	                //$("#aplikacija").h(ehrId+"<br/>");
	                
	                //dodaj se eno kompozicjo vitalnih znakov
	                $.ajaxSetup({
                	    headers: {"Ehr-Session": sessionId}
                	});
                	var podatki = {
                		// Struktura predloge je na voljo na naslednjem spletnem naslovu:
                        // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
                	    "ctx/language": "en",
                	    "ctx/territory": "SI",
                	    "ctx/time": datumInUra,
                	    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
                	    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
                	   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
                	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
                	    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
                	    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
                	    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
                	};
                	var parametriZahteve = {
                	    ehrId: ehrId,
                	    templateId: 'Vital Signs',
                	    format: 'FLAT',
                	    committer: merilec
                	};
                	$.ajax({
                	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
                	    type: 'POST',
                	    contentType: 'application/json',
                	    data: JSON.stringify(podatki),
                	    success: function (res) {
                	        //alert("COMP OK");
                	        
                	    },
                	    error: function(err) {
                	    	//alert("COMP ERR");
                	    	console.log(err);
                	    }
                	});
	                
	            },
	            error: function(err) {
	                alert("Napaka: " + JSON.parse(err.responseText).userMessage);
	            }
	        });
	        return ehrId;
	    }
	    
	});
	


	
	
	
	
}
	

    


function generiranjePodatkov() {
    //alert("Generiram...");
    $("#ehrIdPacienta").html('<option value="">Izberi pacienta</option>');
    generirajPodatke(1);
    generirajPodatke(2);
    generirajPodatke(3);
    tocke = 0;
}

var tocke; //tocke za izracun zivljenjske dobe

var drzavaPacienta;
var ime;
var priimek;
var starost;
var datumInUra;
var telesnaVisina;
var telesnaTeza;
var telesnaTemperatura;
var sistolicniKrvniTlak; //110-140
var diastolicniKrvniTlak; //60-90
var nasicenostKrviSKisikom;
var napovedanaZivDoba;
var povpZivDobaVDrzavi;

var znackaOK = '   <span class="label label-success">OK</span>';
var znackaSlabo = '   <span class="label label-danger">Nevarno</span>';
var znackaPazi = '   <span class="label label-warning">Pazi</span>';

function beriPacientaRocno() {
    var ehrId = $("#rocniEhdId").val();
    if (ehrId.length < 10) {
        alert("Vnesi veljaven EhrID!");
    } else {
        beriPacienta(ehrId);
    }
    
}

function beriPacientaSeznam() {
    
    var ehrId = $("#ehrIdPacienta").val();
    if (ehrId.length < 5 || ehrId === "Izberi pacienta") {
        
    } else {
        beriPacienta(ehrId);
    }
    
  
}
    


function beriPacienta(ehrId) {
    $(".panel").removeClass("hidden");
    tocke = 0;
    var sessionId = getSessionId();
    $.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
    var searchData = [
        {key: "ehrId", value: ehrId}
    ];
    $.ajax({
        url: baseUrl + "/demographics/party/query",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(searchData),
        success: function (res) {
            //alert("OK");
            for (i in res.parties) {
                
                var party = res.parties[i];
                //console.log(party);
                //$("#aplikacija").append(party.firstNames + ' ' + party.lastNames + '<br/>' + party.address.address + '<br/>');
                var dr = party.dateOfBirth;
                dr = dr.substring(0,4);
                var letnica = parseInt(dr);
                starost = 2016 - letnica;
                drzavaPacienta = party.address.address;
                ime = party.firstNames + " " + party.lastNames;
                $("#spanIme").html(ime);
                $("#spanStarost").html(starost);
                $("#spanDrzava").html(drzavaPacienta);
                
                $('#collapsePrimerjava input[type=checkbox]').each(function () {
                    var val = $(this).attr("value");
                    console.log(val + " --- " + drzavaPacienta + " | ");
                    if( val == drzavaPacienta ) {
                        $(this).prop("checked", true);
                    } else {
                        $(this).prop("checked", false);
                    }   
                });
                
            }
        },
        error: function (err) {
            alert("Napaka");
        }
    });
    
    
    
    
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "height",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            telesnaVisina = res[0].height;
            $("#spanCasZajema").html(res[0].time);
            $("#spanVisina").html(res[0].height + res[0].unit);
        },
        error: function(err) {
    
        }
    });
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "weight",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            telesnaTeza = res[0].weight;
            $("#spanTeza").html(res[0].weight + res[0].unit);
            //TODO: body index
            if (telesnaTeza >= 100 || telesnaTeza < 50) {
                $("#spanTeza").append(znackaPazi);
                tocke += 0;
            } else {
                $("#spanTeza").append(znackaOK);
                tocke += 2;
            }
        },
        error: function(err) {
    
        }
    });
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "body_temperature",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            telesnaTemperatura = res[0].temperature;
            $("#spanTemperatura").html(res[0].temperature + res[0].unit);
            if (telesnaTemperatura > 39 || telesnaTemperatura < 30) {
                $("#spanTemperatura").append(znackaSlabo);
                tocke += -4;
            } else if (telesnaTemperatura > 37 || telesnaTemperatura < 34) {
                $("#spanTemperatura").append(znackaPazi);
                tocke += -2;
            } else {
                $("#spanTemperatura").append(znackaOK);
                tocke += 2;
            }
        },
        error: function(err) {
    
        }
    });
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            sistolicniKrvniTlak = res[0].systolic;
            diastolicniKrvniTlak = res[0].diastolic;
            $("#spanSisKT").html(res[0].systolic + res[0].unit);
            if (sistolicniKrvniTlak > 150 || sistolicniKrvniTlak < 100) {
                $("#spanSisKT").append(znackaSlabo);
                tocke += -5;
            } else if (sistolicniKrvniTlak > 140 || sistolicniKrvniTlak < 90) {
                 $("#spanSisKT").append(znackaPazi);
                 tocke += -3;
            } else {
                $("#spanSisKT").append(znackaOK);
                tocke += 2;
            }
            $("#spanDiaKT").html(res[0].diastolic + res[0].unit);
            if (diastolicniKrvniTlak > 100 || diastolicniKrvniTlak < 50) {
                $("#spanDiaKT").append(znackaSlabo);
                tocke += -5;
            } else if (diastolicniKrvniTlak > 90 || diastolicniKrvniTlak < 60) {
                 $("#spanDiaKT").append(znackaPazi);
                 tocke += -3;
            } else {
                $("#spanDiaKT").append(znackaOK);
                tocke += 2;
            }
        },
        error: function(err) {
    
        }
    });
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "spO2",
        type: 'GET',
        headers: {"Ehr-Session": sessionId},
        success: function (res) {
            nasicenostKrviSKisikom = res[0].spO2;
            $("#spanNasicenost").html(res[0].spO2 + " %");
            if (nasicenostKrviSKisikom < 85) {
                $("#spanNasicenost").append(znackaSlabo);
                tocke += -5;
            } else if (nasicenostKrviSKisikom < 92) {
                $("#spanNasicenost").append(znackaPazi);
                tocke += -3;
            } else {
                $("#spanNasicenost").append(znackaOK);
                tocke += 1;
            }
        },
        error: function(err) {
    
        }
    });
    
    setTimeout(function() { preberiXML(); }, 500);
    
    
}

function preberiXML() {
    
    $.ajax({
    type: "GET",
    url: "/data.xml",
    dataType: "xml",
    success: function (xml) {
        //console.log(xml);
        //alert("OK");
        var xmlDoc = $.parseXML(xml),
            $xml = $(xmlDoc);
        var star = 0;
        var i = 0;
        $(xml).find("Fact").each(function () {
            if ($(this).find("COUNTRY").text() === drzavaPacienta) {
                var x = Number($(this).find("Display").text());
                star += x;
                i++;
            }
        });
        setTimeout(function() {
            star = Math.round(star/i);
            var x = star - parseFloat($("#spanStarost").text());
            console.log(x);
            x += tocke;
            if (x < 1) {
                x = "nekaj mesecev ";
                x += znackaSlabo;
            } else if (x < 4) {
                x = "nekaj let ";
                x += znackaPazi;
            } else {
                x += " let " + znackaOK;
            }
            var doLeta = star+tocke;
            $("#spanZivDoba").html(doLeta + " - Še " + x);
            console.log(star);
            napovedanaZivDoba = doLeta;
        }, 500)
        
    },
    error: function (err) {
        console.log(err);
    }
    
});

}

var zeNarisan = false;

function narisiGraf() {
    
    if (zeNarisan) {
        $("#btnNarisiGraf").removeAttr("data-toggle");
    } else {
        zeNarisan = true;
    }
    
    var margin = {top: 20, right: 20, bottom: 225, left: 20},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
    
    var y = d3.scale.linear().range([height, 0]);
    
    y.domain([100,50])
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(100);
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);
    
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        var tooltip;
        if (d.Country === "PACIENT") return "<strong>"+ime+"</strong><br/><strong>Napovedana doba:</strong> <span style='color:green'>" + d.Both_sexes+ "</span>";
        tooltip = "<strong>Moški:</strong> <span style='color:green'>" + d.Male+ "</span><br/>";
        tooltip += "<strong>Ženske:</strong> <span style='color:green'>" + d.Female+ "</span><br/>";
        tooltip += "<strong>Povprečno:</strong> <span style='color:green'>" + d.Both_sexes+ "</span>"
        return  tooltip;
      });
    
    
    $("#divGraf").html("");
    var svg = d3.select("#divGraf").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
    svg.call(tip);
    d3.csv("data.csv", function(error, data) {
    
        
        
        var drzave = [];
        $('input[type="checkbox"]:checked').each(function() { 
            drzave.push($(this).val());
        });
        
        oldData = data;
        data = [];
        //data = data.splice(0,5);
        var i, j;
        for (i = 0; i < oldData.length; i++) {
            for (j = 0; j < drzave.length; j++) {
                if (drzave[j] === oldData[i].Country) {
                    data.push(oldData[i]);
                    break;
                }
            }
        }
        
        //console.log(data);
        
        var vkljuci = $("#checkVkljuciPacienta").is(':checked');
         if (napovedanaZivDoba && vkljuci) {
            data.push({"Country": "PACIENT", "Both_sexes": napovedanaZivDoba});
        }
      x.domain(data.map(function(d) { return d.Country; }));
      y.domain([d3.min(data, function(d) { return d.Both_sexes; })-10, d3.max(data, function(d) { return d.Both_sexes; })]);
    
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .selectAll("text")
          .style("font-size","18px")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );
    
    
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .attr("dx", "10px")
          //.attr("class", "yAxisTickText")
        .append("text")
          .attr("transform", "rotate(0)")
          .attr("y", 6)
          .attr("dy", "-10px")
          .attr("dx", "40px")
          .style("font-size","18px")
          .style("text-anchor", "end")
          .text("Leta");
        
    console.log(svg);
        
    
      svg.selectAll("bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "graphBar")
          .style("fill", "#EEDC82")
          .attr("x", function(d) { return x(d.Country); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.Both_sexes); })
          .attr("height", function(d) { return height - y(d.Both_sexes); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);
          d3.select("#divGraf").attr("align","center");
        
      //$("svg").css({top: 200, left: 200, position:'relative'});
    
    });
    
    
}

$(document).ready(function () {
    d3.csv("data.csv", function(error, data) {
        var i;
        for (i = 0; i < data.length; i++) {
            
            $("#collapsePrimerjava").append('<div class="checkbox col-lg-3 col-md-3"><label><input type="checkbox" value="'+data[i].Country+'">'+data[i].Country+'</label></div>');
        } 
        
        

        
    });
});

