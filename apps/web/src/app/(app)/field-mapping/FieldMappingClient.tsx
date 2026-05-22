
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Map as MapIcon, Plus, Trash2, Redo, Pin, List, Edit, Trash, LocateFixed, Leaf, Maximize, Ruler, Save } from 'lucide-react';
import type { Field, Crop } from '@/types';
import { getFields, addField, updateField, deleteField } from '@/lib/actions/fields';
import { getCrops } from '@/lib/actions/crops';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from 'firebase/auth';

const MAP_ID = "AGRISENCE_MAP";
const ACRES_PER_SQ_METER = 0.000247105;

// #region Helper Functions
function calculatePolygonArea(coordinates: google.maps.LatLngLiteral[]): number {
    if (coordinates.length < 3) return 0;
    const path = coordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
    const areaInSqMeters = google.maps.geometry.spherical.computeArea(path);
    return areaInSqMeters * ACRES_PER_SQ_METER;
}

function calculatePolygonPerimeter(coordinates: google.maps.LatLngLiteral[]): number {
    if (coordinates.length < 2) return 0;
    const path = coordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
    // Close the loop for perimeter calculation if it's not already
    if (path.length > 2 && (path[0].lat() !== path[path.length - 1].lat() || path[0].lng() !== path[path.length - 1].lng())) {
        path.push(path[0]);
    }
    return google.maps.geometry.spherical.computeLength(path);
}


function calculatePolygonCentroid(coordinates: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral {
    if (coordinates.length === 0) return { lat: 0, lng: 0 };
    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach(coord => bounds.extend(coord));
    const center = bounds.getCenter();
    return center.toJSON();
}
// #endregion

// #region MapComponent
function MapComponent({ mapRef, center, fields, onPolygonComplete, activeFieldId, onFieldClick, initialPolygon, isDialog }: {
    mapRef: React.MutableRefObject<google.maps.Map | null>;
    center: google.maps.LatLngLiteral,
    fields: Field[],
    onPolygonComplete: (polygon: google.maps.Polygon) => void,
    activeFieldId: string | null,
    onFieldClick: (fieldId: string) => void,
    initialPolygon?: google.maps.LatLngLiteral[],
    isDialog?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager>();
    const drawnPolygonsRef = useRef<Map<string, google.maps.Polygon>>(new Map());
    const [mapType, setMapType] = useState<"roadmap" | "hybrid">("hybrid");

    // Initialize map
    useEffect(() => {
        if (ref.current && !mapRef.current) {
            const newMap = new window.google.maps.Map(ref.current, {
                center,
                zoom: 15,
                mapId: MAP_ID,
                mapTypeId: mapType,
                disableDefaultUI: true,
                zoomControl: true,
                mapTypeControl: false,
            });
            mapRef.current = newMap;
        } else if (mapRef.current) {
            mapRef.current.setMapTypeId(mapType);
        }
    }, [ref, mapRef, center, mapType]);

    // Initialize drawing manager for dialog
    useEffect(() => {
        const map = mapRef.current;
        if (map && !drawingManager && isDialog) {
            const manager = new google.maps.drawing.DrawingManager({
                drawingMode: null,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [google.maps.drawing.OverlayType.POLYGON],
                },
                polygonOptions: {
                    fillColor: '#74B72E',
                    fillOpacity: 0.5,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    clickable: false,
                    editable: true,
                    zIndex: 1,
                },
            });
            manager.setMap(map);
            setDrawingManager(manager);

            google.maps.event.addListener(manager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
                onPolygonComplete(polygon);
                manager.setDrawingMode(null); // Exit drawing mode
            });
        }
    }, [mapRef, drawingManager, onPolygonComplete, isDialog]);
    
     // Render initial polygon for editing
    useEffect(() => {
        const map = mapRef.current;
        if (map && initialPolygon && initialPolygon.length > 0) {
            const existingPolygon = new google.maps.Polygon({
                paths: initialPolygon,
                fillColor: '#74B72E',
                fillOpacity: 0.5,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
                clickable: false,
                editable: true,
                zIndex: 1,
            });
            existingPolygon.setMap(map);
            onPolygonComplete(existingPolygon);
            const bounds = new google.maps.LatLngBounds();
            initialPolygon.forEach(coord => bounds.extend(coord));
            map.fitBounds(bounds);
        }
    }, [mapRef, initialPolygon, onPolygonComplete]);


    // Draw saved fields on map
    useEffect(() => {
        const map = mapRef.current;
        if (map && !isDialog) {
            // Clear old polygons
            drawnPolygonsRef.current.forEach(p => p.setMap(null));
            drawnPolygonsRef.current.clear();

            fields.forEach(field => {
                const isSelected = field.id === activeFieldId;
                const polygon = new google.maps.Polygon({
                    paths: field.coordinates,
                    fillColor: isSelected ? '#D6AD60' : '#74B72E',
                    fillOpacity: isSelected ? 0.7 : 0.4,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    clickable: true,
                    zIndex: isSelected ? 3 : 2,
                });
                polygon.setMap(map);
                google.maps.event.addListener(polygon, 'click', () => {
                    onFieldClick(field.id);
                });
                drawnPolygonsRef.current.set(field.id, polygon);
            });
        }
    }, [mapRef, fields, onFieldClick, activeFieldId, isDialog]);


    return (
        <div className="relative h-full w-full">
            <div ref={ref} id="map" className="h-full w-full rounded-lg" />
            {isDialog && (
                 <div className="absolute top-3 left-3 flex gap-1 bg-background p-1 rounded-md shadow-lg">
                    <Button size="sm" variant={mapType === 'roadmap' ? 'secondary' : 'ghost'} onClick={() => setMapType('roadmap')}>Map</Button>
                    <Button size="sm" variant={mapType === 'hybrid' ? 'secondary' : 'ghost'} onClick={() => setMapType('hybrid')}>Satellite</Button>
                </div>
            )}
        </div>
    );
}
// #endregion

