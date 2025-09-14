
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, CalendarIcon, Clock, MapPin, Loader2 } from "lucide-react";
import type { Crop, CropStatus, CropTask } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getCrops, addCrop, updateCrop, deleteCrop, type CropFormInput } from "@/lib/actions/crops";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from 'firebase/auth';

const statusStyles: { [key in CropStatus]: string } = {
  Planned: "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30 border-yellow-500/30",
  Growing: "bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/30",
  Harvested: "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-500/30",
};

export default function CropsPageClient() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCrops = useCallback(async (currentUser: User) => {
    setIsLoading(true);
    try {
      const fetchedCrops = await getCrops(currentUser.uid);
      setCrops(fetchedCrops);
    } catch (error) {
      console.error("Failed to fetch crops", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch crop data." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchCrops(user);
    } else {
      setIsLoading(false);
      setCrops([]);
    }
  }, [user, fetchCrops]);
  
  const onFormSubmit = useCallback(async () => {
      if (user) {
          await fetchCrops(user);
      }
  }, [user, fetchCrops]);


  const handleAddNew = () => {
    setEditingCrop(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setIsDialogOpen(true);
  };

  const handleDelete = async (cropId: string) => {
    if (!user || !confirm("Are you sure you want to delete this crop?")) return;
    const result = await deleteCrop(user.uid, cropId);
    if (result.success) {
      toast({ title: "Crop deleted successfully." });
      onFormSubmit(); // Re-fetch data
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };
  
  const handleTaskToggle = async (crop: Crop, taskIndex: number, isCompleted: boolean) => {
    if (!user) return;
    const taskId = `${crop.id}-${taskIndex}`;
    setTogglingTaskId(taskId);

    const originalCrops = [...crops];
    const updatedCalendar = [...crop.calendar];
    updatedCalendar[taskIndex] = { ...updatedCalendar[taskIndex], isCompleted };
    
    // Optimistic UI update
    const updatedCrops = crops.map(c => c.id === crop.id ? { ...c, calendar: updatedCalendar } : c);
    setCrops(updatedCrops);

    // Update the backend
    const result = await updateCrop(user.uid, crop.id, { calendar: updatedCalendar });
    
    setTogglingTaskId(null);

    if (!result.success) {
      toast({ variant: "destructive", title: "Update failed", description: "Could not save task status." });
      // Revert UI if update fails
      setCrops(originalCrops);
    }
  };

  const renderContent = () => {
     if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 3}).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
            ))}
        </div>
      );
    }
    
    if (crops.length === 0) {
      return (
        <div className="text-center py-10 border-2 border-dashed rounded-xl mt-6">
          <p className="text-muted-foreground font-semibold">No crops found.</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first crop to get started.</p>
        </div>
      );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => {
               const nextTask = crop.calendar?.filter(t => !t.isCompleted).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
               return (
               <Card key={crop.id} className="flex flex-col overflow-hidden">
                   <div className="relative h-40 w-full">
                     <Image 
                        src={`https://placehold.co/600x400.png`} 
                        alt={crop.name} 
                        fill 
                        className="object-cover"
                        data-ai-hint={`${crop.name} field`}
                    />
                    <Badge className={cn("absolute top-3 right-3 border", statusStyles[crop.status])}>{crop.status}</Badge>
                   </div>
                   <CardHeader>
                        <CardTitle>{crop.name}</CardTitle>
                        {crop.region && <CardDescription className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {crop.region}</CardDescription>}
                   </CardHeader>
                   <CardContent className="flex-grow space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-2 rounded-md bg-muted/50">
                                <p className="font-bold">6.8</p>
                                <p className="text-xs text-muted-foreground">Soil pH</p>
                            </div>
                            <div className="text-center p-2 rounded-md bg-muted/50">
                                <p className="font-bold">Good</p>
                                <p className="text-xs text-muted-foreground">Quality</p>
                            </div>
                            <div className="text-center p-2 rounded-md bg-muted/50">
                                <p className="font-bold">Balanced</p>
                                <p className="text-xs text-muted-foreground">Fertilizer</p>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-2">Next Task</h4>
                            {nextTask ? (
                                <div className="flex items-center gap-3">
                                    <Checkbox 
                                        id={`task-${crop.id}-${crop.calendar.indexOf(nextTask)}`}
                                        checked={nextTask.isCompleted} 
                                        onCheckedChange={(checked) => handleTaskToggle(crop, crop.calendar.indexOf(nextTask), !!checked)}
                                        disabled={togglingTaskId === `${crop.id}-${crop.calendar.indexOf(nextTask)}`}
                                        aria-label={`Mark task ${nextTask.taskName} as complete`}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor={`task-${crop.id}-${crop.calendar.indexOf(nextTask)}`} className="font-medium">
                                            {nextTask.taskName}
                                        </Label>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(nextTask.startDate), "MMM d")} - {format(new Date(nextTask.endDate), "MMM d")}
                                        </p>
                                    </div>
                                    {togglingTaskId === `${crop.id}-${crop.calendar.indexOf(nextTask)}` && <Loader2 className="h-4 w-4 animate-spin" />}
                                </div>
                            ) : crop.calendar && crop.calendar.length > 0 ? (
                                <p className="text-sm text-muted-foreground">All tasks completed!</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No calendar generated. Edit crop to create one.</p>
                            )}
                        </div>
                   </CardContent>
                   <CardFooter className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => handleEdit(crop)} aria-label={`Edit ${crop.name}`}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                        <Button variant="destructive-outline" onClick={() => handleDelete(crop.id)} aria-label={`Delete ${crop.name}`}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                   </CardFooter>
                </Card>
            )})}
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold">Crop Management</h1>
          <p className="text-muted-foreground">
            Manage your crops and track their growth cycle and tasks.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add New Crop
        </Button>
      </div>
      
      {renderContent()}

      <CropFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        crop={editingCrop}
        user={user}
        onFormSubmit={onFormSubmit}
      />
    </div>
  );
}

