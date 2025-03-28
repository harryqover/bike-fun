console.log("hello bmwmini, this will work! v2");
/*
$('#employeeEmail').val("employee@dealer.com")
$('#vehicleModel').val("your model")
$('#deliveryDate').val("yyyy-mm-dd")
$('#customerName').val("customer name")
$('#customerEmail').val("customer@domain.com")
*/

// VEHICLE MODEL DATA
const modelData = [
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 M60 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 EDRIVE40 M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 EDRIVE40 M SPORT PRO 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 EDRIVE40 SPORT EDITION 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 EDRIVE40 SPORT EDITION 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 EDRIVE40 M SPORT PRO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 EDRIVE40 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I5",
      "modelExt": "I5 M60 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I7",
      "modelExt": "I7 XDRIVE60 M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I7",
      "modelExt": "I7 XDRIVE60 EXCELLENCE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I7",
      "modelExt": "I7 EDRIVE50 EXCELLENCE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I7",
      "modelExt": "I7 EDRIVE50 M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I7",
      "modelExt": "I7 M70 XDRIVE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I4",
      "modelExt": "I4 EDRIVE40 SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I4",
      "modelExt": "I4 EDRIVE40 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I4",
      "modelExt": "I4 M50 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I4",
      "modelExt": "I4 EDRIVE35 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "I4",
      "modelExt": "I4 EDRIVE35 SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX",
      "modelExt": "IX XDRIVE50 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX",
      "modelExt": "IX XDRIVE40 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX",
      "modelExt": "IX XDRIVE40 SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX",
      "modelExt": "IX M60 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX1",
      "modelExt": "IX1 XDRIVE30 XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX1",
      "modelExt": "IX1 XDRIVE30 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX1",
      "modelExt": "IX1 EDRIVE20 SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX1",
      "modelExt": "IX1 EDRIVE20 XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX1",
      "modelExt": "IX1 EDRIVE20 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX2",
      "modelExt": "IX2 XDRIVE30 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX2",
      "modelExt": "IX2 EDRIVE20 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "IX3",
      "modelExt": "IX3 80 KWH M SPORT PRO 5DR 2024MY"
  },
  {
      "make": "BMW",
      "model": "IX3",
      "modelExt": "IX3 80 KWH M SPORT 5DR 2024MY"
  },
  {
      "make": "BMW",
      "model": "1 SERIES",
      "modelExt": "118I SPORT DCT (h-back)"
  },
  {
      "make": "BMW",
      "model": "1 SERIES",
      "modelExt": "118I SPORT (h-back)"
  },
  {
      "make": "BMW",
      "model": "1 SERIES",
      "modelExt": "1 SERIES M135 XDRIVE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "1 SERIES",
      "modelExt": "1 SERIES 120 SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "1 SERIES",
      "modelExt": "1 SERIES 120 M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "1 SERIES",
      "modelExt": "1 SERIES 123 M SPORT XDRIVE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "218I M SPORT (saloon)"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "2 SERIES M235 XDRIVE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "218I M SPORT DCT (saloon)"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "220I M SPORT DCT (saloon)"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "2 SERIES 220I M SPORT 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "2 SERIES M240I XDRIVE 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "2 SERIES 230I M SPORT 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "2 SERIES M2 COUPE 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "2 SERIES M2 COUPE AUTO 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES",
      "modelExt": "2 SERIES 220 M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 220I SPORT AUTO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 220I M SPORT AUTO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 220I LUXURY AUTO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 223I SPORT AUTO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 223I M SPORT AUTO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 223I LUXURY AUTO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 225E XDRIVE SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 230E XDRIVE M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 225E XDRIVE M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 230E XDRIVE LUXURY 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "2 SERIES ACTIVE TOURER",
      "modelExt": "2 SERIES ACTIVE TOURER 225E XDRIVE LUXURY 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES 320I M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES 330E SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES 330E M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES M340I 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES 320I M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES M340I 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES 330E SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES 330E M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES M3 COMPETITION M XDRIVE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES 320I SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES 320I SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "3 SERIES",
      "modelExt": "3 SERIES M3 COMPETITION M XDRIVE TOURING 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES 420I M SPORT AUTO 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES 420I M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES M440I XDRIVE (MHT) AUTO 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES 420I M SPORT AUTO 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES M440I XDRIVE (MHT) AUTO 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES M4 COMPETITION M XDRIVE COUPE AUTO 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES M4 COMPETITION M XDRIVE CONVERTIBLE AUTO 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES M440I XDRIVE (MHT) 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "4 SERIES",
      "modelExt": "4 SERIES 420I M SPORT AUTO (25%VRT) 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 530E M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 520I M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 550E XDRIVE M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 530E M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 520I M SPORT PRO 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 550E XDRIVE M SPORT PRO 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 530E M SPORT PRO 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "520I MHEV M SPORT PRO 20% AUTO (saloon)"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 530E M SPORT PRO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES M5 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES M5 TOURING 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 550E XDRIVE M SPORT PRO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 520I M SPORT PRO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 550E XDRIVE M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "5 SERIES",
      "modelExt": "5 SERIES 520I M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "7 SERIES",
      "modelExt": "7 SERIES 750E XDRIVE M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "7 SERIES",
      "modelExt": "7 SERIES M760E XDRIVE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "7 SERIES",
      "modelExt": "7 SERIES 750E XDRIVE EXCELLENCE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES M850I XDRIVE COUPE 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES M850I XDRIVE CONVERTIBLE 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES 840I M SPORT COUPE 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES 840I M SPORT CONVERTIBLE 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES 840I M SPORT 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES M850I XDRIVE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES M8 COUPE COMPETITION 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES M8 CONVERTIBLE COMPETITION 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "8 SERIES",
      "modelExt": "8 SERIES M8 COMPETITION GRAN COUPE 4DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 SDRIVE18D XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 SDRIVE18D M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE23I XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE23D XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE23I M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE23D M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE25E SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE30E XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 SDRIVE20I SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE25E M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE30E M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 SDRIVE20I XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 SDRIVE20I M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 XDRIVE25E XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 SDRIVE18D SPORT 19.5% 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X1",
      "modelExt": "X1 M35I 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X2",
      "modelExt": "X2 M35I XDRIVE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X2",
      "modelExt": "X2 SDRIVE20I M SPORT AUTO 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X3",
      "modelExt": "X3 20D XDRIVE M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X3",
      "modelExt": "X3 20D XDRIVE XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X3",
      "modelExt": "X3 20 XDRIVE XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X3",
      "modelExt": "X3 20 XDRIVE M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X3",
      "modelExt": "X3 M50 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X3",
      "modelExt": "X3 30E XDRIVE XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X3",
      "modelExt": "X3 30E XDRIVE M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X4",
      "modelExt": "XDRIVE30D M SPORT AUTO (sprt utl veh)"
  },
  {
      "make": "BMW",
      "model": "X4",
      "modelExt": "X4 M40I 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X4",
      "modelExt": "X4 XDRIVE20D M SPORT TU (MHT) 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X4",
      "modelExt": "M40D AUTO (sprt utl veh)"
  },
  {
      "make": "BMW",
      "model": "X4",
      "modelExt": "X4 M COMPETITION 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X5",
      "modelExt": "X5 XDRIVE30D XLINE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X5",
      "modelExt": "X5 XDRIVE30D M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X5",
      "modelExt": "X5 M COMPETITION 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X5",
      "modelExt": "X5 XDRIVE50E M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X5",
      "modelExt": "X5 M60I 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X5",
      "modelExt": "X5 XDRIVE40D M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X6",
      "modelExt": "X6 XDRIVE30D M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X6",
      "modelExt": "X6 M COMPETITION 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X6",
      "modelExt": "X6 M60I XDRIVE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X6",
      "modelExt": "X6 XDRIVE40I M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X6",
      "modelExt": "X6 XDRIVE40D M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X7",
      "modelExt": "X7 XDRIVEM60I 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X7",
      "modelExt": "X7 XDRIVE40D M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X7",
      "modelExt": "X7 XDRIVE40D EXCELLENCE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X7",
      "modelExt": "X7 XDRIVE40I EXCELLENCE 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "X7",
      "modelExt": "X7 XDRIVE40I M SPORT 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "XM",
      "modelExt": "XM XM 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "XM",
      "modelExt": "XM XM LABEL 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "XM",
      "modelExt": "XM 50E 5DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "Z4",
      "modelExt": "Z4 SDRIVE20I M SPORT 2DR 2025MY"
  },
  {
      "make": "BMW",
      "model": "Z4",
      "modelExt": "Z4 M40I 2DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "ACEMAN",
      "modelExt": "ACEMAN SPORT SE 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "ACEMAN",
      "modelExt": "ACEMAN SPORT E 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "ACEMAN",
      "modelExt": "ACEMAN EXCLUSIVE SE 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "ACEMAN",
      "modelExt": "ACEMAN EXCLUSIVE E 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "ACEMAN",
      "modelExt": "ACEMAN CLASSIC SE 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "ACEMAN",
      "modelExt": "ACEMAN CLASSIC E 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "ACEMAN",
      "modelExt": "ACEMAN JCW 5DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER CLASSIC S AUTO 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER CLASSIC C AUTO 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER CLASSIC C AUTO 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER CLASSIC S AUTO 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER SPORT S AUTO 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER SPORT S AUTO 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER SPORT C AUTO 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER EXCLUSIVE S AUTO 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER EXCLUSIVE C AUTO 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER EXCLUSIVE C AUTO 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER EXCLUSIVE S AUTO 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER SPORT C AUTO 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER CLASSIC E 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER CLASSIC SE 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER SPORT SE 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER SPORT E 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER EXCLUSIVE E 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER EXCLUSIVE SE 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER SPORT S AUTO 2DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER SPORT AUTO 2DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER EXCLUSIVE AUTO 2DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER EXCLUSIVE S AUTO 2DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER CLASSIC AUTO 2DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER CLASSIC S AUTO 2DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER JCW 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER JCW AUTO 3DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COOPER",
      "modelExt": "COOPER JCW AUTO 2DR 2025MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN JOHN COOPER WORKS 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER CLASSIC C 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER SPORT C 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER EXCLUSIVE C 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER CLASSIC S 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER CLASSIC E 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER CLASSIC SE 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER EXCLUSIVE S 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER EXCLUSIVE E 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER EXCLUSIVE SE 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER SPORT S 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER SPORT E 5DR 2024MY"
  },
  {
      "make": "MINI",
      "model": "COUNTRYMAN",
      "modelExt": "COUNTRYMAN COOPER SPORT SE 5DR 2024MY"
  }
];

