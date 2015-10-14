Grain = 
  id: "grain"
  pic: "assets/images/bale.jpg"
  promoHeader: "Grain and Alfalfa"
  exposition: "Our flagship company, Harbor Green Grain, is California's largest exporter of grains for husbandry"
  siteLink: "http://harborgreengrain.com"
  address: "2100 S Alameda St, Rancho Dominguez CA 90220"
  contacts: ["grain-1"]
  pics: [
    "assets/images/bale.jpg",
    "assets/images/front1.jpg",
    "assets/images/grass.jpg",
    "assets/images/gox.JPG",
    "assets/images/office4.jpg"
  ]
Gateway =
  id: "transload"
  pic: "assets/images/front1.jpg"
  promoHeader: "Logistics Service"
  exposition: "Convenient transloading and logistics service to help companies globalize"
  siteLink: "http://www.gatewaylogisticsllc.com"
  address: "19100 S. Susana Rd. Compton, CA 90221"
  contacts: ["transload-1"]
Warehouse =
  id: "warehouse"
  pic: "assets/images/warehouse.jpg"
  promoHeader: "Warehouse Storage Service"
  exposition: "We provide long and short term storage service for import and export companies"
  siteLink: "http://www.gatewaylogisticsllc.com"
  address: "19100 S. Susana Rd. Compton, CA 90221"
  contacts: ["warehouse-1"]
Trade = 
  id: "trade"
  pic: "assets/images/occ2.jpg"
  promoHeader: "Recycling and Recollection"
  exposition: "Our recycling branch is responsible for keeping our ecosystem sustainable"
  siteLink: "http://harborgreen.com"
  address: "19100 S. Susana Rd. Compton, CA 90221"
  contacts: ["trade-1"]
banners = Ember.A [Grain, Gateway, Warehouse, Trade]

`export default banners`