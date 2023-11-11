const Movie = require("./../Model/movieModel");
const Apifeatures = require("./../Utils/ApiFeatures");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const CustomError = require("./../Utils/CustomError");
exports.getHighestRated = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratings";
  next();
};

exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {
  const features = new Apifeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .fields()
    .pagination();
  const movies = await features.query;
  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies,
    },
  });
});

exports.getSingleMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    const err = new CustomError(
      `can't found a movie with id : ${req.params.id} in the database`,
      404
    );
    return next(err);
  }
  res.status(200).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.addNewMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.updateMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!movie) {
    const err = new CustomError(
      `can't found a movie with id : ${req.params.id} in the database`,
      404
    );
    return next(err);
  }
  res.status(200).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) {
    const err = new CustomError(
      `can't found a movie with id : ${req.params.id} in the database`,
      404
    );
    return next(err);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.getMovieStats = asyncErrorHandler(async (req, res, next) => {
  const stats = await Movie.aggregate([
    { $match: { ratings: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$releaseYear",
        avgRatings: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        totPrice: { $sum: "$price" },
        movieCount: { $sum: 1 },
      },
    },
    { $sort: { minPrice: 1 } },
  ]);
  res.status(200).json({
    status: "success",
    count: stats.length,
    data: {
      stats,
    },
  });
});
exports.getMovieByGenre = asyncErrorHandler(async (req, res, next) => {
  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        movieCount: { $sum: 1 },
        movies: { $push: "$name" },
      },
    },
    { $addFields: { genre: "$_id" } },
    { $project: { _id: 0 } },
    { $sort: { movieCount: -1 } },
    { $match: { genre: genre } },
  ]);
  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies,
    },
  });
});
