import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MongoDB URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;
    console.log("connected");

    connection.on("error", (error) => {
      console.log("Something is wrong in MongoDB", error);
    });
  } catch (error) {
    console.log("Something is wrong", error);
  }
};

export default connectDB;