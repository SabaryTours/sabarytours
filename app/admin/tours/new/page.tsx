import TourForm from "../components/TourForm";

export default function NewTourPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Create New Tour</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">Fill in the details below to add a new package.</p>
      </div>
      <TourForm />
    </div>
  );
}
