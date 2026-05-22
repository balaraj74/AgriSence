
'use client';

import { useState, useEffect, useMemo } from "react";
import type { User } from "firebase/auth";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart as BarChartIcon, ChevronRight, LogOut, Shield, HelpCircle, Settings, User as UserIcon, Camera, Save, Loader2, Palette } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/actions/user";
import { getHarvests } from "@/lib/actions/harvests";
import { getExpenses } from "@/lib/actions/expenses";
import type { Harvest, Expense, ExpenseCategory } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadManager } from "@/components/file-upload-manager";
import { ThemeToggle } from "@/components/theme-toggle";

const BarChart = dynamic(() => import("../analytics/charts").then(mod => mod.AnalyticsBarChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full" />,
});

const PieChart = dynamic(() => import("../analytics/charts").then(mod => mod.AnalyticsPieChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full" />,
});


const menuItems = [
    { label: "Privacy Policy", icon: Shield },
    { label: "Help & Support", icon: HelpCircle },
];

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.photoURL || null);
    const [isSaving, setIsSaving] = useState(false);

    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
            setPreviewUrl(user.photoURL || null);

            async function fetchData(currentUser: User) {
              setIsLoadingAnalytics(true);
              try {
                const [harvestData, expenseData] = await Promise.all([
                  getHarvests(currentUser.uid),
                  getExpenses(currentUser.uid),
                ]);
                setHarvests(harvestData);
                setExpenses(expenseData);
              } catch (error) {
                console.error("Failed to fetch analytics data:", error);
              } finally {
                setIsLoadingAnalytics(false);
              }
            }
            fetchData(user);
        }
    }, [user]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);

        const formData = new FormData();
        formData.append("displayName", displayName);
        if (photoFile) {
            formData.append("photo", photoFile);
        }

        try {
            const result = await updateUserProfile(formData);
            if (result.success) {
                toast({ title: "Profile updated successfully!" });
                if(result.photoURL) setPreviewUrl(result.photoURL);
                // Manually trigger a re-render or state update if auth state doesn't automatically
                // This might require a manual refresh of the user object from auth
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsSaving(false);
            setPhotoFile(null);
        }
    };
    
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const cropPerformanceData = useMemo(() => {
        const dataByCrop: { [key: string]: { yield: number } } = {};
        harvests.forEach((h) => {
          if (!dataByCrop[h.cropName]) {
            dataByCrop[h.cropName] = { yield: 0 };
          }
          let quantityInKg = h.quantity;
          if (h.unit === 'quintal') quantityInKg *= 100;
          if (h.unit === 'tonne') quantityInKg *= 1000;
          dataByCrop[h.cropName].yield += quantityInKg;
        });
        return Object.entries(dataByCrop).map(([name, { yield: totalYield }]) => ({ name, yield: totalYield }));
    }, [harvests]);

    const expenseBreakdownData = useMemo(() => {
        const dataByCategory: { [key: string]: number } = {};
        expenses.forEach((e) => {
          if (!dataByCategory[e.category]) {
            dataByCategory[e.category] = 0;
          }
          dataByCategory[e.category] += e.amount;
        });
        return Object.entries(dataByCategory).map(([name, value]) => ({ name, value: Math.round(value) }));
    }, [expenses]);


    if (!user) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
                <Card><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                <Card><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-primary/50 ring-4 ring-primary/20">
                    {previewUrl && <AvatarImage src={previewUrl} alt={displayName || 'User'} />}
                    <AvatarFallback className="text-4xl bg-muted">
                        {displayName ? displayName.charAt(0).toUpperCase() : <UserIcon size={48} />}
                    </AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{displayName || 'Farmer'}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5"/> Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-16 w-16 border-2">
                                {previewUrl && <AvatarImage src={previewUrl} alt={displayName || 'User'} />}
                                <AvatarFallback className="text-xl bg-muted">
                                    {displayName ? displayName.charAt(0).toUpperCase() : <UserIcon />}
                                </AvatarFallback>
                            </Avatar>
                             <Label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground rounded-full p-1.5 cursor-pointer hover:bg-secondary/80 border-2 border-background">
                                <Camera className="h-4 w-4" />
                                <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </Label>
                        </div>
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                    </div>
                     <Button className="w-full" onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme-toggle" className="font-medium">
                            Theme
                        </Label>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>File Upload</CardTitle>
                    <CardDescription>Upload documents, photos, or videos related to your farm.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploadManager userId={user.uid} onUploadComplete={(url) => console.log('Uploaded file URL:', url)} />
                </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="analytics">
                    <Card>
                        <AccordionTrigger className="p-6">
                             <CardTitle className="flex items-center gap-2 text-base font-semibold"><BarChartIcon className="h-5 w-5"/> Farm Analytics</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                {isLoadingAnalytics ? (
                                    <>
                                        <Skeleton className="h-64 w-full" />
                                        <Skeleton className="h-64 w-full" />
                                    </>
                                ) : (
                                <>
                                    <div>
                                        <h3 className="font-semibold mb-2 text-center text-sm">Crop Yield (kg)</h3>
                                        {cropPerformanceData.length > 0 ? (
                                            <BarChart data={cropPerformanceData} />
                                        ) : <div className="flex items-center justify-center h-[250px]"><p className="text-sm text-muted-foreground text-center">No harvest data yet.</p></div>}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2 text-center text-sm">Expense Breakdown</h3>
                                         {expenseBreakdownData.length > 0 ? (
                                            <PieChart data={expenseBreakdownData} />
                                        ) : <div className="flex items-center justify-center h-[250px]"><p className="text-sm text-muted-foreground text-center">No expense data yet.</p></div>}
                                    </div>
                                </>
                                )}
                            </CardContent>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>


            <Card>
                <CardContent className="p-2">
                    <ul className="space-y-1">
                        {menuItems.map(item => (
                            <li key={item.label}>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg" aria-label={item.label}>
                                    <div className="flex items-center gap-4">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                                </button>
                            </li>
                        ))}
                         <li>
                            <button onClick={handleSignOut} className="w-full flex items-center p-3 hover:bg-muted rounded-lg text-red-600" aria-label="Logout">
                                <div className="flex items-center gap-4">
                                    <LogOut className="h-5 w-5" />
                                    <span className="font-medium">Logout</span>
                                </div>
                            </button>
                         </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
