console.warn("20230929 1627")
$( document ).ready(function() {
	var baseURL = "https://api.prd.qover.io/policies/v1/master-policies/"
  $("#carlist").fadeOut();

  var vars = getUrlVars();
 if(vars["admin"] == "qover" || getCookie("admin") == "qover"){
  document.cookie ="admin=qover"
  $("#addbutton").show();
  }else{
  $("#addbutton").hide();
  }

  function createCookie(fieldName){
		const d = new Date();
		let text = d.toUTCString();
 		document.cookie = fieldName + "=" + $("#"+fieldName).val() ;
		//console.log(fieldName + "=" + $("#"+fieldName).val());
 		if($("#"+fieldName).val() == ""){
 			//console.log(fieldName);
 			$("#"+fieldName).css("border-color","red");
 		}else{
  		$("#"+fieldName).css("border-color","#e2e6e9");
 		}
 		return $("#"+fieldName).val() ;
	}

  function refreshClaimAttest(){
    $("#ctaclaimsattest").attr("href","https://forms.qover.com/232641450200339?name="+getCookie("fleetName")+"&policy="+getCookie("contractref"))
  }

  if(getCookie("fleetId")){
  	getAll(100,1,getCookie("fleetId"), getCookie("apikey"));
    getPolicy(getCookie("fleetId"), getCookie("apikey"));
    $("#textdropdown").html(getCookie("fleetName"))
    $("#addcarfleetname").html(getCookie("fleetName"));
    $("#policynumber").html(getCookie("contractref"));
    refreshClaimAttest();
    //$("#ctaclaimsattest").attr("href","https://forms.qover.com/232641450200339?name="+getCookie("fleetName")+"&policy="+getCookie("contractref"))
  }
 
  $(document).on('click', '.fleetselect', function(){
		var apikey = $(this).attr("apikey");
    var fleetId = $(this).attr("fleetId");
    var fleetName = $(this).attr("fleetName");
    var contractref = $(this).attr("contractref");
    document.cookie = "apikey=" + apikey ;
    document.cookie = "fleetId=" + fleetId ;
    document.cookie = "fleetName=" + fleetName;
    document.cookie = "contractref=" + contractref;
  	$("#policynumber").html(contractref);
    $("#addcarfleetname").html(fleetName);
    $("#textdropdown").html(fleetName)
		getAll(100,1,fleetId, apikey);
    getPolicy(fleetId, apikey);
    refreshClaimAttest();
	});
  
  $("#make").change(function() {
    $("#model").html("");
  	$('#model').append("<option value='other'> Please Select a model </option>")
  	for (let i = 0; i < models[$(this).val()].length; i++) {
     	var html = '<option type="'+models[$(this).val()][i].type+'"  catalogue_value="'+models[$(this).val()][i].value+'" value="'+models[$(this).val()][i].name+'">'+models[$(this).val()][i].name+'</option>'
			$('#model').append(html)
    }
	});
  
   $("#model").change(function() {
    	var element = $(this).find('option:selected');
      //console.log(element.attr("type"));
      $("#type").find('option').attr("selected",false) ;
      
      
     	$('#type option[value="'+element.attr("type")+'"]').attr('selected', 'selected');
     	$("#value").val(element.attr("catalogue_value"));
   })
  
  $("#addbutton").click(function(){
   	$("#addform").show();
  })
   
  $(document).on('click', '#submit', function() {
  	event.preventDefault();
    var check = (/[0-9A-Z]{17}/.test($("#vin").val()))

    if(!check) 	$("#vin").css("border","2px solid red");
    
		$( "input[mandatory='true']" ).each(function( index ) {
  	   if($(this).val() == "") {
        	$(this).css("border","2px solid red");
          check = check && false
       }
		});
  
 	if(check){
     
 				var t =createCookie("make",true)+createCookie("model",true)+  createCookie("vin",true)+ createCookie("plate",true) + createCookie("value", true)+ createCookie("leaseplannumber",false)+createCookie("endDate",false);
 				createContract()
 		}else{
 				alert("please check form");
 		}
    
  });
  
$(document).on('click', '.actionmenu', function() {
		event.preventDefault();
		selected = $(this).attr("action");
		var cID = $(this).attr("vid")
		if(selected=="seeclaim")window.location.href = "/all-claims?contractID="+cID;
		if(selected=="details")window.location.href = "/view-car?carID="+cID;
		if(selected=="gc")getGC(cID);
  })
  
  $("#search").click(function(){
 				event.preventDefault();
				getAll(100,1,getCookie("fleetId"),getCookie("apikey"));
      }
   )
  
  
  function createCookie(fieldName,check){
		const d = new Date();
		let text = d.toUTCString();
 		document.cookie = fieldName + "=" + $("#"+fieldName).val() ;
		//console.log(fieldName + "=" + $("#"+fieldName).val());
 		
    if($("#"+fieldName).val() == "" && check){
 			//console.log(fieldName);
 			$("#"+fieldName).css("border-color","red");
 		}else{
  		$("#"+fieldName).css("border-color","#e2e6e9");
 		}
 		return $("#"+fieldName).val() ;
	}
  
  function getAll(perpage,pageIndex, fleetID, apikey){	
  
		pageIndex = pageIndex-1;
		var api_url = baseURL+fleetID+"/risk-items?pageSize="+perpage+"&order=desc&pageIndex="+pageIndex+"&apikey="+apikey
		$("#table").html("");
		var xhr = new XMLHttpRequest();
  	xhr.withCredentials = true;
  	xhr.addEventListener("readystatechange", function() {
    $("#carlist").fadeOut();
      
    if(this.status === 200 && this.readyState === 4 ) {
			var response = JSON.parse(this.response)
      $("#carlist").fadeIn();
     
			const uniqueIds = [];
			response.items.reverse();
      
       $("[aria-expanded]").attr("aria-expanded",false);
       
       $("#dropdownlist").removeClass("w--open");
       
			const unique = response.items.filter(element => {
  			const isDuplicate = uniqueIds.includes(element.id);		
     	 	if (!isDuplicate) {
    			uniqueIds.push(element.id);
    			return true;
  			}
  			return false;
			});
      
    	response.riskItems = unique;
      
      $("#numbercars").html(unique.length);
 
      var pages = response.total / response.pageSize +1
      $( ".page" ).each(function( index ) {
   			if( $( this ).text() > pages) {
   				$(this).hide();
  	 		}else{
        	$(this).show();
        }
			});
    	$("#table").html("");
      processVehicles(unique);
 		} 
  	});
  	xhr.open("GET", api_url);
  	xhr.setRequestHeader("apikey", apikey);
  	xhr.setRequestHeader("Content-Type", "application/json");
  	xhr.send();
	}
  window.vehicleIds = [];
  function processVehicles(vehicles){
    window.vehicleIds = [];
   	var allVehicles = vehicles
  	allVehicles.forEach(createVehicle)
    //console.log("vehicleIds", vehicleIds)
 	}
  
  function createVehicle(value, index, array) {
    //console.warn("what's in value");
    //console.log(value);
    
		var active = true
    if(value.termPeriod){
      if(value.termPeriod.endDate) {
        var  endDate = new Date(value.termPeriod.endDate)
        active = endDate > new Date();
      }
    } else {
     active = false;
    }
    var parking = true
    var status = ""
    if(active){
     	if(value.package.name == "STANDARD"){
				status = "Active"
				parking = false
       }else{ 
       	status = ""
      	parking = true
   		}
   	} else {
     	status = "Not active"
      parking = false
    }
    if(status == "Active"){
      window.vehicleIds.push(value.id);  
    }
    var fleetName = getCookie("fleetName");
    var contractref = getCookie("contractref");
    var actionmenu = '<div class="div-block-52 right"><a class="cta-small secondary small w-inline-block actionmenu" action="details" vid="'+value.id+'"><div class="font-awesome small btn"></div><div class="subheading smallbtn">Details</div></a><a class="cta-small secondary small w-inline-block actionmenu" action="gc" vid="'+value.id+'"><div class="font-awesome small btn"></div><div class="subheading smallbtn">Green card</div></a><a class="cta-small secondary small w-inline-block" target="_blank" href="https://forms.qover.com/232502256015040?name='+fleetName+'&policy='+contractref+'&plate='+ value.subject.vrn +'&vin='+ value.subject.vin +'"><div class="font-awesome small btn"></div><div class="subheading smallbtn">Defleet</div></a></div>'
    var htmlBloc = '<div class="table-line" carID="'+value.id+'"><div class="div-block-52"><div class="text-block-80">'+ value.subject.vrn +'</div><div class="text-block-80">'+ value.subject.vin +' </div></div><div class="div-block-52"><div class="text-block-80">'+value.subject.make+'</div><div class="text-block-80">'+ value.subject.model +'</div></div><div class="div-block-52"><div class="statusactive" style="background-color:'+(parking||status == "Not active"?"grey":"green")+'"><div class="text-block-80 status">'+status+'</div></div><div class="text-block-80">'+ (value.termPeriod?value.termPeriod.startDate:"N.A") + (endDate?" - "+value.termPeriod.endDate:"") +'</div></div>'
    htmlBloc += actionmenu
    if($("#searchbox").val() != "" ){
				if(value.subject.vrn.toLowerCase() == $("#searchbox").val().toLowerCase()) $("#table").prepend(htmlBloc)
    }else{
         $("#table").prepend(htmlBloc)
 		}
	}
  function getPolicy(fleetID, apikey){
    //console.log("get policy");
		var api_url = baseURL+fleetID+"?apikey="+apikey
		var xhr = new XMLHttpRequest();
  	xhr.withCredentials = true;
  	xhr.addEventListener("readystatechange", function() {
    if(this.status === 200 && this.readyState === 4 ) {
			var response = JSON.parse(this.response)
      $("#policystartdate").html(response.contractPeriod.startDate)
      $("#policyenddate").html(response.contractPeriod.endDate)
      $("#policyholder").html(response.policyholder.companyName+" "+response.policyholder.address.city);
 		} 
  	});
  	xhr.open("GET", api_url);
  	xhr.setRequestHeader("apikey", apikey);
  	xhr.setRequestHeader("Content-Type", "application/json");
  	xhr.send();
  }
  
  function createContract(){
  $("#submit").prop('disabled', true)
  	var data = {
    	"contractPeriod": {
       		"startDate" : $("#startdate").val()
       },
    	"country": "BE",
    	"package": { "name": "STANDARD"},
   		"subject":{
    	"vin": getCookie("vin"),
    	"vrn":  getCookie("plate"),
    	"make":  getCookie("make"),
   		"model":  getCookie("model"),
   		"ev": (getCookie("type")=="electric"),
    	"value": parseInt(getCookie("value"))
  		}
		}
    
    if(getCookie("leaseplannumber") && getCookie("leaseplannumber") != "") data.subject.leasePlanNumber = getCookie("leaseplannumber")
	  //DO NOT ALLOW TO SPECIFY END DATE
   // if(getCookie("endDate") && getCookie("endDate") != "") data.contractPeriod.endDate = getCookie("endDate")
  	var xhr = new XMLHttpRequest();
  	xhr.withCredentials = true;
  	xhr.addEventListener("readystatechange", function() {
      if(this.status === 201 && this.readyState === 4) {
        var response = JSON.parse(this.responseText)  
        $("#confirmationmessage").show();
        document.cookie ="contractID=" + response.contractId;
        $("#addform").hide();
          $("#submit").prop('disabled', false)
      } 
      if(this.status === 400) {
        var response = JSON.parse(this.responseText)
       
        $("#something").show();
      } 
  	});
  	var api_url = baseURL+getCookie("fleetId")+"/risk-items"
  	xhr.open("POST", api_url);
  	xhr.setRequestHeader("apikey", getCookie("apikey"));
  	xhr.setRequestHeader("Content-Type", "application/json");
  	xhr.send(JSON.stringify(data));
	}
})



var baseURL = "https://api.prd.qover.io/policies/v1/master-policies/"

/*$(document).on('click', '.actionmenu', function() {
    event.preventDefault();
     selected = $(this).attr("action");
     
  })
*/
function getGC(carID){
  var apikey = getCookie("apikey")
  var fleetID = getCookie("fleetId")
  var URL = baseURL+fleetID+"/risk-items/"+carID+'/green-card?apikey='+apikey;
  
    $.ajax({
      url: URL,
      type: 'get',
      dataType: 'json',
      success: function (data) {
       //console.log(data)
       var response = data
       try{
          window.open(response._links.pdf.href, '_blank');
          //console.log(response._links.pdf.href);
        } catch(e) {
          $("#greencard").html("<b> Green card could not be retrieved </b>")
        }
     }     
      
  });
}

$(document).on('click', '#allgreencards', function() {
    event.preventDefault();
    window.vehicleIds.forEach(function(carID) {
      getGC(carID);
    });
})
