const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verifyToken = require('../../utils/verifytokens');
const Category = require('../../../schema/category');
const User = require('../../../schema/users');
const logger = require('../../../../logger');
const path = require('path');

// Manually set the filename for logging purposes
const filename = path.basename(__filename);

// Unsubscribe from a category API with token verification and validations
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

        // Find the user in the usersSubscribed array
        const userSubscription = category.usersSubscribed.find(user => user.userId === userID && user.isSubscribed);

        if (!userSubscription) {
            logger.info({ message: `User ${userID} is not subscribed to category ${categoryID}`, filename });
            return res.status(400).json({ error: 'User is not subscribed to this category' });
        }

        // Mark the subscription as false
        userSubscription.isSubscribed = false;
        category.updatedAt = new Date();
        await category.save();

        logger.info({ message: `User ${userID} unsubscribed from category ${categoryID}`, filename });
        res.status(200).json({ message: 'Unsubscribed from category successfully' });
    } catch (error) {
        logger.error({ message: `Error unsubscribing from category ${categoryID} for user ${userID}: ${error.message}`, filename });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;