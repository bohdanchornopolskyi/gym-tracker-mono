import { router } from "expo-router";
import { WorkoutFormModal } from "./(drawer)/(tabs)/components/workout-form-modal";

export default function WorkoutCreateModal() {
  const handleClose = () => {
    router.back();
  };

  const handleSuccess = () => {
    router.back();
  };

  return <WorkoutFormModal onClose={handleClose} onSuccess={handleSuccess} />;
}
