const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");
const { parseDateOnly } = require("../utils/dates");

async function seedDatabase() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed operation aborted: Refusing to run seed in production environment!");
  }

  if (process.env.SEED_CONFIRM !== "yes") {
    throw new Error("Seed operation aborted: Missing SEED_CONFIRM=yes environment variable!");
  }

  // Clear existing collections
  await User.deleteMany({});
  await Venue.deleteMany({});
  await Booking.deleteMany({});

  const devPassword = "Password123!";
  const passwordHash = await bcrypt.hash(devPassword, 12);

  // Create Users & Owners
  const owner1 = await User.create({
    name: "Owner One",
    email: "owner1@example.com",
    passwordHash,
    role: "owner",
  });

  const owner2 = await User.create({
    name: "Owner Two",
    email: "owner2@example.com",
    passwordHash,
    role: "owner",
  });

  const user1 = await User.create({
    name: "User One",
    email: "user1@example.com",
    passwordHash,
    role: "user",
  });

  const user2 = await User.create({
    name: "User Two",
    email: "user2@example.com",
    passwordHash,
    role: "user",
  });

  // Create Venues
  const svHall = await Venue.create({
    name: "SV Hall",
    location: "Hyderabad",
    capacity: 5000,
    pricePerDay: 38000,
    description: "Spacious hall for grand events and weddings.",
    services: ["Catering", "Decoration", "Security"],
    images: [],
    ownerId: owner1._id,
  });

  const bpjHall = await Venue.create({
    name: "BPJ Hall",
    location: "Hyderabad",
    capacity: 3000,
    pricePerDay: 5000000,
    description: "Ultra luxury grand convention center.",
    services: ["Catering", "Decoration"],
    images: [],
    ownerId: owner1._id,
  });

  const grandHall = await Venue.create({
    name: "Grand Hall",
    location: "Hyderabad",
    capacity: 500,
    pricePerDay: 80000,
    description: "Elegant hall for medium scale functions.",
    services: ["Catering", "Decoration"],
    images: [],
    ownerId: owner2._id,
  });

  // Create ~8 Bookings across all 4 statuses with future dates
  const today = new Date();
  const getFutureDateStr = (daysAhead) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + daysAhead);
    return d.toISOString().split("T")[0];
  };

  const bookingsData = [
    {
      userId: user1._id,
      venueId: svHall._id,
      ownerId: svHall.ownerId,
      title: "User 1 SV Hall Approved Event",
      eventDate: parseDateOnly(getFutureDateStr(5)),
      totalPrice: svHall.pricePerDay,
      status: "approved",
      venueSnapshot: { name: svHall.name, location: svHall.location },
    },
    {
      userId: user2._id,
      venueId: svHall._id,
      ownerId: svHall.ownerId,
      title: "User 2 SV Hall Pending Event",
      eventDate: parseDateOnly(getFutureDateStr(10)),
      totalPrice: svHall.pricePerDay,
      status: "pending",
      venueSnapshot: { name: svHall.name, location: svHall.location },
    },
    {
      userId: user1._id,
      venueId: bpjHall._id,
      ownerId: bpjHall.ownerId,
      title: "User 1 BPJ Hall Approved Event",
      eventDate: parseDateOnly(getFutureDateStr(7)),
      totalPrice: bpjHall.pricePerDay,
      status: "approved",
      venueSnapshot: { name: bpjHall.name, location: bpjHall.location },
    },
    {
      userId: user2._id,
      venueId: bpjHall._id,
      ownerId: bpjHall.ownerId,
      title: "User 2 BPJ Hall Rejected Event",
      eventDate: parseDateOnly(getFutureDateStr(12)),
      totalPrice: bpjHall.pricePerDay,
      status: "rejected",
      venueSnapshot: { name: bpjHall.name, location: bpjHall.location },
    },
    {
      userId: user1._id,
      venueId: grandHall._id,
      ownerId: grandHall.ownerId,
      title: "User 1 Grand Hall Pending Event",
      eventDate: parseDateOnly(getFutureDateStr(15)),
      totalPrice: grandHall.pricePerDay,
      status: "pending",
      venueSnapshot: { name: grandHall.name, location: grandHall.location },
    },
    {
      userId: user2._id,
      venueId: grandHall._id,
      ownerId: grandHall.ownerId,
      title: "User 2 Grand Hall Approved Event",
      eventDate: parseDateOnly(getFutureDateStr(20)),
      totalPrice: grandHall.pricePerDay,
      status: "approved",
      venueSnapshot: { name: grandHall.name, location: grandHall.location },
    },
    {
      userId: user1._id,
      venueId: grandHall._id,
      ownerId: grandHall.ownerId,
      title: "User 1 Grand Hall Cancelled Event",
      eventDate: parseDateOnly(getFutureDateStr(25)),
      totalPrice: grandHall.pricePerDay,
      status: "cancelled",
      venueSnapshot: { name: grandHall.name, location: grandHall.location },
    },
    {
      userId: user2._id,
      venueId: svHall._id,
      ownerId: svHall.ownerId,
      title: "User 2 SV Hall Rejected Event",
      eventDate: parseDateOnly(getFutureDateStr(30)),
      totalPrice: svHall.pricePerDay,
      status: "rejected",
      venueSnapshot: { name: svHall.name, location: svHall.location },
    },
  ];

  await Booking.insertMany(bookingsData);

  return {
    owners: [owner1, owner2],
    users: [user1, user2],
    venues: [svHall, bpjHall, grandHall],
    devPassword,
  };
}

if (require.main === module) {
  const path = require("path");
  require("dotenv").config({ path: path.join(__dirname, "../.env") });
  const { connectDB, closeDB } = require("../tests/setup/db");

  (async () => {
    try {
      await connectDB();
      const res = await seedDatabase();
      console.log("Database seeded successfully!");
      console.log("Dev Users & Credentials:");
      console.log("  Owner 1: owner1@example.com / " + res.devPassword);
      console.log("  Owner 2: owner2@example.com / " + res.devPassword);
      console.log("  User 1:  user1@example.com  / " + res.devPassword);
      console.log("  User 2:  user2@example.com  / " + res.devPassword);
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error("Seeding failed:", err.message);
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase };
