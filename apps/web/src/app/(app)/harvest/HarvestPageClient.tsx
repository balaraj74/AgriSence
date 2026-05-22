
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, CalendarIcon, Scale } from "lucide-react";
import type { Harvest, HarvestUnit, Crop } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getHarvests, addHarvest, updateHarvest, deleteHarvest, type HarvestFormInput } from "@/lib/actions/harvests";
import { getCrops } from "@/lib/actions/crops";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "firebase/auth";

export default function HarvestPageClient() {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [availableCrops, setAvailableCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoading(true);
        const [fetchedHarvests, fetchedCrops] = await Promise.all([
            getHarvests(user.uid),
            getCrops(user.uid)
        ]);
        setHarvests(fetchedHarvests);
        setAvailableCrops(fetchedCrops);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const summary = useMemo(() => {
    const totalHarvests = harvests.length;
    const activeCrops = new Set(harvests.map(h => h.cropName)).size;
    const latestHarvest = harvests.length > 0
      ? harvests.sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime())[0]
      : null;

    return { totalHarvests, activeCrops, latestHarvest };
  }, [harvests]);

  const handleAddNew = () => {
    setEditingHarvest(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (harvest: Harvest) => {
    setEditingHarvest(harvest);
    setIsDialogOpen(true);
  };

  const handleDelete = async (harvestId: string) => {
    if (!user) return;
    const result = await deleteHarvest(user.uid, harvestId);
     if (result.success) {
      toast({ title: "Harvest record deleted successfully." });
      const fetchedHarvests = await getHarvests(user.uid);
      setHarvests(fetchedHarvests);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const onFormSubmit = async () => {
    if (user) {
      const fetchedHarvests = await getHarvests(user.uid);
      setHarvests(fetchedHarvests);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="hidden md:block">
            <h1 className="text-3xl font-bold">Harvest Records</h1>
            <p className="text-muted-foreground">
              Record and track your crop yields and output.
            </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Record New Output
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Total Records</CardDescription>
                <CardTitle className="text-4xl">
                    { isLoading ? <Skeleton className="h-8 w-1/4" /> : summary.totalHarvests }
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">Harvest records logged</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Harvested Crops</CardDescription>
                <CardTitle className="text-4xl">
                    { isLoading ? <Skeleton className="h-8 w-1/4" /> : summary.activeCrops }
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">Unique crops with output</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Latest Harvest</CardDescription>
                <CardTitle className="text-2xl font-bold">
                    { isLoading ? <Skeleton className="h-8 w-1/2" /> : summary.latestHarvest ? summary.latestHarvest.cropName : 'N/A' }
                </CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-xs text-muted-foreground">
                { summary.latestHarvest ? format(new Date(summary.latestHarvest.harvestDate), "PPP") : "Record your first harvest" }
               </p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Harvest Log</CardTitle>
          <CardDescription>
            A list of all your recorded harvests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                            <TableCell className="text-right space-x-1"><Skeleton className="h-8 w-8 inline-block" /><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                        </TableRow>
                    ))
                ) : harvests.length > 0 ? (
                  harvests.map((harvest) => (
                    <TableRow key={harvest.id}>
                      <TableCell className="font-medium">{harvest.cropName}</TableCell>
                      <TableCell>
                        {harvest.quantity} {harvest.unit}
                      </TableCell>
                      <TableCell>
                        {format(new Date(harvest.harvestDate), "dd MMM, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(harvest)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(harvest.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Scale className="h-12 w-12 text-muted-foreground" />
                        <h3 className="font-semibold">No harvest records yet</h3>
                        <p className="text-muted-foreground text-sm">Click "Record New Output" to start tracking.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <HarvestFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        harvest={editingHarvest}
        availableCrops={availableCrops}
        user={user}
        onFormSubmit={onFormSubmit}
      />
    </div>
  );
}

interface HarvestFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  harvest: Harvest | null;
  availableCrops: Crop[];
  user: User | null;
  onFormSubmit: () => void;
}

function HarvestFormDialog({
  isOpen,
  onOpenChange,
  harvest,
  availableCrops,
  user,
  onFormSubmit,
}: HarvestFormDialogProps) {
  const [cropId, setCropId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<HarvestUnit>("kg");
  const [harvestDate, setHarvestDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCropId(harvest?.cropId || "");
      setQuantity(harvest?.quantity.toString() || "");
      setUnit(harvest?.unit || "kg");
      setHarvestDate(harvest?.harvestDate ? new Date(harvest.harvestDate) : new Date());
      setNotes(harvest?.notes || "");
    }
  }, [isOpen, harvest]);

  const handleSubmit = async () => {
    const selectedCrop = availableCrops.find(c => c.id === cropId);
    if(!selectedCrop || !quantity || !harvestDate) {
        toast({ variant: "destructive", title: "Error", description: "Please fill all required fields." });
        return;
    }
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to perform this action."});
        return;
    }
    
    setIsSubmitting(true);

    const harvestData: HarvestFormInput = {
        cropId: selectedCrop.id,
        cropName: selectedCrop.name,
        quantity: parseFloat(quantity), 
        unit, 
        harvestDate: harvestDate.toISOString(), 
        notes 
    };

    const result = harvest?.id ? await updateHarvest(user.uid, harvest.id, harvestData) : await addHarvest(user.uid, harvestData);

    if (result.success) {
        toast({ title: `Harvest ${harvest ? "updated" : "recorded"} successfully.` });
        onOpenChange(false);
        onFormSubmit();
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }

    setIsSubmitting(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{harvest ? "Edit Harvest Record" : "Record New Output"}</DialogTitle>
          <DialogDescription>
            {harvest
              ? "Update the details for your harvest."
              : "Fill in the details for your new harvest."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cropName" className="text-right">
              Crop
            </Label>
             <Select onValueChange={setCropId} value={cropId} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                {availableCrops.map(crop => <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="col-span-2"
              placeholder="e.g. 100"
              disabled={isSubmitting}
            />
             <Select onValueChange={(v) => setUnit(v as HarvestUnit)} value={unit} disabled={isSubmitting}>
              <SelectTrigger className="col-span-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="quintal">quintal</SelectItem>
                <SelectItem value="tonne">tonne</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
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
            {isSubmitting ? "Saving..." : "Save Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
