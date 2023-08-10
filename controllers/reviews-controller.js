const { Reviews } = require("../models/index");

const getAllReviews = async (req, res, next) => {
    try {
        const result = await Reviews.find();
        const sortResult = result.sort(function (a, b) {
            return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
        if (req.query.page === undefined) {
            return res.status(200).json(sortResult);
        }
        return res.status(200).json(sortResult.slice((req.query.page - 1) * req.query.limit, req.query.page * req.query.limit));
    } catch (error) {
        return next(error);
    }
};

const setReview = async (req, res) => {
    try {
        const review = {
            review: req.body.review,
            rating: req.body.rating,
            owner: req.user.id,
            name: req.user.name,
        };

        const result = await Reviews.create(review);
        return res.status(201).json({
            review: result.review,
            rating: result.rating,
            name: result.name,
        });
    } catch (error) {
        const errorMessage = error.message;
        return res.status(400).json({ message: errorMessage });
    }
};

const changeReview = async (req, res, next) => {
    try {
        const review = {
            review: req.body.review,
            rating: req.body.rating,
        };

        const result = await Reviews.findOneAndUpdate({ owner: req.user.id }, review, { new: true });
        if (result === null) {
            return res.status(404).json({ message: "Not found" });
        }

        return res.status(200).json({
            review: result.review,
            rating: result.rating,
            name: result.name,
        });
    } catch (error) {
        const errorMessage = error.message;
        return res.status(400).json({ message: errorMessage });
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const result = await Reviews.findOneAndDelete({ owner: req.user.id });
        if (result === null) {
            return res.status(404).json({ message: "Not found" });
        }
        return res.status(200).json({ message: "review deleted" });
    } catch (error) {
        return next(error);
    }
};

const getReview = async (req, res, next) => {
    try {
        const result = await Reviews.findOne({ owner: req.user.id });
        if (result === null) {
            return res.status(404).json({ message: "Not found" });
        }

        return res.status(200).json({
            review: result.review,
            rating: result.rating,
            name: result.name,
        });
    } catch (error) {
        const errorMessage = error.message;
        return res.status(400).json({ message: errorMessage });
    }
};

module.exports = {
    getAllReviews,
    setReview,
    changeReview,
    deleteReview,
    getReview,
};
