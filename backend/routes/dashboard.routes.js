const express = require("express");

const DashboardController = require(
  "../controllers/dashboard.controller"
);

const {
  verificarToken,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(verificarToken);

router.get(
  "/",
  DashboardController.obtenerDashboard
);

module.exports = router;