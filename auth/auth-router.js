const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../users/users-model');


router.post('/register', (req, res) => {
  // implement registration
  const credentials = req.body;

  if(isValid(credentials)) {
    const rounds = process.env.BCRYPT_ROUNDS || 8;
    const allow = bcryptjs.hashSync(credentials.password, rounds);

    credentials.password = allow;

    // save user
    Users.add(credentials)
      .then(user => {
        res.status(201).json({ data: user });
      })
      .catch(error => {
        res.status(500).json({ message: error.message });
      });
  } else {
    res.status(400).json({
      message: "Please provide a valid username and password.",
    });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (isValid(req.body)) {
    Users.findBy({ username: username })
      .then(([user]) => {
        if (user && bcryptjs.compareSync(password, user.password)) {
          const token = createToken(user);
          res.status(200).json({ message: "API VISIBLE!", token });
        } else {
          res.status(401).json({ message: "Invalid credentials, please try again." });
        }
      })
      .catch(error => {
        res.status(500).json({ message: error.message });
      });
  } else {
    res.status(400).json({
      message: "Please provide a valid username and password.",
    });
  }
});

function createToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role
  }

  const secret = constants.jwtSecret;

  const options = {
    expiresIn: '1d'
  }

  return jwt.sign(payload, secret, options);
}

module.exports = router;

module.exports = router;
