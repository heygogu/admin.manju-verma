// components/providers/Provider.tsx
"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import { useRouter } from "next/navigation"; // Updated to next/navigation
import apis from "@/utils/apis";

import { destroyCookie } from "nookies";
interface UserInfo {
  access_token?: string;
  [key: string]: any;
}

interface GlobalContextType {
  logout: () => Promise<void>;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  userInfo: UserInfo | null;
  stopSpaceEnter: (event: React.KeyboardEvent) => boolean;
  getProfile: () => Promise<void>;
  formatDuration: (seconds: number) => string;
  getCountryByPhoneCode: (countryCode: string) => string | undefined; 
  convertToDashLowercase: (name: string) => string;
  convertToOriginalCase: (hyphenatedName: string) => string;
  setAgentNumber: React.Dispatch<React.SetStateAction<number>>;
  agentNumber: number;
  getCounts:()=>void;
  counts:any;

}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
  userInfo?: UserInfo;
}
type ToastFunction = (msg: any) => void;
export function GlobalProvider({ children, userInfo: initialUserInfo }: GlobalProviderProps) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(initialUserInfo || null);
  const [agentNumber,setAgentNumber] = useState(0);
  console.log(initialUserInfo, "initialUserInfo");

  if (userInfo?.access_token) {
    apis.setToken(userInfo.access_token);
  }

  const stopSpaceEnter = (event: React.KeyboardEvent): boolean => {
    if (event.target instanceof HTMLInputElement) {
      if (event.target.value.length === 0 && event.key === " ") {
        event.preventDefault();
        return false;
      }
      
      // Allow only letters and space
      if (!/^[a-zA-Z ]$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  };

  const formatDuration = (seconds: number): string => {
    // Handle invalid or negative inputs
    if (seconds < 0 || isNaN(seconds)) return '0 s';
  
    // Define time units
    const units = [
      { name: 'd', seconds: 86400 },
      { name: 'h', seconds: 3600 },
      { name: 'm', seconds: 60 },
      { name: 's', seconds: 1 }
    ];
  
    // Find the appropriate unit and calculate
    for (const unit of units) {
      if (seconds >= unit.seconds) {
        const value = Math.floor(seconds / unit.seconds);
        const remainder = seconds % unit.seconds;
  
        // Construct the primary unit part
        let result = `${value}${unit.name}`;
  
        // Add secondary unit if there's a significant remainder
        if (unit.name !== 's' && remainder > 0) {
          const nextUnit = units[units.indexOf(unit) + 1];
          const nextValue = Math.floor(remainder / nextUnit.seconds);
          
          if (nextValue > 0) {
            result += ` ${nextValue}${nextUnit.name}`;
          }
        }
  
        return result;
      }
    }
  
    return '0 s';
  };




  function getCountryByPhoneCode(countryCode: string): string | undefined {
    // Remove any '+' or leading zeros
    const cleanedCode = countryCode?.replace(/^\+?0*/, '');
    
    const countryCodeMap: { [code: string]: string } = {
      // North America
      '1': 'United States',
      '1242': 'Bahamas',
      '1246': 'Barbados',
      '1264': 'Anguilla',
      '1268': 'Antigua and Barbuda',
      '1284': 'British Virgin Islands',
      '1340': 'U.S. Virgin Islands',
      '1345': 'Cayman Islands',
      '1364': 'Montserrat',
      '1441': 'Bermuda',
      '1473': 'Grenada',
      '1649': 'Turks and Caicos Islands',
      '1658': 'Jamaica',
      '1664': 'Montserrat',
      '1670': 'Northern Mariana Islands',
      '1684': 'American Samoa',
      '1721': 'Sint Maarten',
      '1758': 'Saint Lucia',
      '1767': 'Dominica',
      '1784': 'Saint Vincent and the Grenadines',
      '1787': 'Puerto Rico',
      '1809': 'Dominican Republic',
      '1829': 'Dominican Republic',
      '1849': 'Dominican Republic',
      '1868': 'Trinidad and Tobago',
      '1876': 'Jamaica',
  
      // Europe
      '44': 'United Kingdom',
      '33': 'France',
      '49': 'Germany',
      '39': 'Italy',
      '34': 'Spain',
      '31': 'Netherlands',
      '46': 'Sweden',
      '47': 'Norway',
      '358': 'Finland',
      '353': 'Ireland',
      '420': 'Czech Republic',
      '421': 'Slovakia',
      '386': 'Slovenia',
      '385': 'Croatia',
     
      '387': 'Serbia',
      '389': 'North Macedonia',
      '373': 'Moldova',
      '374': 'Armenia',
      '375': 'Belarus',
      '376': 'Andorra',
      '378': 'San Marino',
      '380': 'Ukraine',
      '381': 'Serbia',
      '382': 'Montenegro',
      '383': 'Kosovo',
      
  
      // Asia
      '86': 'China',
      '91': 'India',
      '81': 'Japan',
      '82': 'South Korea',
      '84': 'Vietnam',
      '66': 'Thailand',
      '62': 'Indonesia',
      '65': 'Singapore',
      '60': 'Malaysia',
      '63': 'Philippines',
      '971': 'United Arab Emirates',
      '972': 'Israel',
      '973': 'Bahrain',
      '974': 'Qatar',
      '975': 'Bhutan',
      '976': 'Mongolia',
      '977': 'Nepal',
      '978': 'Iran',
      '992': 'Tajikistan',
      '993': 'Turkmenistan',
      '994': 'Azerbaijan',
      '995': 'Georgia',
      '996': 'Kyrgyzstan',
      '998': 'Uzbekistan',
  
      // Africa
      '20': 'Egypt',
      '212': 'Morocco',
      '213': 'Algeria',
      '216': 'Tunisia',
      '218': 'Libya',
      '220': 'Gambia',
      '221': 'Senegal',
      '222': 'Mauritania',
      '223': 'Mali',
      '224': 'Guinea',
      '225': 'Ivory Coast',
      '226': 'Burkina Faso',
      '227': 'Niger',
      '228': 'Togo',
      '229': 'Benin',
      '230': 'Mauritius',
      '231': 'Liberia',
      '232': 'Sierra Leone',
      '233': 'Ghana',
      '234': 'Nigeria',
      '235': 'Chad',
      '236': 'Central African Republic',
      '237': 'Cameroon',
      '238': 'Cape Verde',
      '239': 'Sao Tome and Principe',
      '240': 'Equatorial Guinea',
      '241': 'Gabon',
      '242': 'Congo',
      '243': 'Democratic Republic of the Congo',
      '244': 'Angola',
      '245': 'Guinea-Bissau',
      '246': 'Diego Garcia',
      '247': 'Ascension Island',
      '248': 'Seychelles',
      '249': 'Sudan',
      '250': 'Rwanda',
      '251': 'Ethiopia',
      '252': 'Somalia',
      '253': 'Djibouti',
      '254': 'Kenya',
      '255': 'Tanzania',
      '256': 'Uganda',
      '257': 'Burundi',
      '258': 'Mozambique',
      '260': 'Zambia',
      '261': 'Madagascar',
      '262': 'Reunion',
      '263': 'Zimbabwe',
      '264': 'Namibia',
      '265': 'Malawi',
      '266': 'Lesotho',
      '267': 'Botswana',
      '268': 'Eswatini',
      '269': 'Comoros',
  
      // Oceania
      '61': 'Australia',
      '64': 'New Zealand',
      '679': 'Fiji',
      '682': 'Cook Islands',
      '683': 'Niue',
      '685': 'Samoa',
      '686': 'Kiribati',
      '687': 'New Caledonia',
      '688': 'Tuvalu',
      '689': 'French Polynesia',
      '690': 'Tokelau',
      '691': 'Micronesia',
      '692': 'Marshall Islands',
  
      // South America
      '55': 'Brazil',
      '54': 'Argentina',
      '56': 'Chile',
      '57': 'Colombia',
      '58': 'Venezuela',
      '59': 'Various Caribbean',
      '595': 'Paraguay',
      '598': 'Uruguay'
    };
  
    return countryCodeMap[cleanedCode];
  }
  const logout = async () => {
    destroyCookie(null, "COOKIES_ADMIN_ACCESS_TOKEN", {
      path: "/",
    });
    router.replace("/login");
    setUserInfo(null);
  };


  function convertToDashLowercase(name: string): string {
    // Trim any extra whitespace and split into words
    const words = name.trim().split(/\s+/);
    
    // Convert to lowercase and join with hyphens
    return words
        .map(word => word.toLowerCase())
        .join('-');
}


function convertToOriginalCase(hyphenatedName: string): string {
  // Split the hyphenated name into words
  if(!hyphenatedName) return '';
  const words = hyphenatedName.split('-');
  
  // Capitalize first letter of each word
  return words
      .map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ');
}

const [counts,setCounts]=useState<any>()

const getCounts=async()=>{
  try {
    const apiRes = await apis.SuperAdmin.entityCount();
    setCounts(apiRes?.data);
  } catch (error) {
    console.error('Agent count fetch error:', error);
  }
}


  const getProfile = async () => {
    try {
      const apiRes = await apis.SuperAdmin.profile();
      setUserInfo(apiRes?.data);
      console.log(apiRes?.data, "apiRes?.data");
    } catch (error) {
      console.error('Profile fetch error:', error);
      
     
    }
  };

  const contextValue: GlobalContextType = {
    logout,
    getCounts,
    counts,
    setUserInfo,
    userInfo,
    stopSpaceEnter,
    getProfile,
    formatDuration,
    getCountryByPhoneCode,
    convertToDashLowercase,
    convertToOriginalCase,
    setAgentNumber,
    agentNumber
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}

// Custom hook to use the global context
export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
}

export default GlobalProvider;