// #region Main Component
export default function FieldMappingClient() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [fields, setFields] = useState<Field[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>({ lat: 20.5937, lng: 78.9629 }); // Default to India center
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<Field | null>(null);
    const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const userMarkerRef = useRef<google.maps.Marker | null>(null);

    // Get user's current location once
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    console.log("Location access denied by user.");
                },
                { enableHighAccuracy: true }
            );
        }
    }, []);

    // Fetch saved fields and crops from Firestore
    const refreshData = useCallback(async (currentUser: User) => {
        setIsLoading(true);
        try {
            const [fetchedFields, fetchedCrops] = await Promise.all([
                getFields(currentUser.uid),
                getCrops(currentUser.uid)
            ]);
            setFields(fetchedFields);
            setCrops(fetchedCrops);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load farm data." });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (user) {
            refreshData(user);
        } else {
            setIsLoading(false);
        }
    }, [user, refreshData]);

    const handleAddNew = () => {
        setEditingField(null);
        setActiveFieldId(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (field: Field) => {
        setEditingField(field);
        setActiveFieldId(field.id);
        setIsDialogOpen(true);
    };

    const handleDelete = async (fieldId: string) => {
        if (!user || !confirm("Are you sure you want to delete this field?")) return;
        const result = await deleteField(user.uid, fieldId);
        if (result.success) {
            toast({ title: "Field deleted successfully." });
            await refreshData(user);
            setActiveFieldId(null);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    const handleFieldClick = (fieldId: string) => {
        setActiveFieldId(fieldId);
        const field = fields.find(f => f.id === fieldId);
        if (field && mapRef.current) {
            mapRef.current.panTo(field.centroid);
            mapRef.current.setZoom(17);
        }
    };

    const handleTrackLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                mapRef.current?.setCenter(pos);
                mapRef.current?.setZoom(18);

                if (userMarkerRef.current) {
                    userMarkerRef.current.setPosition(pos);
                } else {
                    userMarkerRef.current = new window.google.maps.Marker({
                        position: pos,
                        map: mapRef.current,
                        title: "Your Location",
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "white",
                        },
                    });
                }
                toast({ title: "Location Found", description: "Map centered on your current location." });
            }, () => {
                toast({ variant: "destructive", title: "Location Error", description: "Unable to retrieve your location. Please check browser permissions." });
            });
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg"><MapIcon className="h-8 w-8 text-primary" /></div>
                <div>
                    <h1 className="text-3xl font-bold font-headline">Field Mapping</h1>
                    <p className="text-muted-foreground">Draw, measure, and manage your field boundaries.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[calc(100vh-20rem)] lg:h-auto lg:min-h-[500px] bg-muted rounded-lg flex items-center justify-center relative">
                    <MapComponent 
                        mapRef={mapRef}
                        center={userLocation} 
                        fields={fields}
                        activeFieldId={activeFieldId}
                        onFieldClick={handleFieldClick}
                        onPolygonComplete={() => {}}
                    />
                    <Button 
                        size="icon" 
                        className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg"
                        onClick={handleTrackLocation}
                        aria-label="Find my location"
                    >
                        <LocateFixed className="h-5 w-5" />
                    </Button>
                </div>

                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><List /> My Fields</CardTitle>
                            <CardDescription>Your saved field boundaries.</CardDescription>
                        </div>
                        <Button size="sm" onClick={handleAddNew}><Plus className="mr-2 h-4 w-4"/> Add Field</Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                            </div>
                        ) : fields.length > 0 ? (
                            <ScrollArea className="h-[400px]">
                                <ul className="space-y-2 pr-4">
                                    {fields.map(field => (
                                        <li key={field.id}>
                                            <div
                                                onClick={() => handleFieldClick(field.id)}
                                                className={`p-3 rounded-md cursor-pointer border-2 transition-colors ${activeFieldId === field.id ? 'border-primary bg-primary/10' : 'bg-muted/50 hover:bg-muted'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{field.fieldName}</p>
                                                        {field.cropName && (
                                                            <p className="text-sm text-primary font-medium flex items-center gap-1.5"><Leaf className="h-3 w-3" /> {field.cropName}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">Survey #: {field.surveyNumber} ({field.village})</p>
                                                        <p className="text-sm text-muted-foreground mt-1">{field.area.toFixed(2)} acres / {field.perimeter.toFixed(1)} m</p>
                                                    </div>
                                                    <div className="flex items-center flex-shrink-0">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(field); }}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(field.id); }}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        ) : (
                            <div className="text-center py-10">
                                <Pin className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">No Fields Saved</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Click "Add Field" to draw your first boundary.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <FieldFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                field={editingField}
                onFormSubmit={() => user && refreshData(user)}
                center={userLocation}
                availableCrops={crops}
                user={user}
            />
        </div>
    );
}
// #endregion

// #region FormDialog Component
interface FieldFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  field: Field | null;
  onFormSubmit: () => void;
  center: google.maps.LatLngLiteral;
  availableCrops: Crop[];
  user: User | null;
}

function FieldFormDialog({ isOpen, onOpenChange, field, onFormSubmit, center, availableCrops, user }: FieldFormDialogProps) {
    const { toast } = useToast();
    const [fieldName, setFieldName] = useState('');
    const [surveyNumber, setSurveyNumber] = useState('');
    const [village, setVillage] = useState('');
    const [cropId, setCropId] = useState<string | null>(null);
    const [area, setArea] = useState(0);
    const [perimeter, setPerimeter] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dialogMapRef = useRef<google.maps.Map | null>(null);
    const drawnPolygonRef = useRef<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFieldName(field?.fieldName || '');
            setSurveyNumber(field?.surveyNumber || '');
            setVillage(field?.village || '');
            setCropId(field?.cropId || null);
            setArea(field?.area || 0);
            setPerimeter(field?.perimeter || 0);
            drawnPolygonRef.current = null;
            dialogMapRef.current = null;
        }
    }, [isOpen, field]);
    
    const updateMeasurements = useCallback(() => {
        if (drawnPolygonRef.current) {
            const path = drawnPolygonRef.current.getPath().getArray().map(p => p.toJSON());
            setArea(calculatePolygonArea(path));
            setPerimeter(calculatePolygonPerimeter(path));
        }
    }, []);

    const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
        if (drawnPolygonRef.current) {
            drawnPolygonRef.current.setMap(null);
        }
        drawnPolygonRef.current = polygon;
        updateMeasurements();

        const path = polygon.getPath();
        google.maps.event.addListener(path, 'set_at', updateMeasurements);
        google.maps.event.addListener(path, 'insert_at', updateMeasurements);
        google.maps.event.addListener(path, 'remove_at', updateMeasurements);
    }, [updateMeasurements]);


    const handleResetDrawing = () => {
        if(drawnPolygonRef.current) {
            drawnPolygonRef.current.setMap(null);
            drawnPolygonRef.current = null;
        }
        setArea(0);
        setPerimeter(0);
    }
    
    const handleSubmit = async () => {
        if (!fieldName || !surveyNumber || !village) {
            toast({ variant: 'destructive', title: "Missing Details", description: "Please fill in all field details." });
            return;
        }
        if (!drawnPolygonRef.current) {
            toast({ variant: 'destructive', title: "No Boundary", description: "Please draw the field boundary on the map." });
            return;
        }
        if (!user) {
            toast({ variant: 'destructive', title: "Authentication Error" });
            return;
        }

        setIsSubmitting(true);
        
        const coordinates = drawnPolygonRef.current.getPath().getArray().map(p => p.toJSON());
        const centroid = calculatePolygonCentroid(coordinates);
        const selectedCrop = availableCrops.find(c => c.id === cropId);

        const fieldData = {
            fieldName,
            surveyNumber,
            village,
            area,
            perimeter,
            coordinates,
            centroid,
            cropId: selectedCrop?.id || null,
            cropName: selectedCrop?.name || null,
        };

        const result = field ? await updateField(user.uid, field.id, fieldData) : await addField(user.uid, fieldData);

        if (result.success) {
            toast({ title: `Field ${field ? 'updated' : 'saved'} successfully.` });
            onFormSubmit();
            onOpenChange(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{field ? 'Edit Field Boundary' : 'Add New Field'}</DialogTitle>
                    <DialogDescription>Draw the boundary on the map and enter the field details.</DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                    <div className="md:col-span-2 h-full min-h-[250px] md:min-h-0 rounded-lg bg-muted flex items-center justify-center">
                        {isOpen && (
                                <MapComponent 
                                    mapRef={dialogMapRef}
                                    center={field?.centroid || center} 
                                    fields={[]}
                                    onPolygonComplete={handlePolygonComplete}
                                    activeFieldId={null}
                                    onFieldClick={() => {}}
                                    initialPolygon={field?.coordinates}
                                    isDialog={true}
                                />
                        )}
                    </div>
                    <div className="md:col-span-1 flex flex-col min-h-0">
                         <ScrollArea className="flex-1 pr-3">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader><CardTitle>Field Details</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="fieldName">Field Name</Label>
                                            <Input id="fieldName" value={fieldName} onChange={(e) => setFieldName(e.target.value)} placeholder="e.g., North Field" disabled={isSubmitting} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="surveyNumber">Survey Number</Label>
                                            <Input id="surveyNumber" value={surveyNumber} onChange={(e) => setSurveyNumber(e.target.value)} placeholder="e.g., 123/4A" disabled={isSubmitting} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="village">Village</Label>
                                            <Input id="village" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="e.g., Rampur" disabled={isSubmitting} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="crop">Crop (Optional)</Label>
                                            <Select
                                                onValueChange={(v) => setCropId(v === 'none' ? null : v)}
                                                value={cropId || 'none'}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a crop" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {availableCrops.map(crop => (
                                                        <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Measurements</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2"><Maximize className="h-5 w-5"/>{area.toFixed(3)}</p>
                                            <p className="text-xs text-muted-foreground">acres</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2"><Ruler className="h-5 w-5"/>{perimeter.toFixed(1)}</p>
                                            <p className="text-xs text-muted-foreground">meters</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="mt-4 flex-shrink-0 flex sm:justify-between w-full">
                    <Button variant="outline" onClick={handleResetDrawing} disabled={isSubmitting} className="hidden sm:inline-flex">
                        <Redo className="mr-2 h-4 w-4"/> Clear Drawing
                    </Button>
                    <div className="flex gap-2 ml-auto">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Saving...' : <>{field ? 'Update Field' : 'Save Field'}</>}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
// #endregion