interface CropFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  crop: Crop | null;
  user: User | null;
  onFormSubmit: () => Promise<void>;
}

function CropFormDialog({
  isOpen,
  onOpenChange,
  crop,
  user,
  onFormSubmit,
}: CropFormDialogProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<CropStatus>("Planned");
  const [region, setRegion] = useState("");
  const [plantedDate, setPlantedDate] = useState<Date | undefined>();
  const [harvestDate, setHarvestDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      setName(crop?.name || "");
      setStatus(crop?.status || "Planned");
      setRegion(crop?.region || "");
      setPlantedDate(crop?.plantedDate ? new Date(crop.plantedDate) : undefined);
      setHarvestDate(crop?.harvestDate ? new Date(crop.harvestDate) : undefined);
      setNotes(crop?.notes || "");
    }
  }, [isOpen, crop]);

  const handleSubmit = async () => {
    if (!name) {
        toast({ variant: "destructive", title: "Error", description: "Crop name is required." });
        return;
    }
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a crop. Please refresh the page."});
        return;
    }
    
    setIsSubmitting(true);

    const cropData: CropFormInput = {
        name,
        status,
        notes,
        region,
        plantedDate: plantedDate ? plantedDate.toISOString() : null,
        harvestDate: harvestDate ? harvestDate.toISOString() : null,
    };

    const result = crop?.id 
      ? await updateCrop(user.uid, crop.id, { ...cropData, calendar: crop.calendar }) 
      : await addCrop(user.uid, cropData);

    if (result.success) {
        toast({ title: `Crop ${crop ? "updated" : "added"} successfully.` });
        await onFormSubmit();
        onOpenChange(false);
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }

    setIsSubmitting(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{crop ? "Edit Crop" : "Add New Crop"}</DialogTitle>
          <DialogDescription>
            {crop
              ? "Update the details for your crop."
              : "Fill in the details for your new crop to generate its calendar."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Crop Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Paddy"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="region" className="text-right">
              Region
            </Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Karnataka"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(v) => setStatus(v as CropStatus)} value={status} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="Growing">Growing</SelectItem>
                <SelectItem value="Harvested">Harvested</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="planted-date" className="text-right">
              Planted Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !plantedDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {plantedDate ? format(plantedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={plantedDate}
                  onSelect={setPlantedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="harvest-date" className="text-right">
              Harvest Date
            </Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !harvestDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {harvestDate ? format(harvestDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={harvestDate}
                  onSelect={setHarvestDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Any additional notes..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
