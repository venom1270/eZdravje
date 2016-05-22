
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


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

    // TODO: Potrebno implementirati
  
    var sessionId = getSessionId();

    var ime, priimek, datumRojstva;

    if (stPacienta === 1) {
        ime = "Zdenka";
    	priimek = "Folkertofelj";
    	datumRojstva = "1950-01-01T00:01";
    } else if (stPacienta === 2) {
        ime = "Fata";
    	priimek = "Čistić";
    	datumRojstva = "1977-01-01T00:01";
    } else if (stPacienta === 3) {
        ime = "Saško";
    	priimek = "Modersdorfer";
    	datumRojstva = "1991-01-01T00:01";
    }
	

	$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	$.ajax({
	    url: baseUrl + "/ehr",
	    type: 'POST',
	    success: function (data) {
	        var ehrId = data.ehrId;
	        var partyData = {
	            firstNames: ime,
	            lastNames: priimek,
	            dateOfBirth: datumRojstva,
	            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
	        };
	        $.ajax({
	            url: baseUrl + "/demographics/party",
	            type: 'POST',
	            contentType: 'application/json',
	            data: JSON.stringify(partyData),
	            success: function (party) {
	                alert(ehrId);
	            },
	            error: function(err) {
	                alert("Napaka: " + JSON.parse(err.responseText).userMessage);
	            }
	        });
	    }
	});
	

    return ehrId;
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
