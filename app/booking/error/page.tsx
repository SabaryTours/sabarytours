import { Suspense } from "react";
import BookingErrorPage from "../../pages/BookingErrorPage";

export default function BookingErrorRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingErrorPage />
    </Suspense>
  );
}

