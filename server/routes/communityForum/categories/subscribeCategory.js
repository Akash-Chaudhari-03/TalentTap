const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verifyToken = require('../../utils/verifytokens');
const Category = require('../../../schema/category');
const User = require('../../../schema/users');
const logger = require('../../../../logger');
const path = require('path');

const filename = path.basename(__filename);

// Subscribe to a category API with token verification and validations
router.post('/category', [
    verifyToken, // Token verification middleware
    body('categoryID').notEmpty().withMessage('Category ID cannot be empty'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { categoryID } = req.body;
    const userID = req.user.userID; // Assuming userID is added to req.user during token verification

    try {
        // Find the category by categoryID
        const category = await Category.findOne({ categoryID });

        if (!category) {
            logger.error({ message: `Category not found for categoryID: ${categoryID}`, filename });
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if the user is already subscribed
        const isAlreadySubscribed = category.usersSubscribed.some(user => user.userId === userID && user.isSubscribed);

        if (isAlreadySubscribed) {
            logger.info({ message: `User ${userID} is already subscribed to category ${categoryID}`, filename });
            return res.status(400).json({ error: 'User is already subscribed to this category' });
        }

        // Add the user to the usersSubscribed array
        category.usersSubscribed.push({
            userId: userID,
            subscriptionDate: new Date(),
            isSubscribed: true
        });

        category.updatedAt = new Date();
        await category.save();

        logger.info({ message: `User ${userID} subscribed to category ${categoryID}`, filename });
        res.status(201).json({ message: 'Subscribed to category successfully' });
    } catch (error) {
        logger.error({ message: `Error subscribing to category ${categoryID} for user ${userID}: ${error.message}`, filename });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;