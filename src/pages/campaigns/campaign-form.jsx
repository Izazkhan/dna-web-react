import React, { useState, useRef, useEffect, useContext } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Quill styles
import LocationDropdown from "./components/location-dropdown";
import AdCampaignContext from "../../context/ad-campaign-provider";

const CampaignForm = ({ initialData, onSubmit, platform, isEditMode }) => {
  const [useGender, setUseGender] = useState(true);
  const [genderRatio, setGenderRatio] = useState(50);
  const [maxBudget, setMaxBudget] = useState(5);
  const [price, setPrice] = useState("5.00");
  const [locDisplayName, setLocDisplayName] = useState("");

  const [form, setForm] = useState({
    platform: platform,
    name: "",
    demographics: { age_range_ids: [], use_gender: true },
    follower_min: null,
    likes_min: null,
    story_impressions_min: null,
    ad_campaign_engagement_range_id: 1, //Any
    draft_date: "",
    is_approval_required: false,
    publish_from: "",
    publish_until: "",
    published: false,
    is_test: false,
    ad_campaign_deliverable_id: "",
    price: 500, // price in cents
    description: "",
    content_link: "",
    meta: {},
  });
  const [errors, setErrors] = useState({});
  const quillRef = useRef(null);
  const quillContainerRef = useRef(null);
  const { data } = useContext(AdCampaignContext);

  const handlePriceChange = (e) => {
    let value = e.target.value;

    // Only allow numbers and one dot
    value = value.replace(/[^0-9.]/g, "");

    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }

    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + "." + parts[1].substring(0, 2);
    }

    setPrice(value);
  };

  const handlePriceBlur = () => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice)) {
      setPrice(numericPrice.toFixed(2));
    } else {
      setPrice("0.00"); // Default to "0.00" if input is invalid
    }
  };

  useEffect(() => {
    const priceInCents = Math.round(parseFloat(price) * 100);
    setMaxBudget(priceInCents / 100);
    setForm((prev) => ({
      ...prev,
      price: isNaN(priceInCents) ? 0 : priceInCents,
    }));
  }, [price]);

  useEffect(() => {
    if (initialData) {
      let { location_display_name, ...restData } = initialData;
      setLocDisplayName(location_display_name);
      setForm((prev) => ({
        ...prev,
        ...restData,
        price: Math.round(parseFloat(restData.price) * 100), // Convert restData.price (dollars string) to cents for form.price
        meta: {
          ...restData.meta,
          max_budget:
            restData.meta?.max_budget ||
            Math.round(parseFloat(restData.price) * 100),
        },
      }));
      if (restData.demographics?.use_gender) {
        let gr =
          restData.demographics.percent_male == 50
            ? 50
            : restData.demographics.percent_male > 50
            ? 0
            : 100;
        setUseGender(true);
        setGenderRatio(gr); // restData.price is already in dollars (string)
      } else {
        setUseGender(false);
      }
      setPrice(restData.price); // restData.price is already in dollars (string)
    }
  }, [initialData]);

  // Quill setup
  useEffect(() => {
    let quill;
    if (quillContainerRef.current && !quillRef.current) {
      quill = new Quill(quillContainerRef.current, {
        theme: "snow",
        modules: {
          toolbar: [["bold", "italic"], [{ list: "bullet" }]],
        },
        placeholder: "Enter campaign description...",
      });
      quillRef.current = quill;

      // Populate Quill editor with initial data if available
      if (initialData?.description) {
        quill.clipboard.dangerouslyPasteHTML(initialData.description);
      }

      const textChangeHandler = () => {
        if (quill) {
          if (!quill.getText().trim()) {
            handleInputChange("description", "");
          } else {
            const content = quill.root.innerHTML;
            handleInputChange("description", content);
            setErrors((prev) => ({ ...prev, description: "" }));
          }
        }
      };

      quill.on("text-change", textChangeHandler);
    }

    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (quillContainerRef.current) {
        quillContainerRef.current = null;
      }
      if (quill) {
        quill.off("text-change");
      }
    };
  }, []);

  // Generic input change
  const handleInputChange = (field, value) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Age change
  const handleAgeChange = (ageId) => {
    setForm((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        age_range_ids: prev.demographics.age_range_ids.includes(ageId)
          ? prev.demographics.age_range_ids.filter((id) => id !== ageId)
          : [...prev.demographics.age_range_ids, ageId],
      },
    }));
    setErrors((prev) => ({ ...prev, demographics: "" }));
  };

  // Location change
  const handleLocationChange = (loc) => {
    setForm((prev) => ({
      ...prev,
      locations: [
        {
          city_id: loc.city?.id ?? null,
          state_id: loc.state?.id ?? null,
          country_id: loc.state?.country_id ?? loc.country_id,
          radius_miles: 5, //default
        },
      ],
    }));
  };

  // Toggle gender spec
  const toggleGender = () => {
    setUseGender(!useGender);
    setForm((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        use_gender: !useGender,
      },
    }));
    setGenderRatio(50); // Reset to center
  };

  // Gender slider snap to 3 points (smooth move, snap on release)
  const handleGenderSliderChange = (e) => {
    setGenderRatio(parseInt(e.target.value)); // Smooth during drag
  };

  const handleGenderSliderRelease = (e) => {
    const value = parseInt(e.target.value);
    // Snap to nearest: 0 (More Male), 50 (50-50), 100 (More Female)
    let snapped;
    if (value < 25) snapped = 0;
    else if (value < 75) snapped = 50;
    else snapped = 100;
    setGenderRatio(snapped);
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        percent_male: genderRatio == 50 ? 50 : Math.abs(75 - genderRatio),
        percent_female: genderRatio == 50 ? 50 : Math.abs(25 - genderRatio),
      },
    }));
  }, [genderRatio]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      meta: { max_budget: Math.round(maxBudget * 100) },
    }));
  }, [maxBudget]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Name: required and non-empty after trim
    if (!form.name.trim()) {
      newErrors.name = "Campaign title is required";
    }

    // Demographic: at least one age range selected
    if (form.demographics.age_range_ids.length === 0) {
      newErrors.demographics = "At least one age range must be selected";
    }

    // Follower min: >= 0
    if (form.follower_min < 0) {
      newErrors.follower_min = "Minimum followers must be at least 0";
    }

    // Likes min: >= 0
    if (form.likes_min < 0) {
      newErrors.likes_min = "Minimum likes must be at least 0";
    }

    // Story impressions min: >= 0
    if (form.story_impressions_min < 0) {
      newErrors.story_impressions_min =
        "Minimum story impressions must be at least 0";
    }

    // Engagement range: required
    if (!form.ad_campaign_engagement_range_id) {
      newErrors.ad_campaign_engagement_range_id =
        "Engagement range is required";
    }

    // Draft date: required and valid date
    if (!form.draft_date) {
      const draftDate = new Date(form.draft_date);
      if (isNaN(draftDate.getTime())) {
        newErrors.draft_date = "Draft date must be a valid date";
      }
    }

    // Approval required: boolean, no validation needed

    // Publish from: required and valid date
    if (!form.publish_from) {
      newErrors.publish_from = "Publish from date is required";
    } else {
      const fromDate = new Date(form.publish_from);
      if (isNaN(fromDate.getTime())) {
        newErrors.publish_from = "Publish from must be a valid date";
      } else if (form.draft_date && new Date(form.draft_date) > fromDate) {
        newErrors.publish_from = "Publish from cannot be before draft date";
      }
    }

    // Publish until: required if from is set, valid date, and >= from (can be same)
    if (form.publish_until) {
      const untilDate = new Date(form.publish_until);
      if (isNaN(untilDate.getTime())) {
        newErrors.publish_until = "Publish until must be a valid date";
      } else if (form.publish_from && untilDate < new Date(form.publish_from)) {
        newErrors.publish_until =
          "Publish until must be on or after publish from";
      } else if (form.draft_date && untilDate < new Date(form.draft_date)) {
        newErrors.publish_until = "Publish until cannot be before draft date";
      }
    }

    // Deliverable: required
    if (!form.ad_campaign_deliverable_id) {
      newErrors.ad_campaign_deliverable_id = "Deliverable is required";
    }

    const priceNum = form.price;
    if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = "Price must be a valid number >= 0";
    } else if (priceNum < 500) {
      newErrors.price = "$5 minimum";
    }

    // Description: required
    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Link: required and valid URL format
    if (!form.content_link.trim()) {
      newErrors.content_link = "Link is required";
    } else {
      const strictUrlPattern = /^(https?:\/\/)[a-z0-9.-]+\.[a-z]{2,}.*$/i;
      if (!strictUrlPattern.test(form.content_link.trim())) {
        newErrors.content_link = "Link must be a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // we don't need
      delete form.id;
      delete form.created_at;
      delete form.updated_at;
      onSubmit(form);
    }
  };

  // Conditionals
  const showImpressionsCap = false;
  const showLinkInput = true;

  useEffect(() => {
    console.log(form, errors);
  }, [form]);

  return (
    <>
      <form onSubmit={handleSubmit} id="campaign-form" method="POST">
        {/* Campaign Title */}
        <div className="mb-3">
          <label htmlFor="name">Campaign title</label>
          <input
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            type="text"
            maxLength="70"
            className="form-control outline-0"
            id="name"
            name="name"
            placeholder="Name your campaign..."
          />
          <span className="error-message"></span>
          {errors.name && (
            <small id="name_error" className="text-danger error">
              {errors.name}
            </small>
          )}
        </div>

        {/* Audience Age */}
        <div className="mb-3">
          <label>Audience Age</label>
          <br />
          <small id="age_range_ids_error" className="text-danger error">
            {errors.demographics}
          </small>
          <div className="row">
            {data?.age_ranges?.map((age) => (
              <div key={age.id} className="col-3">
                <div className="form-check">
                  <input
                    className="form-check-input age_range_ids"
                    type="checkbox"
                    checked={form.demographics.age_range_ids.includes(age.id)}
                    onChange={() => handleAgeChange(age.id)}
                    id={`age-${age.id}`}
                  />
                  <label
                    className="form-check-label fw-normal"
                    htmlFor={`age-${age.id}`}
                  >
                    {age.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="mb-3">
          <div className="audience-gender d-flex align-items-center">
            <label>Audience Gender</label>
            <div className="me-5 ms-3 d-inline-block form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={!useGender}
                onChange={toggleGender}
                id="aGender"
              />
              <label className="form-check-label fw-normal" htmlFor="aGender">
                I don't want to specify audience gender
              </label>
            </div>
          </div>
          {useGender && (
            <div className="gender-range d-flex">
              <div className="flex-grow-1 d-flex flex-wrap align-content-center">
                <input
                  type="range"
                  className="w-100"
                  min="0"
                  max="100"
                  step="1"
                  value={genderRatio}
                  onChange={handleGenderSliderChange}
                  onMouseUp={handleGenderSliderRelease}
                  onTouchEnd={handleGenderSliderRelease}
                  id="gender-ratio"
                />
                <div className="d-flex labels w-100 justify-content-between">
                  <div>More Male</div>
                  <div>More Female</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Country (simplified select for demo) */}
        <LocationDropdown
          onChange={(loc) => handleLocationChange(loc)}
          displayName={locDisplayName}
        />

        {/* Follower Min */}
        <div className="mb-3">
          <label>Influencer Follower Range</label>
          <div className="row">
            <div className="col-12 col-md-6 position-relative">
              <small className="muted form-small-label">At least</small>
              <input
                value={form.follower_min}
                onChange={(e) =>
                  handleInputChange(
                    "follower_min",
                    parseInt(e.target.value) || 0
                  )
                }
                type="number"
                min="0"
                placeholder="0"
                className="form-control outline-0"
                id="follower_min"
                name="follower_min"
              />
              <small id="follower_min_error" className="text-danger error">
                {errors.follower_min}
              </small>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label>Influencer Average Number of Post Likes</label>
          <div className="row">
            <div className="col-12 col-md-6 position-relative">
              <small className="muted form-small-label">At least</small>
              <input
                value={form.likes_min}
                onChange={(e) =>
                  handleInputChange("likes_min", parseInt(e.target.value) || 0)
                }
                className="form-control outline-0"
                type="number"
                min="0"
                placeholder="0"
                id="likes_min"
                name="likes_min"
              />
              <small id="likes_min_error" className="text-danger error"></small>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label>Influencer average number of impressions per story</label>
          <div className="row">
            <div className="col-12 col-md-6 position-relative">
              <small className="muted form-small-label">At least</small>
              <input
                value={form.story_impressions_min}
                onChange={(e) =>
                  handleInputChange(
                    "story_impressions_min",
                    parseInt(e.target.value) || 0
                  )
                }
                className="form-control outline-0"
                type="number"
                min="0"
                placeholder="0"
                id="story_impressions_min"
                name="story_impressions_min"
              />
              <small
                id="story_impressions_min_error"
                className="text-danger error"
              ></small>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="mb-3">
          <label>Influencer Average Engagement Rate</label>
          <div className="row">
            <div className="col-12 col-md-6">
              <select
                value={form.ad_campaign_engagement_range_id}
                onChange={(e) =>
                  handleInputChange(
                    "ad_campaign_engagement_range_id",
                    parseInt(e.target.value) || null
                  )
                }
                name="ad_campaign_engagement_range_id"
                className="form-control outline-0"
              >
                {data?.engagement_ranges?.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
              <small
                id="ad_campaign_engagement_range_id_error"
                className="text-danger error"
              >
                {errors.ad_campaign_engagement_range_id}
              </small>
            </div>
          </div>
        </div>
        {/* Likes, Story Impressions, Engagement – repeat pattern */}

        {/* Draft Date & Approval */}
        <div className="mb-3">
          <div className="row">
            <div className="col-md-6">
              <label htmlFor="draft_date">Draft Date (Optional)</label>
              <input
                value={form.draft_date}
                onChange={(e) =>
                  handleInputChange("draft_date", e.target.value)
                }
                type="date"
                className="form-control outline-0"
                id="draft_date"
                name="draft_date"
              />
              <small id="draft_date_error" className="text-danger error">
                {errors.draft_date}
              </small>
            </div>
            <div className="col-md-6 mt-2 mt-md-0">
              <label htmlFor="is_approval_required" className="ml-md-3">
                Approve Each Influencer
              </label>
              <span
                className="ms-2"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="This allows you to approve each influencer that accepts your offer prior to allowing them to participate in your campaign"
              >
                <i className="bi bi-info-circle-fill"></i>
              </span>
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="is_approval_required"
                  checked={form.is_approval_required}
                  onChange={(e) =>
                    handleInputChange("is_approval_required", e.target.checked)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Publishing Date */}
        <div className="mb-3">
          <div className="row">
            <div className="col-12 col-md-6">
              <label>Publish from</label>
              <input
                value={form.publish_from}
                onChange={(e) =>
                  handleInputChange("publish_from", e.target.value)
                }
                type="date"
                className="form-control outline-0"
                id="date_range"
                name="publish_from"
              />
              <small id="publish_from_error" className="text-danger error">
                {errors.publish_from}
              </small>
            </div>
            <div className="col-12 col-md-6">
              <label>Publish until</label>
              <input
                value={form.publish_until}
                onChange={(e) =>
                  handleInputChange("publish_until", e.target.value)
                }
                type="date"
                className="form-control outline-0"
                id="date_range"
                name="publish_until"
              />
              <small id="publish_until_error" className="text-danger error">
                {errors.publish_until}
              </small>
            </div>
          </div>
        </div>

        {/* Deliverable */}
        <div className="mb-3">
          <label>Deliverable Type</label>
          <div className="row">
            <div className="col-12 col-md-6">
              <select
                value={form.ad_campaign_deliverable_id}
                onChange={(e) =>
                  handleInputChange(
                    "ad_campaign_deliverable_id",
                    parseInt(e.target.value) || null
                  )
                }
                className="form-control outline-0"
              >
                <option value="" hidden disabled>
                  Select Deliverable
                </option>
                {data?.deliverables?.map((d_type) => (
                  <option key={d_type.id} value={d_type.id}>
                    {d_type.name}
                  </option>
                ))}
              </select>
              <small
                id="ad_campaign_deliverable_id_error"
                className="text-danger error"
              >
                {errors.ad_campaign_deliverable_id}
              </small>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="row">
            <div className="col-12 col-md-6">
              <label>Price Per Post</label>
              <input
                value={price}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                type="text"
                inputMode="decimal"
                className="form-control outline-0"
                id="price"
                name="price"
                min="5"
                placeholder={showImpressionsCap ? "" : "$5 minimum"}
                disabled={isEditMode}
              />
              <small id="price_error" className="text-danger error">
                {errors.price}
              </small>
            </div>
          </div>
        </div>

        {!!parseFloat(price) && !isEditMode && (
          <>
            <div className="mb-3">
              <label>Maximum Budget (${maxBudget})</label>
              <div className="row">
                <div className="col-12">
                  <input
                    type="range"
                    className="w-100"
                    min={parseFloat(price) || 0}
                    step={parseFloat(price) || 1}
                    value={maxBudget}
                    onChange={(e) => {
                      setMaxBudget(parseFloat(e.target.value));
                    }}
                    max="10000"
                    disabled={isEditMode}
                  />
                  <small id="price_error" className="text-danger error">
                    {errors.price}
                  </small>
                </div>
              </div>
              <div className="row">
                <div className="col-12 d-flex justify-content-between mt-2">
                  <small>${parseFloat(price)}</small>
                  <small>$10000</small>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Description */}
        <div className="mb-3">
          <label>Campaign Description</label>
          <div className="editor">
            <div ref={quillContainerRef} />
          </div>
          <textarea
            value={form.description}
            className="d-none"
            id="description"
            name="description"
            onChange={() => {}}
          />
          <small id="description_error" className="text-danger error">
            {errors.description}
          </small>
        </div>

        {/* Link */}
        {showLinkInput && (
          <div className="mb-3 permalink-section">
            <label>Provide Link to Content Below</label>
            <input
              value={form.content_link}
              onChange={(e) =>
                handleInputChange("content_link", e.target.value)
              }
              type="text"
              className="form-control outline-0"
              id="link"
              name="link"
              placeholder="Insert link here"
            />
            <small id="link_error" className="text-danger error">
              {errors.content_link}
            </small>
          </div>
        )}

        <div className="text-center">
          <button
            className="btn btn-next btn-secondary"
            type="submit"
            form="campaign-form"
          >
            {isEditMode ? "UPDATE CAMPAIGN" : "CREATE CAMPAIGN"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CampaignForm;
