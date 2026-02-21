import { Suspense } from "react";
import BookingErrorPage from "../../pages/BookingErrorPage";
import TourLoader from "../../components/TourLoader";

export default function BookingErrorRoute() {
  return (
    <Suspense fallback={<TourLoader />}>
      <BookingErrorPage />
    </Suspense>
  );
}

