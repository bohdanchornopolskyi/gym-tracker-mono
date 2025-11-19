import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkoutDetailsCardProps {
  date: string;
  notes: string;
  onDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
}

export default function WorkoutDetailsCard({
  date,
  notes,
  onDateChange,
  onNotesChange,
}: WorkoutDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            placeholder="How did you feel today?"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
