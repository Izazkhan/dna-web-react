import React, { useRef, useState } from "react";
import useAxios from "../../../hooks/use-axios";
import { useEffect } from "react";

const LocationDropdown = ({ onChange, displayName }) => {
  const [selectedLocation, setSelectedLocation] = useState(""); // Selected state or empty for "Any"
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);

  // Use useEffect to set selectedLocation when initialLocation changes
  useEffect(() => {
    if (displayName) {
      setSelectedLocation(displayName);
    } else {
      setSelectedLocation(""); // Clear if no initial location
    }
  }, [displayName]);
  const [locData, setLocData] = useState([]);
  const axios = useAxios();
  const debounce = useRef(null);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (!searchQuery.trim()) {
      return;
    }
    debounce.current = setTimeout(async () => {
      const result = await axios({
        url: "/locations/search",
        params: {
          q: searchQuery.trim(),
        },
      });
      setLocData(result.data);
    }, 400);
  }, [searchQuery]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery("");
      if (isFirstOpen) {
        setSelectedLocation("");
        setIsFirstOpen(false);
        onChange({
          city: null,
          state: null,
          country_id: 233,
          radius_miles: 5, // Default radius
        });
      }
    }
  };

  // Select state
  const selectLocation = (location) => {
    setSelectedLocation(location.display_name);
    setIsOpen(false);
    setSearchQuery("");
    console.log(location, "Here");
    onChange(location);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest(".b-select")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="mb-3">
      <label>Audience Location</label>
      <div className="b-select">
        <button
          type="button"
          className="btn form-control b-select-btn text-ellipsis"
          aria-expanded={isOpen}
          onClick={toggleDropdown}
        >
          {selectedLocation || "Any"}
        </button>
        {isOpen && (
          <div className="b-select-container">
            <div className="b-select-searchbox">
              <input
                type="text"
                className="form-control b-select-search"
                placeholder="Search states or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                role="combobox"
                aria-label="Search states or cities"
                autoFocus
              />
            </div>
            <div className="b-select-options-container">
              <ul className="b-select-options" role="listbox">
                {locData.length > 0 ? (
                  locData.map((loc, index) => (
                    <React.Fragment
                      key={`${loc.state.id}${loc?.city?.id ?? ""}`}
                    >
                      <li
                        className={`b-select-option ${
                          selectedLocation == loc.display_name ? "selected" : ""
                        }`}
                        onClick={() => selectLocation(loc)}
                        role="option"
                        aria-selected={selectedLocation == loc.display_name}
                      >
                        {loc.display_name}
                      </li>
                    </React.Fragment>
                  ))
                ) : searchQuery.length ? (
                  <li className="b-select-option" role="option">
                    No states or cities found
                  </li>
                ) : (
                  ""
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      <small id="state_id_error" className="text-danger error"></small>
    </div>
  );
};

export default LocationDropdown;
