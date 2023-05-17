const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const server = express();
const mongoClient = new MongoClient(
  "mongodb+srv://titas:ho0L6LpatTHxf9L6@db.xoxi5ar.mongodb.net/"
);
server.use(express.json());
server.use(cors());

server.get("/rental-cars", async (_, res) => {
  try {
    const mongoCluster = await mongoClient.connect();
    const rentalCars = await mongoCluster
      .db("Rental")
      .collection("RentalCars")
      .find()
      .sort({
        carBrand: -1,
      }) // 1 means that ascending, while -1 means that descending
      .toArray();
    mongoCluster.close();

    res.send(rentalCars);
  } catch (error) {
    console.log(error.message);
    res.status(500).end();
  }
});

server.post("/register-car", async (req, res) => {
  try {
    const payload = req.body;
    const newRentalCar = {
      owner: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
      },
      carBrand: payload.carBrand,
    };
    const mongoCluster = await mongoClient.connect();
    const response = await mongoCluster
      .db("Rental")
      .collection("RentalCars")
      .insertOne(newRentalCar);
    mongoCluster.close();

    res.status(201).send(response);
  } catch (error) {
    res.status(500).end();
  }
});

server.get("/rental-cars/:carBrand", async (req, res) => {
  try {
    const mongoCluster = await mongoClient.connect();
    const rentalCarsByBrand = await mongoCluster
      .db("Rental")
      .collection("RentalCars")
      // .find({ carBrand: req.params.carBrand }) // get specific car brand rental cars, but it's case sensitive e.g. toyota will not match with Toyota
      .find({ carBrand: { $regex: req.params.carBrand, $options: "i" } }) // case insensitive, 'i' means case insensitive e.g. Toyota will match with toyota
      .toArray();

    res.send(rentalCarsByBrand);
  } catch (error) {
    console.error(error.message);
    res.status(500).end();
  }
});

server.get("/rental-cars/by-id/:id", async (req, res) => {
  try {
    const mongoCluster = await mongoClient.connect();
    const rentalCarsByBrand = await mongoCluster
      .db("Rental")
      .collection("RentalCars")
      .find(new ObjectId(req.params.id))
      .toArray();

    res.send(rentalCarsByBrand);
  } catch (error) {
    console.error(error.message);
    res.status(500).end();
  }
});

server.get("/car-brands", (_, res) => {
  const carBrands = rentalCars.map((rentalCar) => {
    return rentalCar.carBrand;
  });
  const uniqueCarBrands = [...new Set(carBrands)];

  res.send(uniqueCarBrands);
});

server.listen(8080, () => console.log("server is running at 8080"));
