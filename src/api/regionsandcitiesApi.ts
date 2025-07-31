import axiosInstance from './axiosConfig';

export interface State {
  entity_id: string;
  states_name: string;
  country_id: string;
  customstate: string;
}

export interface GetStatesResponse {
  request: string;
  result: State[];
}

export const getStates = async (signal?:AbortSignal): Promise<State[]> => {
    try {
        const response = await axiosInstance.get<GetStatesResponse>(
    '/magecomp_cityandregionmanager/ajax/getstates?selected_country=TN',
    {
      signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    }
  );   
  return response.data.result;
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error; // Rethrow the error to be handled by the caller
        
    }
  
  
};

export interface City {

    entity_id: string;
    states_name: string;
    cities_name: string;
    customcity: string;

}

export interface GetCitiesResponse {
  request: string;
  result: City[];
}

export const getCities = async (selectedState: string,signal?:AbortSignal): Promise<City[]> => {
    try {
          const response = await axiosInstance.get<GetCitiesResponse>(
    `/magecomp_cityandregionmanager/ajax/getcities?selected_state=${selectedState}`,
    {
      signal,
      headers: {
        
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    }

  );
  return response.data.result;
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error; // Rethrow the error to be handled by the caller
        
    }

};

export interface ZipCode {
  entity_id: string;
  states_name: string;
  zip_code: string;
  cities_name: string;
}

export interface GetZipCodesResponse {
  request: string;
  result: ZipCode[];
}

export const getZipCodes = async (selectedCity: string,signal?:AbortSignal): Promise<ZipCode[]> => {
    try {
        const response = await axiosInstance.get<GetZipCodesResponse>(
    `/magecomp_cityandregionmanager/ajax/getzip?selected_city=${selectedCity}`,
    {
      signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    }
  );
   return response.data.result;
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
  
 
};
