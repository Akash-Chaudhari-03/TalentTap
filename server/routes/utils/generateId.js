function generateUniqueId(type, username) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 6);
    let prefix = '';

    switch (type) {
        case 'certificate':
            prefix = 'CERT';
            break;
        case 'college':
            prefix = 'COLL';
            break;
        case 'skill':
            prefix = 'SKIL';
            break;
        case 'project':
            prefix = 'PROJ';
            break;
        default:
            throw new Error('Invalid entity type');
    }

    // Generate the ID with the specified format
    const generatedId = `${prefix}-${username.substring(0, 4).toUpperCase()}-${timestamp}-${randomString}`;
    return generatedId;
}

module.exports = generateUniqueId;