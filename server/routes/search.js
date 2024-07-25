const express = require('express');
const router = express.Router();
const userModel = require('../schema/users');
const verifyToken = require('../routes/utils/verifytokens');
const logger = require('../../logger');

// Default pagination constant
const DEFAULT_RESULTS_PER_PAGE = 15;

router.post('/', verifyToken, async (req, res) => {
    try {
        const { skills, location, experience, rating, page = 1, perPage = DEFAULT_RESULTS_PER_PAGE } = req.body;
        const filters = {};

        if (skills && Array.isArray(skills)) {
            filters['skillDetail.skill'] = { $in: skills };
        }

        if (location) {
            filters['personalDetail.location'] = location;
        }

        if (experience) {
            const { min: minExperience, max: maxExperience } = experience;
            if (minExperience != null && maxExperience != null) {
                filters['skillDetail.experience'] = { $gte: parseInt(minExperience), $lte: parseInt(maxExperience) };
            } else if (minExperience != null) {
                filters['skillDetail.experience'] = { $gte: parseInt(minExperience) };
            } else if (maxExperience != null) {
                filters['skillDetail.experience'] = { $lte: parseInt(maxExperience) };
            }
        }

        if (rating) {
            const { min: minRating, max: maxRating } = rating;
            if (minRating != null && maxRating != null) {
                filters['rating'] = { $gte: parseFloat(minRating), $lte: parseFloat(maxRating) };
            } else if (minRating != null) {
                filters['rating'] = { $gte: parseFloat(minRating) };
            } else if (maxRating != null) {
                filters['rating'] = { $lte: parseFloat(maxRating) };
            }
        }

        const parsedPage = parseInt(page);
        const parsedPerPage = parseInt(perPage);

        if (isNaN(parsedPage) || parsedPage < 1) {
            return res.status(400).json({ error: 'Invalid page value' });
        }

        if (isNaN(parsedPerPage) || parsedPerPage < 1) {
            return res.status(400).json({ error: 'Invalid perPage value' });
        }

        const users = await userModel.find(filters)
            .skip((parsedPage - 1) * parsedPerPage)
            .limit(parsedPerPage)
            .sort({ rating: -1 }); // Sort by rating, highest first

        if (users.length === 0) {
            return res.status(404).json({ message: 'No user found.' });
        }

        const experiencedUsers = users.filter(user => user.skillDetail.some(skill => skill.experience > 1));
        const newUsers = users.filter(user => user.skillDetail.every(skill => skill.experience <= 1));

        const finalResults = [
            ...experiencedUsers.slice(0, Math.floor(parsedPerPage * 0.7)),
            ...newUsers.slice(0, Math.ceil(parsedPerPage * 0.3))
        ].map(user => ({
            username: user.personalDetail.username,
            location: user.personalDetail.location,
            rating: user.rating, // Corrected rating location
            skills: user.skillDetail.map(skill => skill.skill), // List of skills
            isNew: user.skillDetail.every(skill => skill.experience < 2) // New field indicating if the user is new
        }));

        if (finalResults.length === 0) {
            return res.status(404).json({ message: 'No user found.' });
        }

        res.status(200).json({ users: finalResults });
    } catch (error) {
        logger.error(`Error during user search: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
