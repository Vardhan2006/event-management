import { useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import VenueCard from "../components/venues/VenueCard";
import venueService from "../services/venueService";

function Venues() {
  const [venues, setVenues] = useState([]);
  const [meta, setMeta] = useState({ locations: [], minPrice: 0, maxPrice: 0, maxCapacity: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    q: "",
    location: "",
    minCapacity: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    async function loadMeta() {
      try {
        const metaData = await venueService.getVenuesMeta();
        setMeta(metaData);
      } catch {
        // non-blocking fallback
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function loadVenues() {
      try {
        setLoading(true);
        setError("");

        const queryParams = {};
        if (filters.q.trim()) queryParams.q = filters.q.trim();
        if (filters.location.trim()) queryParams.location = filters.location.trim();
        if (filters.minCapacity !== "") queryParams.minCapacity = Number(filters.minCapacity);
        if (filters.minPrice !== "") queryParams.minPrice = Number(filters.minPrice);
        if (filters.maxPrice !== "") queryParams.maxPrice = Number(filters.maxPrice);
        if (filters.sort) queryParams.sort = filters.sort;
        queryParams.page = filters.page;
        queryParams.limit = filters.limit;

        const res = await venueService.getVenues(queryParams);
        setVenues(Array.isArray(res.data) ? res.data : []);
        setPagination({
          page: res.page,
          limit: res.limit,
          totalCount: res.totalCount,
          totalPages: res.totalPages,
        });
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message || "We couldn't load venues right now.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadVenues();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      q: "",
      location: "",
      minCapacity: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="container stack-lg" style={{ paddingTop: 40, paddingBottom: 64 }}>
      {/* Header */}
      <div>
        <span className="eyebrow">Venue Catalog</span>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", marginTop: 4 }}>Browse Venues</h1>
        <p className="text-muted">Discover perfect spaces and request date reservations for your next event.</p>
      </div>

      {/* Filter Bar Card */}
      <div className="filter-bar-card stack">
        <div className="filter-grid">
          <div className="field">
            <label htmlFor="q">Search Keyword</label>
            <input
              id="q"
              name="q"
              type="text"
              className="input"
              placeholder="Name or location..."
              value={filters.q}
              onChange={handleFilterChange}
            />
          </div>

          <div className="field">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              name="location"
              className="select"
              value={filters.location}
              onChange={handleFilterChange}
            >
              <option value="">All Locations</option>
              {meta.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="sort">Sort Order</label>
            <select
              id="sort"
              name="sort"
              className="select"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="minCapacity">Min Capacity</label>
            <input
              id="minCapacity"
              name="minCapacity"
              type="number"
              min="0"
              className="input"
              placeholder="e.g. 50"
              value={filters.minCapacity}
              onChange={handleFilterChange}
            />
          </div>

          <div className="field">
            <label htmlFor="maxPrice">Max Price ($)</label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min="0"
              className="input"
              placeholder="Max $/day"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetFilters} style={{ height: 48 }}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results State */}
      {loading && <Loader label="Searching available venues..." />}

      {!loading && error && (
        <div className="alert alert-danger">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && venues.length === 0 && (
        <div className="empty-state">
          <h3>No Venues Found</h3>
          <p className="text-muted">No venues match your selected filters. Try broadening your location or capacity criteria.</p>
          <button type="button" className="btn btn-primary" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      {!loading && !error && venues.length > 0 && (
        <>
          <div className="grid-3">
            {venues.map((venue) => (
              <VenueCard key={venue?._id || venue?.id} venue={venue} />
            ))}
          </div>

          {/* Pagination */}
          <div className="row-between" style={{ paddingTop: 16, borderTop: "1px solid var(--line-soft)" }}>
            <span className="text-sm text-muted">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total venues)
            </span>

            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${p === pagination.page ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => handlePageChange(p)}
                  style={{ minWidth: 36, padding: "8px 12px" }}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Venues;
