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
  promoHeader: "Logistics and Warehouse Service"
  exposition: "Convenient transloading and logistics service to help companies globalize"
  address: "19100 S. Susana Rd. Compton, CA 90221"
  contacts: ["transload-2", "transload-1"]
  pics: [
    "assets/images/warehouse.jpg",
    "assets/images/truck.jpg",
    "assets/images/shipping.jpg",
    "assets/images/container.jpg",
    "assets/images/load.jpg"
  ]

Trade = 
  id: "trade"
  pic: "assets/images/occ2.jpg"
  promoHeader: "Recycling and Recollection"
  exposition: "Our recycling branch is responsible for keeping our ecosystem sustainable"
  contacts: ["trade-1", "trade-2"]
  pics: [
    "assets/images/occ2.jpg",
    "assets/images/occ.jpg",
    "assets/images/a-busy-port.jpg",
    "assets/images/paper.jpg",
    "assets/images/lasvegas.jpg",
    "assets/images/plastic.jpg"
  ]
banners = Ember.A [Grain, Trade, Gateway]

`export default banners`