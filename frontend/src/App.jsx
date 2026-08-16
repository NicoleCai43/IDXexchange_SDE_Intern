import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListingPage from "./components/ListingPage.jsx";
import PropertyDetailPage from "./components/PropertyDetailPage.jsx";
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
