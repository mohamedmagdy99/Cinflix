const express = require("express");
const moviesController = require("./../Controllers/moviesController");
const userController = require("./../Controllers/usersController");
const router = express.Router();

router
  .route("/highest-rated")
  .get(moviesController.getHighestRated, moviesController.getAllMovies);

router.route("/movie-stats").get(moviesController.getMovieStats);
router.route("/movie-by-genre/:genre").get(moviesController.getMovieByGenre);
router
  .route("/")
  .get(userController.protect, moviesController.getAllMovies)
  .post(moviesController.addNewMovie);

router
  .route("/:id")
  .get(moviesController.getSingleMovie)
  .patch(moviesController.updateMovie)
  .delete(
    userController.protect,
    userController.restrict("admin"),
    moviesController.deleteMovie
  );

module.exports = router;
