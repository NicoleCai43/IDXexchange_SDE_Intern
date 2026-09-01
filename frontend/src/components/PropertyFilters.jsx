import { useState } from "react";
import PropTypes from "prop-types";

const bedOptions = ["", "1", "2", "3", "4", "5+"];
const bathOptions = ["", "1", "2", "3", "4+"];

export default function PropertyFilters({ initialFilters, onSearch, onClear }) {
  const [formValues, setFormValues] = useState({
    city: initialFilters.city || "",
    zip: initialFilters.zip || "",
    minPrice: initialFilters.minPrice || "",
    maxPrice: initialFilters.maxPrice || "",
    beds: initialFilters.beds || "",
    baths: initialFilters.baths || "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const filters = Object.entries(formValues).reduce((acc, [key, value]) => {
      if (value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    onSearch(filters);
  }

  function handleReset() {
    const cleared = {
      city: "",
      zip: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
    };

    setFormValues(cleared);
    onClear();
  }

  return (
    <section className="filter-panel">
      <form className="filter-form" onSubmit={handleSubmit}>
        <div className="filter-row">
          <label>
            City
            <input
              name="city"
              value={formValues.city}
              onChange={handleChange}
              placeholder="e.g. Austin"
            />
          </label>

          <label>
            ZIP code
            <input
              name="zip"
              value={formValues.zip}
              onChange={handleChange}
              placeholder="e.g. 78701"
            />
          </label>

          <label>
            Min price
            <input
              name="minPrice"
              type="number"
              min="0"
              value={formValues.minPrice}
              onChange={handleChange}
              placeholder="0"
            />
          </label>

          <label>
            Max price
            <input
              name="maxPrice"
              type="number"
              min="0"
              value={formValues.maxPrice}
              onChange={handleChange}
              placeholder="0"
            />
          </label>

          <label>
            Beds
            <select name="beds" value={formValues.beds} onChange={handleChange}>
              {bedOptions.map((option) => (
                <option key={option} value={option}>
                  {option || "Any"}
                </option>
              ))}
            </select>
          </label>

          <label>
            Baths
            <select name="baths" value={formValues.baths} onChange={handleChange}>
              {bathOptions.map((option) => (
                <option key={option} value={option}>
                  {option || "Any"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-actions">
          <button type="submit">Search</button>
          <button type="button" onClick={handleReset} className="clear-button">
            Clear Filters
          </button>
        </div>
      </form>
    </section>
  );
}

PropertyFilters.propTypes = {
  initialFilters: PropTypes.shape({
    city: PropTypes.string,
    zip: PropTypes.string,
    minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    beds: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    baths: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
};
