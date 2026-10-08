export type StateLocation = {
  id: string;
  name: string;
  cities: string[];
};

export const INDIA_LOCATIONS: StateLocation[] = [
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Rajahmundry', 'Tirupati'],
  },
  {
    id: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    cities: ['Itanagar', 'Naharlagun', 'Tawang', 'Pasighat', 'Ziro'],
  },
  {
    id: 'assam',
    name: 'Assam',
    cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur'],
  },
  {
    id: 'bihar',
    name: 'Bihar',
    cities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Purnia'],
  },
  {
    id: 'chhattisgarh',
    name: 'Chhattisgarh',
    cities: ['Raipur', 'Bilaspur', 'Durg', 'Korba', 'Jagdalpur'],
  },
  {
    id: 'goa',
    name: 'Goa',
    cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  },
  {
    id: 'haryana',
    name: 'Haryana',
    cities: ['Chandigarh', 'Gurugram', 'Faridabad', 'Panipat', 'Hisar'],
  },
  {
    id: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    cities: ['Shimla', 'Mandi', 'Dharamshala', 'Solan', 'Kullu'],
  },
  {
    id: 'jharkhand',
    name: 'Jharkhand',
    cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  },
  {
    id: 'kerala',
    name: 'Kerala',
    cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  },
  {
    id: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai', 'Vasai-Virar', 'Kolhapur', 'Solapur', 'Chhatrapati Sambhajinagar'],
  },
  {
    id: 'manipur',
    name: 'Manipur',
    cities: ['Imphal', 'Thoubal', 'Ukhrul', 'Bishnupur', 'Churachandpur'],
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Baghmara'],
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib'],
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha', 'Phek'],
  },
  {
    id: 'odisha',
    name: 'Odisha',
    cities: ['Bhubaneswar', 'Cuttack', 'Puri', 'Sambalpur', 'Rourkela'],
  },
  {
    id: 'punjab',
    name: 'Punjab',
    cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali'],
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    cities: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Jorethang'],
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'],
  },
  {
    id: 'telangana',
    name: 'Telangana',
    cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  },
  {
    id: 'tripura',
    name: 'Tripura',
    cities: ['Agartala', 'Udaipur', 'Khowai', 'Dharmanagar', 'Ambassa'],
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj'],
  },
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Nainital', 'Haldwani'],
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    cities: ['Kolkata', 'Durgapur', 'Asansol', 'Howrah', 'Siliguri'],
  },
  {
    id: 'andaman-and-nicobar-islands',
    name: 'Andaman and Nicobar Islands',
    cities: ['Port Blair', 'Havelock Island', 'Neil Island', 'Diglipur', 'Mayabunder'],
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    cities: ['Chandigarh'],
  },
  {
    id: 'dadra-and-nagar-haveli-and-daman-and-diu',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    cities: ['Daman', 'Diu', 'Silvassa', 'Vapi'],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    cities: ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh'],
  },
  {
    id: 'jammu-and-kashmir',
    name: 'Jammu and Kashmir',
    cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua'],
  },
  {
    id: 'ladakh',
    name: 'Ladakh',
    cities: ['Leh', 'Kargil', 'Diskit', 'Nubra', 'Zanskar'],
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep',
    cities: ['Kavaratti', 'Agatti', 'Minicoy', 'Andrott', 'Bangaram'],
  },
  {
    id: 'puducherry',
    name: 'Puducherry',
    cities: ['Puducherry', 'Karaikal', 'Yanam', 'Mahe'],
  },
];

export const getLocationById = (stateId: string) =>
  INDIA_LOCATIONS.find(state => state.id === stateId) ?? null;

export const getFilteredStates = (query: string) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return INDIA_LOCATIONS;
  }

  return INDIA_LOCATIONS.filter(state =>
    state.name.toLowerCase().includes(normalized),
  );
};

export const getFilteredCities = (state: StateLocation | null, query: string) => {
  if (!state) {
    return [];
  }

  const normalized = query.trim().toLowerCase();
  const cities = state.cities;

  if (!normalized) {
    return cities;
  }

  return cities.filter(city => city.toLowerCase().includes(normalized));
};
