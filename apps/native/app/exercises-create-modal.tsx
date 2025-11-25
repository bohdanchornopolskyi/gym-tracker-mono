import { router } from "expo-router";
import { ExerciseFormModal } from "./(drawer)/(tabs)/components/exercise-form-modal";

export default function ExercisesCreateModal() {
	const handleClose = () => {
		router.back();
	};

	const handleSuccess = () => {
		router.back();
	};

	return <ExerciseFormModal onClose={handleClose} onSuccess={handleSuccess} />;
}

