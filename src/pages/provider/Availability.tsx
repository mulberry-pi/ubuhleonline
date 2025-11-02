import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Save, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface BlockedSlot {
  id: string;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Availability() {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newBlockStart, setNewBlockStart] = useState("");
  const [newBlockEnd, setNewBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load working hours
      const { data: hoursData, error: hoursError } = await supabase
        .from("provider_working_hours")
        .select("*")
        .eq("provider_id", user.id)
        .order("day_of_week");

      if (hoursError) throw hoursError;

      // Load blocked slots
      const { data: blockedData, error: blockedError } = await supabase
        .from("blocked_time_slots")
        .select("*")
        .eq("provider_id", user.id)
        .gte("blocked_date", new Date().toISOString().split('T')[0])
        .order("blocked_date");

      if (blockedError) throw blockedError;

      setWorkingHours(hoursData || []);
      setBlockedSlots(blockedData || []);
    } catch (error) {
      console.error("Error loading availability:", error);
      toast({
        title: "Error",
        description: "Failed to load availability settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setDefaultHours = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Default: Mon-Fri 9AM-5PM, available
      const defaultHours = [1, 2, 3, 4, 5].map(day => ({
        provider_id: user.id,
        day_of_week: day,
        start_time: "09:00",
        end_time: "17:00",
        is_available: true,
      }));

      const { error } = await supabase
        .from("provider_working_hours")
        .insert(defaultHours);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default working hours set (Mon-Fri, 9AM-5PM)",
      });

      await loadAvailability();
    } catch (error) {
      console.error("Error setting default hours:", error);
      toast({
        title: "Error",
        description: "Failed to set default hours",
        variant: "destructive",
      });
    }
  };

  const addWorkingHour = async (dayOfWeek: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("provider_working_hours")
        .insert({
          provider_id: user.id,
          day_of_week: dayOfWeek,
          start_time: "09:00",
          end_time: "17:00",
          is_available: true,
        });

      if (error) throw error;
      await loadAvailability();

      toast({
        title: "Success",
        description: "Working hours added",
      });
    } catch (error) {
      console.error("Error adding working hour:", error);
      toast({
        title: "Error",
        description: "Failed to add working hours",
        variant: "destructive",
      });
    }
  };

  const updateWorkingHour = async (id: string, field: string, value: string | boolean) => {
    try {
      const { error } = await supabase
        .from("provider_working_hours")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;

      setWorkingHours(prev =>
        prev.map(wh => (wh.id === id ? { ...wh, [field]: value } : wh))
      );
    } catch (error) {
      console.error("Error updating working hour:", error);
      toast({
        title: "Error",
        description: "Failed to update working hours",
        variant: "destructive",
      });
    }
  };

  const deleteWorkingHour = async (id: string) => {
    try {
      const { error } = await supabase
        .from("provider_working_hours")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setWorkingHours(prev => prev.filter(wh => wh.id !== id));

      toast({
        title: "Success",
        description: "Working hours removed",
      });
    } catch (error) {
      console.error("Error deleting working hour:", error);
      toast({
        title: "Error",
        description: "Failed to delete working hours",
        variant: "destructive",
      });
    }
  };

  const addBlockedSlot = async () => {
    if (!selectedDate || !newBlockStart || !newBlockEnd) {
      toast({
        title: "Missing information",
        description: "Please select a date and time range",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("blocked_time_slots")
        .insert({
          provider_id: user.id,
          blocked_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: newBlockStart,
          end_time: newBlockEnd,
          reason: blockReason || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot blocked",
      });

      setSelectedDate(undefined);
      setNewBlockStart("");
      setNewBlockEnd("");
      setBlockReason("");
      await loadAvailability();
    } catch (error) {
      console.error("Error blocking time slot:", error);
      toast({
        title: "Error",
        description: "Failed to block time slot",
        variant: "destructive",
      });
    }
  };

  const deleteBlockedSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from("blocked_time_slots")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBlockedSlots(prev => prev.filter(bs => bs.id !== id));

      toast({
        title: "Success",
        description: "Blocked slot removed",
      });
    } catch (error) {
      console.error("Error deleting blocked slot:", error);
      toast({
        title: "Error",
        description: "Failed to delete blocked slot",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Availability Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your working hours and block specific time slots
        </p>
      </div>

      <Tabs defaultValue="working-hours" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="working-hours">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="blocked-slots">Blocked Time Slots</TabsTrigger>
        </TabsList>

        <TabsContent value="working-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Working Hours</CardTitle>
              <CardDescription>
                Set your recurring weekly schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workingHours.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No working hours set</p>
                  <Button onClick={setDefaultHours}>
                    Set Default Hours (Mon-Fri, 9AM-5PM)
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {DAYS.map((day, dayIndex) => {
                    const dayHours = workingHours.filter(wh => wh.day_of_week === dayIndex);
                    
                    return (
                      <div key={dayIndex} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{day}</h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addWorkingHour(dayIndex)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Hours
                          </Button>
                        </div>

                        {dayHours.length === 0 ? (
                          <p className="text-sm text-muted-foreground pl-4">Not available</p>
                        ) : (
                          <div className="space-y-2 pl-4">
                            {dayHours.map(wh => (
                              <div key={wh.id} className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={wh.start_time}
                                  onChange={(e) => updateWorkingHour(wh.id, "start_time", e.target.value)}
                                  className="w-32"
                                />
                                <span>to</span>
                                <Input
                                  type="time"
                                  value={wh.end_time}
                                  onChange={(e) => updateWorkingHour(wh.id, "end_time", e.target.value)}
                                  className="w-32"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteWorkingHour(wh.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked-slots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Block Specific Time Slots</CardTitle>
              <CardDescription>
                Block out specific dates and times when you're unavailable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Time Range</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={newBlockStart}
                      onChange={(e) => setNewBlockStart(e.target.value)}
                      placeholder="Start"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={newBlockEnd}
                      onChange={(e) => setNewBlockEnd(e.target.value)}
                      placeholder="End"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g., Personal appointment, vacation, etc."
                  rows={2}
                />
              </div>

              <Button onClick={addBlockedSlot} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Block Time Slot
              </Button>

              <div className="space-y-2">
                <h3 className="font-semibold">Upcoming Blocked Slots</h3>
                {blockedSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No blocked time slots</p>
                ) : (
                  <div className="space-y-2">
                    {blockedSlots.map(slot => (
                      <Card key={slot.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">
                                {format(new Date(slot.blocked_date), "EEEE, MMMM d, yyyy")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {slot.start_time} - {slot.end_time}
                              </p>
                              {slot.reason && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {slot.reason}
                                </p>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteBlockedSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