const makeSelect = document.getElementById('vehicleMake');
const modelSelect = document.getElementById('vehicleModel');
const extendedModelSelect = document.getElementById('extendedVehicleModel');

// Get unique models for the selected make
function updateModelOptions(selectedMake) {
  // Clear model and extended model dropdowns
  modelSelect.innerHTML = '<option value="" disabled selected>Select a model</option>';
  extendedModelSelect.innerHTML = '<option value="" disabled selected>Select extended model</option>';

  const models = [...new Set(
    modelData
      .filter(entry => entry.make === selectedMake)
      .map(entry => entry.model)
  )];

  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
}

// Get extended models for the selected model and make
function updateExtendedModelOptions(selectedMake, selectedModel) {
  extendedModelSelect.innerHTML = '<option value="" disabled selected>Select extended model</option>';

  const filteredModels = modelData.filter(entry =>
    entry.make === selectedMake && entry.model === selectedModel
  );

  filteredModels.forEach(entry => {
    const option = document.createElement('option');
    option.value = entry.modelExt;
    option.textContent = entry.modelExt;
    extendedModelSelect.appendChild(option);
  });
}

// Event listeners
makeSelect.addEventListener('change', function () {
  const selectedMake = this.value;
  updateModelOptions(selectedMake);
  // Update background image based on make
  const bmwCell = document.querySelector('.bmw-cell');
  const logoPortal = document.querySelector('.logo-portal');
  if (bmwCell) {
    if (selectedMake === 'MINI') {
      bmwCell.style.backgroundImage = "url('https://cdn.prod.website-files.com/67bed75c989652e2907f8d69/67bee0440dae19a9e5fbb622_header-mini2.jpg')";
      logoPortal.src = "https://cdn.prod.website-files.com/67bed75c989652e2907f8d69/67e55f1df764a89af1dc9814_logo-mini-carinsurance_white.svg";
    } else if (selectedMake === 'BMW') {
      bmwCell.style.backgroundImage = "url('https://cdn.prod.website-files.com/67613d17f20b95f5fef06083/679b577e764a24c427aa30af_hero-bmw8.webp')";
      logoPortal.src = "https://cdn.prod.website-files.com/67613d17f20b95f5fef06083/67e5613c22c230fb8fdacdcc_logo-bmw-carinsurance.svg";
    } else {
      bmwCell.style.backgroundImage = '';
    }
  }
});

