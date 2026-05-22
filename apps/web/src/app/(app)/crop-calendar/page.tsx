
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { getCrops, updateCrop } from '@/lib/actions/crops';
import type { Crop, CropTask } from '@/types';
import { CalendarDays, Check, Circle, Loader2, Info } from 'lucide-react';
import { format, isToday, isFuture, isPast, startOfToday } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface TaskItem extends CropTask {
  cropId: string;
  cropName: string;
  taskIndex: number;
}

export default function CropCalendarPage() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCrops = useCallback(async (currentUser: User) => {
    setIsLoading(true);
    try {
      const fetchedCrops = await getCrops(currentUser.uid);
      setCrops(fetchedCrops);
    } catch (error) {
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
    }
  }, [user, fetchCrops]);

  const allTasks = useMemo((): TaskItem[] => {
    return crops.flatMap(crop => 
      crop.calendar.map((task, index) => ({
        ...task,
        cropId: crop.id,
        cropName: crop.name,
        taskIndex: index,
      }))
    ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [crops]);
  
  const upcomingTasks = allTasks.filter(task => !task.isCompleted);
  const completedTasks = allTasks.filter(task => task.isCompleted);

  const handleTaskToggle = async (task: TaskItem, isCompleted: boolean) => {
    if (!user) return;
    const taskId = `${task.cropId}-${task.taskIndex}`;
    setTogglingTaskId(taskId);

    const originalCrops = JSON.parse(JSON.stringify(crops)); // Deep copy for rollback
    const cropToUpdate = crops.find(c => c.id === task.cropId);
    
    if (cropToUpdate) {
        const updatedCalendar = [...cropToUpdate.calendar];
        updatedCalendar[task.taskIndex] = { ...updatedCalendar[task.taskIndex], isCompleted };
        
        // Optimistic UI update
        const updatedCrops = crops.map(c => c.id === task.cropId ? { ...c, calendar: updatedCalendar } : c);
        setCrops(updatedCrops);

        const result = await updateCrop(user.uid, task.cropId, { calendar: updatedCalendar });

        if (!result.success) {
            toast({ variant: "destructive", title: "Update failed", description: "Could not save task status." });
            setCrops(originalCrops); // Rollback
        }
    }
    setTogglingTaskId(null);
  };

  const groupTasksByDate = (tasks: TaskItem[]) => {
    return tasks.reduce((acc, task) => {
      const dateKey = format(task.startDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {} as Record<string, TaskItem[]>);
  };

  const groupedUpcomingTasks = groupTasksByDate(upcomingTasks);
  const groupedCompletedTasks = groupTasksByDate(completedTasks);

  const renderTaskList = (groupedTasks: Record<string, TaskItem[]>) => {
    if (Object.keys(groupedTasks).length === 0) {
      return (
        <div className="text-center py-10">
          <Info className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Tasks Here</h3>
          <p className="mt-1 text-sm text-muted-foreground">This section is currently empty.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([date, tasks]) => {
          const taskDate = new Date(date);
          let dateLabel = format(taskDate, 'EEEE, d MMMM yyyy');
          if (isToday(taskDate)) dateLabel = `Today, ${dateLabel}`;
          
          return (
            <div key={date}>
              <h3 className="font-semibold text-lg mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-2">{dateLabel}</h3>
              <ul className="space-y-3">
                {tasks.map(task => (
                  <li key={`${task.cropId}-${task.taskIndex}`}>
                    <Card className="p-4 flex items-center gap-4">
                      <Checkbox
                        id={`${task.cropId}-${task.taskIndex}`}
                        checked={task.isCompleted}
                        onCheckedChange={(checked) => handleTaskToggle(task, !!checked)}
                        disabled={togglingTaskId === `${task.cropId}-${task.taskIndex}`}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`${task.cropId}-${task.taskIndex}`} className="font-semibold text-base">
                          {task.taskName}
                        </Label>
                        <p className="text-sm text-muted-foreground">{task.cropName}</p>
                      </div>
                      {togglingTaskId === `${task.cropId}-${task.taskIndex}` && <Loader2 className="h-5 w-5 animate-spin" />}
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <CalendarDays className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Crop Calendar</h1>
          <p className="text-muted-foreground">
            A timeline of all your farming tasks and activities.
          </p>
        </div>
      </div>
      
      {isLoading ? (
         <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
         </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {renderTaskList(groupedUpcomingTasks)}
          </TabsContent>
          <TabsContent value="completed">
            {renderTaskList(groupedCompletedTasks)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
