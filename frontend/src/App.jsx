import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListingPage from "./pages/ListingPage.jsx";
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<ListingPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
