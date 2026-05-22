
"use client";

import * as React from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Camera, ImageIcon, File as FileIcon } from "lucide-react"; // Renamed File to FileIcon to avoid conflict

interface FileUploadManagerProps {
  userId: string;
  onUploadComplete?: (url: string) => void;
}

interface UploadTask {
  id: number;
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

export function FileUploadManager({
  userId,
  onUploadComplete,
}: FileUploadManagerProps) {
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [uploads, setUploads] = React.useState<UploadTask[]>([]);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    // Cleanup camera stream when component unmounts or dialog closes
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0 || !userId) {
      return;
    }

    const newUploads: UploadTask[] = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      progress: 0,
    }));
    
    setUploads((prev) => [...prev, ...newUploads]);
    newUploads.forEach((task) => uploadFile(task));
    setIsSheetOpen(false); // Close sheet after selection
  };
  
  const startCamera = async () => {
    setIsSheetOpen(false); // Close the action sheet first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }});
            setIsCameraOpen(true);
            // We need a slight delay to ensure the dialog is rendered before attaching the stream
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (error) {
            console.error("Error accessing camera:", error);
            toast({ variant: "destructive", title: "Camera Error", description: "Could not access the camera. Please check permissions."});
        }
    } else {
        toast({ variant: "destructive", title: "Unsupported", description: "Your browser does not support camera access."});
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        canvas.toBlob(blob => {
            if (blob) {
                const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                handleFileSelect([capturedFile] as unknown as FileList);
            }
        }, 'image/jpeg');
        
        stopCamera();
    }
  };

  const uploadFile = (task: UploadTask) => {
    if (!userId) {
        updateTask(task.id, { error: "You must be logged in to upload files." });
        return;
    }

    const storage = getStorage();
    const db = getFirestore();

    const storageRef = ref(
      storage,
      `uploads/${userId}/${Date.now()}-${task.file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, task.file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        updateTask(task.id, { progress: percent });
      },
      (error) => {
        console.error("Upload error:", error);
        updateTask(task.id, { error: "Upload failed. Please try again." });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(
            collection(db, `users/${userId}/uploads`),
            {
              name: task.file.name,
              type: task.file.type,
              size: task.file.size,
              url: downloadURL,
              uploadedAt: serverTimestamp(),
            }
          );
          
          updateTask(task.id, { progress: 100, url: downloadURL });
          toast({ title: "Upload Complete", description: `${task.file.name} has been uploaded.`});
          onUploadComplete?.(downloadURL);

        } catch (error) {
            console.error("Firestore error:", error);
            updateTask(task.id, { error: "Failed to save file details." });
        }
      }
    );
  };
  
  const updateTask = (id: number, updates: Partial<UploadTask>) => {
      setUploads(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  return (
    <div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button>
            <Upload className="mr-2 h-4 w-4" /> Upload File
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Choose an upload option</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base"
              onClick={startCamera}
            >
              <Camera className="mr-4 h-6 w-6" /> Capture with Camera
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base"
              onClick={() => {
                  fileInputRef.current?.click();
              }}
            >
              <FileIcon className="mr-4 h-6 w-6" /> Choose from Files
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Camera</DialogTitle>
            </DialogHeader>
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md border aspect-video object-cover bg-black"></video>
            <DialogFooter>
                <Button onClick={handleCapture}>Capture Photo</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden inputs and canvas */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      {uploads.length > 0 && (
          <div className="mt-4 space-y-4">
              <h3 className="font-semibold">Uploads</h3>
              {uploads.map(task => (
                  <Card key={task.id}>
                    <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                             <div className="flex-shrink-0 bg-muted p-2 rounded-md">
                                {task.file.type.startsWith('image/') ? <ImageIcon className="h-6 w-6" /> : <FileIcon className="h-6 w-6" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{task.file.name}</p>
                                <p className="text-xs text-muted-foreground">{ (task.file.size / 1024 / 1024).toFixed(2) } MB</p>
                                <Progress value={task.progress} className="mt-1 h-2" />
                            </div>
                        </div>
                        {task.error && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertDescription>{task.error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                  </Card>
              ))}
          </div>
      )}
    </div>
  );
}
