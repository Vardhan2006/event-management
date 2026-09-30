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
      page: 1, // Reset to page 1 on filter change
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
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse venues</h1>
          <p className="page-subtitle">
            Discover spaces and request bookings for your next event.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div className="grid grid-3" style={{ gap: 12 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="q">Search</label>
            <input
              id="q"
              name="q"
              type="text"
              className="form-input"
              placeholder="Name or location..."
              value={filters.q}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">Location</label>
            <select
              id="location"
              name="location"
              className="form-select"
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

          <div className="form-group">
            <label className="form-label" htmlFor="sort">Sort By</label>
            <select
              id="sort"
              name="sort"
              className="form-select"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-3" style={{ gap: 12, marginTop: 12 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="minCapacity">Min Capacity</label>
            <input
              id="minCapacity"
              name="minCapacity"
              type="number"
              min="0"
              className="form-input"
              placeholder="e.g. 50"
              value={filters.minCapacity}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="minPrice">Min Price ($)</label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min="0"
              className="form-input"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="maxPrice">Max Price ($)</label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min="0"
              className="form-input"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {loading && <Loader label="Loading venues..." />}

      {!loading && error && (
        <div className="card">
          <div className="card-title">Error</div>
          <div className="card-subtitle">{error}</div>
        </div>
      )}

      {!loading && !error && venues.length === 0 && (
        <div className="card">
          <div className="card-title">No venues found</div>
          <div className="card-subtitle">
            Try adjusting your search filters to find available venues.
          </div>
        </div>
      )}

      {!loading && !error && venues.length > 0 && (
        <>
          <div className="grid grid-3">
            {venues.map((venue) => (
              <VenueCard key={venue?._id || venue?.id} venue={venue} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span className="text-sm text-muted">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total venues)
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-ghost"
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
