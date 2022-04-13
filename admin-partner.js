  console.warn("2022-04-13 0835");
  $(".loading").hide();
  $("div.content-block-platform.hide-when-loading > div:nth-child(1)").remove();

  if(getCookie("authvoucher")!=""){
    //partner should be logged in
    $(".login-container").hide();
    $(".form-check-validity-voucher,#nav").show();
    $(".user").text(getCookie("username"));
    //$(".shopname").text(getCookie("shopName"));
    var shopLogo = getCookie("shopLogo");
    $(".logo-partner-platform").attr('src',shopLogo);
  } else {
    $(".login-container").show();
    $(".form-check-validity-voucher,#nav").hide();
    window.location.href = 'https://bike.qoverme.com/login-partner';
  }


  var voucherparam = getParameterByName("voucher");
  var htmlVoucherSearchInput = '<div class="form-7" style="min-width: 80%;"><input type="text" id="voucher-code" name="voucher-code" value="'+voucherparam+'" placeholder="Voucher code" style="" class="text-field-11 w-input"><button class="second-action-platform-2-2 w-button" onclick="checkCode()">Submit</button></div>';
  var googleSheetUrl = "https://script.google.com/macros/s/AKfycbxqUEiWrq_FvaW14kUD5xpRGXPYyb1D9P0yYVf62J8A5cmC9Qb0BAsG1Vge05RwT-ww/exec";
  showGeneralInfo();

  function loginvoucherpartner(){
    $(".loading").show();
    var username = $("#username").val();
    var password = $("#password").val();
    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "username": username,
        "password": password,
        "action": "login"
      }),
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      var authorization = response.payload.authorization;
      var partnerName = response.payload.shop;
      var shopName = response.payload.shopName;
      if(response.payload.statuslogin == "connected"){
        setCookie("username", username, "7");
        setCookie("authvoucher", authorization, "7");
        setCookie("partnerName", partnerName, "7");
        setCookie("shopName", shopName, "7");
        location.reload();
      } else {
        alert("error login");
      }
      $(".loading").hide();
      $(".hide-when-loading").show();

    });


  }



  function checkCode(){
    $(".loading").show();
    $(".hide-when-loading").hide();
    var voucher = $("#voucher-code").val();
    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "voucher": voucher,
        "action": "check"
      }),
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      var value = response.payload.currency+" "+response.payload.leftValue;
      var expiryDate = new Date(response.payload.expiryDate);
      var expiryDate = expiryDate.toLocaleDateString("en-BE");
      var customer = response.payload.customer;
      var voucherValidFor = response.payload.voucherValidFor;
      /*WIP*/
      var newHtmlText = '<div class="platform-voucher-status-check-2"><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Value</div><div>'+value+'</div></div><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Expiry date</div><div class="platform-voucher-status-check-value">'+expiryDate+'</div></div><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Customer initiales</div><div class="platform-voucher-status-check-value">'+customer+'</div></div><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Reason</div><div class="platform-voucher-status-check-value">'+voucherValidFor+'e</div></div><div class="platform-voucher-status-check-col-2"><div class="platform-voucher-status-check-label">Voucher status</div><div class="platform-voucher-status-check-tag">'+response.payload.status+'</div></div></div>';
      var newHtmlForm = '<div class="form-use-voucher-2 w-form"><div id="" name="" data-name="" method="" class="form-9" aria-label=""><div class="div-block-40"><label for="valueToUse" class="field-label-3">Value of the voucher used for the bike</label><input type="number" id="valueToUse" name="valueToUse" class="text-field-3 w-input" maxlength="256" placeholder="1000 €"></div><div class="div-block-40"><label for="productPurchased" class="field-label-3">Description of the purchase</label><input type="text" id="productPurchased" name="productPurchased" class="w-input" maxlength="256" placeholder="Small description of the item purchased with the voucher" required=""></div><div class="div-block-40"><label for="invoice" class="field-label-3">Invoice number of the bike</label><input type="text" id="invoice" name="invoice" class="w-input" maxlength="256" placeholder="Example: EA23B456" required=""><input type="text" id="shop" name="shop" placeholder="Shop name" style="display:none" value="'+getCookie("username")+'"><br><input type="text" id="login" name="login" placeholder="Password" style="display:none" value="'+getCookie("authvoucher")+'"><br><input type="text" id="voucher-code-input"  style="display:none" value="'+voucher+'"></div><input  onclick="useCode()" type="submit" value="Submit" class="submit-button-6 w-button"></div></div>';
      //var text ="<div>Value: "+value+"<br>Expiry date: "+expiryDate+"<br>Voucher status:"+response.payload.status+"<br> Customer initiales: "+customer+"<br>Reason: "+voucherValidFor+"</div>";
      //var redeemtext = '<div style="margin-top:20px;" id="redeemform"><input type="number" id="valueToUse" name="valueToUse" placeholder="Value of the voucher used for the bike"><br><input type="text" id="productPurchased" name="productPurchased" placeholder="Description of the purchase"><br><input type="text" id="invoice" name="invoice" placeholder="Invoice number of the bike"><br><input type="text" id="shop" name="shop" placeholder="Shop name" style="display:none" value="'+getCookie("username")+'"><br><input type="text" id="login" name="login" placeholder="Password" style="display:none" value="'+getCookie("authvoucher")+'"><br><button onclick="useCode()">Redeem</button></div>';
      var htmlToShow = newHtmlText;
      if(response.payload.status == "Not used"){
      	htmlToShow = '<div class="voucher-redeem-container" style="display: flex;flex-direction: column;">'+htmlToShow+newHtmlForm+'</div>';
      } else {
        $("div.platform-voucher-status-check-tag").css("background-color","#fd5353");
      }
      $(".block-in-content-platform").html(htmlVoucherSearchInput+htmlToShow);
      $(".loading").hide();
      $(".hide-when-loading").show();
    });

  }


  function useCode(){
    $(".loading").show();
    $(".hide-when-loading").hide();
    $(".title-platform, .breadcrumb-here").text("Use a voucher");
    var voucher = $("#voucher-code-input").val();
    var shop = $("#shop").val();
    var login = $("#login").val();
    var value = $("#valueToUse").val();
    var productPurchased = $("#productPurchased").val();
    var invoice = $("#invoice").val();
    var username = getCookie("username");

    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "voucher": voucher,
        "value": value,
        "usedby": shop,
        "purchasedItem": productPurchased,
        "action":"usevoucher",
        "checker": login,
        "invoice": invoice,
        "username": username
      }),
    };

    $.ajax(settings).done(function (response) {
      $(".block-in-content-platform").html(JSON.stringify(response.payload));
      $(".loading").hide();
      $(".hide-when-loading").show();
    });

  }

  function findAllVouchers(){
    $(".loading").show();
    $(".hide-when-loading").hide();
    $(".title-platform, .breadcrumb-here").text("All vouchers");

    var username = getCookie("username");
    var authorization = getCookie("authvoucher");

    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "action":"findAllVouchers",
        "checker": authorization,
        "username": username
      }),
    };

    $.ajax(settings).done(function (response) {
      var data = response.payload;
      console.warn("data: ", data);
      if (data == "not authorized"){
        logout();
      } else {
        var allHTML = "<table><tr><th>Invoice #</th><th>Code</th><th>Amount</th><th>Date</th><th>Invoice status</th><th>Used by</th></tr>";

        for (var i = 1; i < data.length; i++) {
          console.log(data[i].code);
          var codeUsed = data[i].code;
          var codeUsed5Characters = "xxxx-xxxx-xxxx"+codeUsed.substr(codeUsed.length - 5);
          var dateNotFormatted = new Date(data[i].dateUsed);
          var dateFormatted = dateNotFormatted.toLocaleDateString("en-BE");
          var htmllinevoucher = '<tr class="voucher-line"><td>'+data[i].purchasedInvoice+'</td><td>'+codeUsed5Characters+'</td><td>'+data[i].currency+' '+data[i].valueUsed+'</td><td>'+dateFormatted+'</td><td>'+data[i].invoiceStatus+'</td><td>'+data[i].usedby+'</td></tr>';
          allHTML = allHTML+htmllinevoucher;
        }
        allHTML = allHTML+"</table>";
        $(".title-platform, .breadcrumb-here").text("Vouchers");
        $(".block-in-content-platform").html(allHTML);
        $(".loading").hide();
        $(".hide-when-loading").show();
        $(".form-check-validity-voucher").show();
        //$("#allvouchers").show();
      }
    });

  }

  /*function  showUseVoucher(){
    $(".form-check-validity-voucher").show();
    $("#allvouchers").hide();
  }*/
  function delete_cookie(name) {
      document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  function logout(){
    delete_cookie("authvoucher");
    delete_cookie("shopLogo");
    delete_cookie("shopName");
    delete_cookie("username");
    delete_cookie("partnerName");
    location.reload();
  }

function showUseVoucher(){
  $(".loading").show();
  $(".hide-when-loading").hide();

  $(".title-platform, .breadcrumb-here").text("Use a voucher");
  $(".block-in-content-platform").html(htmlVoucherSearchInput);
  document.getElementById("voucher-code").value = voucherparam;

  $(".hide-when-loading").show();
  $(".loading").hide();
}

function showGeneralInfo(){
  $(".loading").show();
  $(".hide-when-loading").hide();
  //$(".form-check-validity-voucher").hide();
  $(".title-platform, .breadcrumb-here").text("General information");
  var allHTML = '<div class="generalInfoContent"><h3>Welcome to our general info page</h3><p>In this admin you can redeem a voucher and see all vouchers used.</p>'+htmlVoucherSearchInput+'</div>';
  $(".block-in-content-platform").html(allHTML);
  $(".hide-when-loading").show();
  $(".loading").hide();
}

function showPOSRequest(){
  $(".loading").show();
  $(".hide-when-loading").hide();
  $(".title-platform, .breadcrumb-here").text("Request marketing material");
  var allHTML = '<div data-paperform-id="qover-me-pos-material-request"></div><script>(function() {var script = document.createElement("script"); script.src = "https://paperform.co/__embed.min.js"; document.body.appendChild(script); })()</script>';
  $(".block-in-content-platform").html(allHTML);
  $(".hide-when-loading").show();
  $(".loading").hide();
}

function showTraining() {
  $(".loading").show();
  $(".hide-when-loading").hide();
  $(".title-platform, .breadcrumb-here").text("Training");
  var allHTML = '<div id="tolstoy-container" style="line-height:0;overflow:hidden;height:100%;width:100%;text-align:center"><div class="blockvideo"><h4>Les arguments de vente</h4><iframe id="tolstoy" src="https://player.gotolstoy.com/0dhgsac8w95ew?host"style="width:100%;height:220px;max-width:270px"scrolling="no" frameborder="0" allow="autoplay *; clipboard-write *;camera *; microphone *; encrypted-media *; fullscreen *; display-capture *;"></iframe></div><div class="blockvideo"><h4>Les couvertures</h4><iframe id="tolstoy" src="https://player.gotolstoy.com/riwz73y1f1bdl?host"style="width:100%;height:220px;max-width:270px"scrolling="no" frameborder="0" allow="autoplay *; clipboard-write *;camera *; microphone *; encrypted-media *; fullscreen *; display-capture *;"></iframe></div><script src="https://widget.gotolstoy.com/script.js" defer></script></div>';
  $(".block-in-content-platform").html(allHTML);
  $(".hide-when-loading").show();
  $(".loading").hide();
}

function getStatFromInput(){
  var start = $("#start").val();
  var end  = $("#end").val();
  getstatistics(start,end);
}

function testStat(){
  getstatistics("2022-03-01","2022-03-31");
}
$('body').append('<button onclick="testStat();" class="btnPink">stat</button>');

function getstatistics(start,end){
    $(".loading").show();
    $(".hide-when-loading").hide();
    $(".title-platform, .breadcrumb-here").text("Sales dashboard");
    var allHTML = '<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>';
    $(".block-in-content-platform").html(allHTML);

    var username = getCookie("username");
    var authorization = getCookie("authvoucher");

    var settings = {
      "url": googleSheetUrl,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "text/plain;charset=utf-8"
      },
      "data": JSON.stringify({
        "action":"getStatistics",
        "checker": authorization,
        "username": username,
        "start": start,
        "end": end
      }),
    };

    $.ajax(settings).done(function (response) {
      var data = response.payload;
        //var datajson = JSON.parse(data);
        console.warn(data);
        console.log(data.kpi.kpis);
        console.log(data.kpi.kpis.EUR);
        console.log(data.graph.data.EUR);
        var graph = JSON.parse(data.graph.data.EUR);
        console.log(graph);
      if (data == "not authorized"){
        logout();
      } else {
        var css = '<style>.allKpis {border-radius: 5px;background-color: #f5f8fd;padding: 30px 25px;display: flex;}.reportingKpi>p {font-size: 50px;margin-top: 20px;}.reportingKpi {margin: 20px;width: 30%;} .btnPink {position: relative;z-index: 1;height: 40px;/* margin-top: 40px; */ padding: 10px 20px;    border-radius: 60px;    background-color: #eb4f87;    -webkit-transform: translate(0,0);    -ms-transform: translate(0,0);    transform: translate(0,0);    -webkit-transition: .2s;    transition: .2s;    font-family: Circularstd,sans-serif;    font-size: 12px;    color: white;font-weight: 700;width: 150px;}input#end, input#start {display: block;    width: 170px;    height: 38px;    padding: 8px 6px 8px 15px;    margin-bottom: 10px;    font-size: 14px;    color: #171C34;    vertical-align: middle;    background-color: #fff;    border: 1px solid #f8f8f8;}.formDateInput {display: inline-flex;border-radius: 5px;margin-bottom: 20px;padding: 20px;border: 1px solid #f5f8fd;}input#start,input#end {margin-right: 15px;}</style>';
        $('head').append(css);
        var ttlcommission = data.kpi.kpis.EUR.tot_commission;
        var allHTML = '<div class="allKpis"><div class="reportingKpi"><h5>New contracts</h5><p>'+data.kpi.kpis.EUR.nbr_create+'</p></div><div class="reportingKpi"><h5>Canceled contracts</h5><p>'+data.kpi.kpis.EUR.nbr_cancel+'</p></div><div class="reportingKpi"><h5>Total commission</h5><p>'+ttlcommission.toFixed(2)+'</p></div></div><div id="chart_div"></div>';
        $(".block-in-content-platform").html(allHTML);
        var dateInput = '<div class="formDateInput"><label for="start">Start date:</label><input type="date" id="start" value="2022-01-01" min="2020-01-01" max="2030-12-31"><label for="end">End date:</label><input type="date" id="end" value="2022-03-31" min="2020-01-01" max="2030-12-31"><br><br><button onclick="getStatFromInput();" class="btnPink">Search</button></div>';
        $(".block-in-content-platform").prepend(dateInput);
        window.bdxRows = JSON.parse(data.bdx.data.EUR);
        bdxRows = [["Reference","Variant","Type","Start","End","Promocode","Commission %","Net premium","Commission"]].concat(bdxRows)
        var csvDownloadHtml = '<button onclick="downloadCsv();" class="btnPink">Download CSV</button>';
        $(".block-in-content-platform").append(csvDownloadHtml);

        /*START GOOGLE*/
          google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawLogScales);

function drawLogScales() {
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'Date');
      data.addColumn('number', 'Contracts');
      data.addRows(graph);

      var options = {
        hAxis: {
          title: 'Date',
          logScale: true
        },
        vAxis: {
          title: 'Contracts',
          logScale: false
        },
        colors: ['#3c84dc']
      };

      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(data, options);
    }
        /*STOP GOOGLE*/
        $(".loading").hide();
        $(".hide-when-loading").show();
        $(".form-check-validity-voucher").show();
        //$("#allvouchers").show();
      }
    });

  }

//getstatistics("2022-01-01","2022-03-31");

function downloadCsv() {
  //const rows = JSON.parse(payload.payload.bdx.data.EUR);

  let csvContent = "data:text/csv;charset=utf-8,";

  bdxRows.forEach(function(rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".
}
/*


*/