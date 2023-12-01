const PayPostType = Object.freeze({
    TICKET: 0,
    RESORT: 1,
    RESTAURANT: 2
});

const UserRedirects = Object.freeze({
    0: 'profile',
    4: 'pos',
    11: 'admin',
    17: 'mgr' 
});

module.exports = {
    PayPostType,
    UserRedirects
};