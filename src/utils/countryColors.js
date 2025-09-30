// Country flag color mappings for better visual representation
export const COUNTRY_COLORS = {
  'United States': '#b22234',      // Red from US flag
  'India': '#ff9933',              // Saffron from Indian flag  
  'United Kingdom': '#012169',     // Blue from UK flag
  'Brazil': '#009b3a',             // Green from Brazilian flag
  'Germany': '#000000',            // Black from German flag
  'France': '#0055a4',             // Blue from French flag
  'Canada': '#ff0000',             // Red from Canadian flag
  'Australia': '#0057b7',          // Blue from Australian flag
  'Japan': '#bc002d',              // Red from Japanese flag
  'South Korea': '#cd2e3a',        // Red from South Korean flag
  'Italy': '#009246',              // Green from Italian flag
  'Spain': '#c60b1e',              // Red from Spanish flag
  'Mexico': '#006341',             // Green from Mexican flag
  'Argentina': '#74acdf',          // Light blue from Argentine flag
  'Russia': '#0033a0',             // Blue from Russian flag
  'China': '#de2910',              // Red from Chinese flag
  'Netherlands': '#21468b',        // Blue from Dutch flag
  'Turkey': '#e30a17',             // Red from Turkish flag
  'Saudi Arabia': '#006c35',       // Green from Saudi flag
  'UAE': '#00732f',                // Green from UAE flag
  'Egypt': '#ce1126',              // Red from Egyptian flag
  'Nigeria': '#008751',            // Green from Nigerian flag
  'South Africa': '#007a4d',       // Green from South African flag
  'Others': '#6b7280',             // Gray for miscellaneous
  'Local': '#64748b',              // Slate gray for local/regional
  'Local Region': '#64748b',       // Slate gray for local/regional
  'Global': '#6b7280'              // Gray for global/mixed
};

export const getCountryColor = (countryName) => {
  return COUNTRY_COLORS[countryName] || '#6b7280'; // Default to gray
};