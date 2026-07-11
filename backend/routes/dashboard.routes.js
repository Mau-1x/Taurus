const express = require("express");
const DashboardController = require(
  "../controllers/dashboard.controller"
);

const router = express.Router();

router.get("/", DashboardController.obtenerDashboard);

module.exports = router;