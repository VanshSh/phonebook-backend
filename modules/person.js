const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;
console.log("connecting to", url);

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((err) => {
    console.log("error connecting to MongoDB:", err.message);
  });

// Custom validator function
const phoneNumberValidator = function (value) {
  const phoneNumberRegex = /^\d{2,3}-\d+$/; // Regex pattern for validation

  if (!phoneNumberRegex.test(value)) {
    return false; // Invalid phone number format
  }

  return true; // Valid phone number format
};

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: phoneNumberValidator,
      message:
        "Invalid phone number format. eg: 09-1234556 and 040-22334455 are valid phone numbers",
    },
    minlength: 8,
    required: true,
  },
});

phonebookSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", phonebookSchema);

// Step 1 => require mongoose
// Step 2 => Connect to the database
// Step 3 => Create a schema
// Step 4 => Create a model and export it
