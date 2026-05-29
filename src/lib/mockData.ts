export const heatClusters = [
  { lat: 14.5995, lng: 120.9842, name: "Metro Manila", avgPrice: 8500000 },
  { lat: 10.3157, lng: 123.8854, name: "Cebu City", avgPrice: 4200000 },
  { lat: 7.1907, lng: 125.4553, name: "Davao City", avgPrice: 3100000 },
  { lat: 14.6760, lng: 121.0437, name: "Quezon City", avgPrice: 6200000 },
  { lat: 8.4542, lng: 124.6319, name: "Cagayan de Oro", avgPrice: 2800000 },
  { lat: 10.7202, lng: 122.5621, name: "Iloilo City", avgPrice: 3500000 },
  { lat: 15.1800, lng: 120.5979, name: "Angeles City", avgPrice: 4800000 },
];

export const featuredListings = [
  { id: 1, location: "Lahug, Cebu City", price: 4200000, bedrooms: 3, bathrooms: 2, floorArea: 120, type: "House", image: "/house.webp" },
  { id: 2, location: "Quezon City", price: 8500000, bedrooms: 4, bathrooms: 3, floorArea: 200, type: "House & Lot", image: "/single-family-home.webp" },
  { id: 3, location: "Davao City", price: 3100000, bedrooms: 2, bathrooms: 1, floorArea: 80, type: "House & Lot", image: "/house-and-lot.webp" },
  { id: 4, location: "BGC, Taguig", price: 12200000, bedrooms: 1, bathrooms: 1, floorArea: 42, type: "Townhouse", image: "/townhouse.webp" },
];

export const comparableListings = [
  {
    id: 1, address: "Lot 12, Banilad Subdivision", bedrooms: 3, floorArea: 110, lotArea: 130,
    price: 4500000, source: "Lamudi PH", distance: "0.4km", listedAgo: "2 days ago", match: 94,
    type: "House", image: "/house.webp",
  },
  {
    id: 2, address: "Sto. Niño Village, Cebu City", bedrooms: 3, floorArea: 90, lotArea: 100,
    price: 4100000, source: "PropertyPro", distance: "0.9km", listedAgo: "1 week ago", match: 88,
    type: "Townhouse", image: "/townhouse.webp",
  },
  {
    id: 3, address: "Kasambagan, Cebu City", bedrooms: 4, floorArea: 150, lotArea: 180,
    price: 5200000, source: "Dot Property", distance: "1.3km", listedAgo: "3 days ago", match: 81,
    type: "Villa", image: "/villa.webp",
  },
  {
    id: 4, address: "Talamban, Cebu City", bedrooms: 3, floorArea: 95, lotArea: 110,
    price: 4300000, source: "Lamudi PH", distance: "1.8km", listedAgo: "5 days ago", match: 76,
    type: "House & Lot", image: "/house-and-lot.webp",
  },
  {
    id: 5, address: "Mabolo, Cebu City", bedrooms: 2, floorArea: 75, lotArea: 90,
    price: 3800000, source: "PropertyPro", distance: "2.1km", listedAgo: "2 weeks ago", match: 71,
    type: "House", image: "/single-family-home.webp",
  },
];
