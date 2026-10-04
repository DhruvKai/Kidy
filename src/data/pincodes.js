// Mock serviceability table, with transit days counted from the shop in Kullu (HP).
// Anything not listed falls back to a zone guess from the first digits.
export const PINCODES = {
  '175101': { city: 'Kullu', state: 'Himachal Pradesh', days: 1, cod: true },
  '175131': { city: 'Manali', state: 'Himachal Pradesh', days: 1, cod: true },
  '175001': { city: 'Mandi', state: 'Himachal Pradesh', days: 1, cod: true },
  '171001': { city: 'Shimla', state: 'Himachal Pradesh', days: 2, cod: true },
  '176215': { city: 'Dharamshala', state: 'Himachal Pradesh', days: 2, cod: true },
  '160017': { city: 'Chandigarh', state: 'Chandigarh', days: 2, cod: true },
  '141001': { city: 'Ludhiana', state: 'Punjab', days: 2, cod: true },
  '144001': { city: 'Jalandhar', state: 'Punjab', days: 2, cod: true },
  '110001': { city: 'New Delhi', state: 'Delhi', days: 3, cod: true },
  '122001': { city: 'Gurugram', state: 'Haryana', days: 3, cod: true },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', days: 3, cod: true },
  '302001': { city: 'Jaipur', state: 'Rajasthan', days: 4, cod: true },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', days: 4, cod: true },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', days: 5, cod: true },
  '452001': { city: 'Indore', state: 'Madhya Pradesh', days: 5, cod: true },
  '400001': { city: 'Mumbai', state: 'Maharashtra', days: 5, cod: true },
  '400069': { city: 'Mumbai', state: 'Maharashtra', days: 5, cod: true },
  '411001': { city: 'Pune', state: 'Maharashtra', days: 5, cod: true },
  '500001': { city: 'Hyderabad', state: 'Telangana', days: 5, cod: true },
  '800001': { city: 'Patna', state: 'Bihar', days: 5, cod: true },
  '560001': { city: 'Bengaluru', state: 'Karnataka', days: 6, cod: true },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', days: 6, cod: true },
  '700001': { city: 'Kolkata', state: 'West Bengal', days: 6, cod: true },
  '751001': { city: 'Bhubaneswar', state: 'Odisha', days: 6, cod: true },
  '682001': { city: 'Kochi', state: 'Kerala', days: 7, cod: true },
  '781001': { city: 'Guwahati', state: 'Assam', days: 7, cod: false },
  '194101': { city: 'Leh', state: 'Ladakh', days: 7, cod: false },
  '744101': { city: 'Port Blair', state: 'Andaman and Nicobar Islands', days: 0, cod: false, unserviceable: true },
}

// Two-digit prefixes near Kullu first, then the first-digit postal zones.
const NEAR = {
  17: { state: 'Himachal Pradesh', days: 1 }, 14: { state: 'Punjab', days: 2 }, 15: { state: 'Punjab', days: 2 },
  16: { state: 'Chandigarh', days: 2 }, 13: { state: 'Haryana', days: 2 }, 18: { state: 'Jammu and Kashmir', days: 3 },
}
const ZONES = {
  1: { state: 'Delhi', days: 3 }, 2: { state: 'Uttar Pradesh', days: 4 }, 3: { state: 'Rajasthan', days: 4 },
  4: { state: 'Maharashtra', days: 5 }, 5: { state: 'Karnataka', days: 6 }, 6: { state: 'Tamil Nadu', days: 6 },
  7: { state: 'West Bengal', days: 6 }, 8: { state: 'Bihar', days: 5 },
}
export function lookupPincode(pin) {
  if (!/^[1-8]\d{5}$/.test(pin)) return null
  if (PINCODES[pin]) return { pincode: pin, ...PINCODES[pin], exact: true }
  const z = NEAR[pin.slice(0, 2)] || ZONES[pin[0]]
  return { pincode: pin, city: '', state: z.state, days: z.days + 1, cod: true, exact: false }
}

export const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
