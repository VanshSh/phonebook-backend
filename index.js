const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.static("build"));
app.use(express.json());
app.use(cors());

const logger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    JSON.stringify(req.body),
  ].join(" ");
});
app.use(logger);

let persons = [
  {
    id: 1,
    name: "Arto Helas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// To get all the data of the persons
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

// To send the data for the info page
app.get("/info", (req, res) => {
  const date = new Date();
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`
  );
});

// To get the data of a single person
app.get("/api/persons/:id", (req, res) => {
  const params = req.params.id;
  const person = persons.find((person) => person.id === Number(params));
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

// To delete a person
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

// To add a new person
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
app.post("/api/persons", (req, res) => {
  const body = req.body;
  const nameExists = persons.find((person) => person.name === body.name);
  if (!body.name || !body.number) {
    res.status(400).json({
      error: "content missing",
    });
  } else if (nameExists) {
    res.status(400).json({
      error: "name must be unique",
    });
  } else {
    const newPerson = {
      id: getRandomInt(100000000),
      name: body.name,
      number: body.number,
    };
    persons = persons.concat(newPerson);
    res.json(newPerson);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
