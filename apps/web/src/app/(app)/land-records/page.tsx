"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, ArrowRight, Info } from "lucide-react";
import Link from "next/link";

const karnatakaDistricts: string[] = [
    "Bagalkote", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)",
    "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara",
    "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada", "Vijayapura (Bijapur)", "Yadgir"
];

const statesData: { [key: string]: { name: string, url: string, districts?: string[] } } = {
    "andhra_pradesh": { name: "Andhra Pradesh", url: "http://meebhoomi.ap.gov.in/" },
    "arunachal_pradesh": { name: "Arunachal Pradesh", url: "https://namsai.nic.in/service/land-records/" },
    "assam": { name: "Assam", url: "https://revenueassam.nic.in/ILRMS/" },
    "bihar": { name: "Bihar", url: "http://biharbhumi.bihar.gov.in/" },
    "chhattisgarh": { name: "Chhattisgarh", url: "https://bhuiyan.cg.nic.in/" },
    "goa": { name: "Goa", url: "https://dslr.goa.gov.in/" },
    "gujarat": { name: "Gujarat", url: "https://anyror.gujarat.gov.in/" },
    "haryana": { name: "Haryana", url: "https://jamabandi.nic.in/" },
    "himachal_pradesh": { name: "Himachal Pradesh", url: "https://himachal.nic.in/index.php?lang=1&dpt_id=13" },
    "jharkhand": { name: "Jharkhand", url: "https://jharbhoomi.nic.in/" },
    "karnataka": { 
        name: "Karnataka", 
        url: "https://landrecords.karnataka.gov.in/service2/RTC.aspx",
        districts: karnatakaDistricts
    },
    "kerala": { name: "Kerala", url: "http://erekha.kerala.gov.in/" },
    "madhya_pradesh": { name: "Madhya Pradesh", url: "https://mpbhulekh.gov.in/" },
    "maharashtra": { name: "Maharashtra", url: "https://bhulekh.mahabhumi.gov.in/" },
    "manipur": { name: "Manipur", url: "https://louchapathap.nic.in/" },
    "meghalaya": { name: "Meghalaya", url: "https://meghalaya.gov.in/depts/revenue" },
    "mizoram": { name: "Mizoram", url: "https://dict.mizoram.gov.in/page/land-record-and-settlement" },
    "nagaland": { name: "Nagaland", url: "https://dlrs.nagaland.gov.in/" },
    "odisha": { name: "Odisha", url: "http://bhulekh.ori.nic.in/" },
    "punjab": { name: "Punjab", url: "http://jamabandi.punjab.gov.in/" },
    "rajasthan": { name: "Rajasthan", url: "http://apnakhata.raj.nic.in/" },
    "sikkim": { name: "Sikkim", url: "http://www.sikkimlrdm.gov.in/" },
    "tamil_nadu": { name: "Tamil Nadu", url: "https://eservices.tn.gov.in/" },
    "telangana": { name: "Telangana", url: "https://dharani.telangana.gov.in/" },
    "tripura": { name: "Tripura", url: "https://jami.tripura.gov.in/" },
    "uttar_pradesh": { name: "Uttar Pradesh", url: "https://upbhulekh.gov.in/" },
    "uttarakhand": { name: "Uttarakhand", url: "http://bhulekh.uk.gov.in/" },
    "west_bengal": { name: "West Bengal", url: "http://banglarbhumi.gov.in/" },
    "delhi": { name: "Delhi", url: "https://dlrc.delhigovt.nic.in/" },
};

export default function LandRecordsPage() {
  const [selectedStateKey, setSelectedStateKey] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  
  const selectedState = statesData[selectedStateKey];
  const districts = selectedState?.districts || [];
  
  const canProceed = selectedState?.url;

  const handleStateChange = (key: string) => {
    setSelectedStateKey(key);
    setSelectedDistrict(""); // Reset district on state change
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Land Records</h1>
          <p className="text-muted-foreground">
            Find and view official land records from government portals.
          </p>
        </div>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How it Works</AlertTitle>
        <AlertDescription>
          AgriSence helps you quickly access official government websites for land records. Select your state, and we'll provide a direct link to the portal. For some states, you can pre-select your district.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Find Your Land Record (RTC/Pahani)</CardTitle>
          <CardDescription>
            Select your location to get a link to the official portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select onValueChange={handleStateChange} value={selectedStateKey}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statesData).map(([key, data]) => (
                    <SelectItem key={key} value={key}>{data.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedState?.districts && districts.length > 0 && (
             <>
                <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Select onValueChange={setSelectedDistrict} value={selectedDistrict} disabled={!districts.length}>
                    <SelectTrigger id="district">
                        <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                        {districts.map((district) => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
             </>
          )}

           <div className="space-y-2">
                <Label htmlFor="survey-number">Survey Number (Optional)</Label>
                <Input id="survey-number" placeholder="Enter your survey number if known"/>
            </div>

        </CardContent>
        <CardFooter>
            <Button asChild disabled={!canProceed} className="w-full">
                <Link href={selectedState?.url || '#'} target="_blank" rel="noopener noreferrer">
                    Proceed to Government Portal <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