modelSelect.addEventListener('change', function () {
  const selectedModel = this.value;
  const selectedMake = makeSelect.value;
  updateExtendedModelOptions(selectedMake, selectedModel);
});

// Initial population if needed
document.addEventListener('DOMContentLoaded', function () {
  if (makeSelect.value) {
    updateModelOptions(makeSelect.value);
  }
});


// FORM SUBMISSION
document.getElementById('insuranceForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission
    $("#loadingOverlay").show(500);

    // Extract form data
    const employeeEmail = document.getElementById('employeeEmail').value;
    const vehicleMake = document.getElementById('vehicleMake').value;
    const vehicleModel = document.getElementById('vehicleModel').value;
    const extendedVehicleModel = document.getElementById('extendedVehicleModel').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const dealership = document.getElementById('dealership').value;

    // Prepare data for API request
    const requestData = {
      subject: {
        make: vehicleMake,
        model: vehicleModel,
        modelVersion: extendedVehicleModel,
        vehiclePurchaseDate: deliveryDate
      },
      policyholder: {
        entityType: "ENTITY_TYPE_PERSON",
        email: customerEmail,
        firstName: customerName,
      },
      productConfigurationId: "bmwmini",
      country: "IE",
      language: "en",
      contractPeriod: {
        timeZone: "Europe/Dublin",
        startDate: new Date(deliveryDate).toISOString().split('T')[0] // Current date in YYYY-MM-DD format
      },
      metadata: {
        stepHistory: "dealer-portal",
        referrer: employeeEmail,
        pos: dealership,
        lastStepAt: Date.now().toString(),
        lastStepUrl: "https://appqoverme-ui.sbx.qover.io/bmm/risk?appId=m1yf5oeskryvn0cs89je3f8i",
        documentsSentByMailConsented: "true",
        termsAndConditionsConsented: "true",
        requestPaperCopy: "false"
      },
      appId: "m1yf5oeskryvn0cs89je3f8i"
    };

    var settings = {
      url: "https://script.google.com/macros/s/AKfycbxzMsR5FrB4fouWlxZiHDjX5h6cXoXGQs7y3QElScz6PPm0ewkhymQ4P61Nm9QJwB2QDw/exec",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      data: JSON.stringify({
        payload: requestData,
        action: "createQuote"
      })
    };
    
    $.ajax(settings).done(function(response) {
      console.log("draft created");
      console.log(response);
      console.log(response.payload.id);
      $("#loadingOverlay").hide(500);
      $("#message").html('<p class="success">Quote created successfully!</p><pre>' + JSON.stringify(response.payload.id, null, 2) + "</pre>");

    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Error:", textStatus, errorThrown);
      $("#loadingOverlay").hide(500);
      $("#message").html('<p class="error">An error occurred while creating the quote.</p><pre>' + JSON.stringify(response, null, 2) + '</pre>');
    });
});
