const mongoose = require("mongoose");
const fs = require("fs");
const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      maxlength: [100, "Movie name must not have more then 100 characters"],
      minlength: [4, "Movie name must have at least 4 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "duration is required"],
    },
    ratings: {
      type: Number,
      validate: function (value) {
        return value >= 1 && value <= 10;
      },
    },
    totalRating: {
      type: Number,
    },
    releaseYear: {
      type: Number,
      required: [true, "releas year is required"],
    },
    releasDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    genres: {
      type: [String],
      required: [true, "genres is required"],
      /* enum: {
        values: [
          "Action",
          "Adventure",
          "Sci-Fi",
          "Thriller",
          "Crime",
          "Drama",
          "Comdy",
          "Romance",
          "Biography",
        ],
        message: "This genre does not exist",
      }, */
    },
    directors: {
      type: [String],
      required: [true, "directors is required"],
    },
    coverImage: {
      type: String,
      required: [true, "cover image is required"],
    },
    actros: {
      type: [String],
      required: [true, "actros is required"],
    },
    price: {
      type: Number,
      required: [true, "price is required"],
    },
    createdBy: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});
movieSchema.pre("save", function (next) {
  this.createdBy = "magdy";
  next();
});
movieSchema.post("save", (doc, next) => {
  const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy} at time ${doc.createdAt}\n`;
  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err);
  });
  next();
});
// movieSchema.pre(/^find/, function (next) {
//   this.find({ releaseDate: { $lte: Date.now() } });
//   next();
// });
movieSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: { releaseYear: { $lte: 2023 } },
  });

  console.log(this.pipeline()[0]);
  next();
});
const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
