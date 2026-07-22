import React, { useState } from 'react';
import { MapPin, TrendingUp, Users, DollarSign, BarChart3, Info } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// URL for the topography map
const geoUrl = '/geo/world-110m.json';

const InteractiveMap = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const countries = {
    Mali: {
      name: 'Mali',
      gdp: '17.5B $',
      population: '21.9M',
      growth: '+5.1%',
      capital: 'Bamako',
      color: '#E5DDD5',
      hoverColor: '#D4C7BC',
      industries: ['Or', 'Coton', 'Agriculture']
    },
    "Burkina Faso": {
      name: 'Burkina Faso',
      gdp: '18.9B $',
      population: '22.7M',
      growth: '+4.8%',
      capital: 'Ouagadougou',
      color: '#C5B8AB',
      hoverColor: '#B5A79A',
      industries: ['Or', 'Coton', 'Élevage']
    },
    Niger: {
      name: 'Niger',
      gdp: '14.9B $',
      population: '25.3M',
      growth: '+3.2%',
      capital: 'Niamey',
      color: '#A69B8E',
      hoverColor: '#968B7E',
      industries: ['Uranium', 'Élevage', 'Agriculture']
    },
    Mauritania: {
      name: 'Mauritanie',
      gdp: '8.1B $',
      population: '4.8M',
      growth: '+4.1%',
      capital: 'Nouakchott',
      color: '#8B7F72',
      hoverColor: '#7B6F62',
      industries: ['Fer', 'Pêche', 'Élevage']
    },
    Chad: {
      name: 'Tchad',
      gdp: '12.9B $',
      population: '17.2M',
      growth: '+2.8%',
      capital: 'N\'Djamena',
      color: '#6F6356',
      hoverColor: '#5F5346',
      industries: ['Pétrole', 'Coton', 'Élevage']
    }
  };

  const getCountryData = (countryKey: string) => countries[countryKey as keyof typeof countries];

  return (
    <div className="bg-white border border-[#EBE6DD] p-8 md:p-12 rounded-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Interactive Map */}
        <div className="relative">
          <h3 className="text-xl font-bold text-gray-900 mb-8 text-center uppercase tracking-widest">
            Économie du Sahel et du Tchad
          </h3>
          
          {/* React Simple Maps Container */}
          <div className="relative bg-[#FDFBF9] border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center" style={{ minHeight: '350px' }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 750,
                center: [3, 16] // Center on West Africa/Sahel
              }}
              width={500}
              height={400}
              className="w-full h-full outline-none"
            >
              <ZoomableGroup center={[3, 16]} zoom={1} minZoom={1} maxZoom={3}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties.name;
                      const isTargetCountry = Object.keys(countries).includes(countryName);
                      
                      const isActive = selectedCountry === countryName;
                      const isHovered = hoveredCountry === countryName;
                      
                      let fill = "#F5F3F0"; // Default non-target country
                      let stroke = "#EAE6DF";
                      
                      if (isTargetCountry) {
                        const cData = getCountryData(countryName);
                        fill = isHovered || isActive ? cData.hoverColor : cData.color;
                        stroke = "#FFFFFF";
                      }

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={isTargetCountry ? 1 : 0.5}
                          className={isTargetCountry ? "cursor-pointer transition-colors outline-none" : "outline-none"}
                          onMouseEnter={() => {
                            if (isTargetCountry) setHoveredCountry(countryName);
                          }}
                          onMouseLeave={() => {
                            if (isTargetCountry) setHoveredCountry(null);
                          }}
                          onClick={() => {
                            if (isTargetCountry) setSelectedCountry(countryName);
                          }}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none" },
                            pressed: { outline: "none" }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Interactive indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {Object.keys(countries).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCountry(key)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  selectedCountry === key 
                    ? 'bg-[#373B3A] scale-125' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={key}
              />
            ))}
          </div>
        </div>

        {/* Country Details */}
        <div className="space-y-6">
          {selectedCountry ? (
            <div className="bg-[#FDFBF9] rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCountryData(selectedCountry).color }}
                />
                <h4 className="text-2xl font-bold text-[#373B3A]">
                  {getCountryData(selectedCountry).name}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">PIB</p>
                      <p className="font-bold text-lg">{getCountryData(selectedCountry).gdp}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Population</p>
                      <p className="font-bold text-lg">{getCountryData(selectedCountry).population}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Croissance</p>
                      <p className="font-bold text-lg text-green-600">{getCountryData(selectedCountry).growth}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Capitale</p>
                      <p className="font-bold text-lg">{getCountryData(selectedCountry).capital}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3">Secteurs clés</p>
                <div className="flex flex-wrap gap-2">
                  {getCountryData(selectedCountry).industries.map((industry, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-[#EBE6DD] text-[#373B3A] rounded-full text-sm font-medium"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FDFBF9] rounded-2xl p-8 border border-[#EBE6DD] text-center flex flex-col justify-center h-full min-h-[300px]">
              <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-600 mb-2">
                Explorez les économies
              </h4>
              <p className="text-gray-500">
                Cliquez sur un pays de la carte pour découvrir ses indicateurs économiques clés
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-[#9C8464] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-500">PIB Total</p>
                  <p className="text-lg font-bold text-gray-900">72B $</p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-[#9C8464] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-500">Population</p>
                  <p className="text-lg font-bold text-gray-900">92M</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
